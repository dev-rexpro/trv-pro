// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useExchangeStore from '../stores/useExchangeStore';
import CoinIcon from '../components/CoinIcon';
import MarketRow from '../components/MarketRow';
import {
    FiSearch as Search,
} from 'react-icons/fi';
import { TbFilter2Cog } from 'react-icons/tb';
import { GrDocumentTime as AlarmClock } from 'react-icons/gr';
import {
    MdLocalFireDepartment as Flame,
    MdEditNote,
    MdOutlineArrowDropUp as ArrowDropUp,
    MdOutlineArrowDropDown as ArrowDropDown,
} from 'react-icons/md';
import MarketOverview from '../components/MarketOverview';
import AnimatedPlaceholder from '../components/AnimatedPlaceholder';

const FILTERS = ['All', 'Hot', 'Top', 'New', 'Gainers', 'Losers', 'MCap', 'Turnover'];

const MarketView = () => {
    const { markets, futuresMarkets, favorites, favoriteGroups, addFavoriteGroup, deleteFavoriteGroup, setActivePage, setSearchOpen, setManageGroupsOpen } = useExchangeStore();
    const [mainTab, setMainTab] = useState('Marketplace');
    const [subTab, setSubTab] = useState('Futures');
    const [filter, setFilter] = useState('All');
    const [direction, setDirection] = useState(0);
    const [isFavSheetOpen, setIsFavSheetOpen] = useState(false);

    const updateFilter = (newFilter: string) => {
        const newIndex = FILTERS.indexOf(newFilter);
        const currentIndex = FILTERS.indexOf(filter);
        if (newIndex !== currentIndex) {
            setDirection(newIndex > currentIndex ? 1 : -1);
            setFilter(newFilter);
        }
    };

    const handleSwipe = (dir: number) => {
        if (mainTab === 'Favorites') return;
        const currentIndex = FILTERS.indexOf(filter);
        const nextIndex = currentIndex + dir;
        if (nextIndex >= 0 && nextIndex < FILTERS.length) {
            setDirection(dir);
            setFilter(FILTERS[nextIndex]);
        }
    };

    // Reset subTab when mainTab changes
    useEffect(() => {
        if (mainTab === 'Favorites') {
            setSubTab('Futures');
        } else {
            setSubTab('Futures');
        }
    }, [mainTab, favoriteGroups]);

    const filtered = useMemo(() => {
        let list = subTab === 'Futures' ? [...futuresMarkets] : [...markets];

        if (mainTab === 'Favorites') {
            if (subTab === 'Futures' || subTab === 'Spot') {
                return list.filter(m => favorites.includes(m.symbol));
            }
            const groupFavs = favoriteGroups[subTab] || favorites;
            return list.filter(m => groupFavs.includes(m.symbol));
        }

        switch (filter) {
            case 'Hot':
                // Hot is a combination of volume and price movement
                list.sort((a, b) => {
                    const scoreA = parseFloat(a.quoteVolume) * (1 + Math.abs(parseFloat(a.priceChangePercent)) / 20);
                    const scoreB = parseFloat(b.quoteVolume) * (1 + Math.abs(parseFloat(b.priceChangePercent)) / 20);
                    return scoreB - scoreA;
                });
                break;
            case 'Top':
            case 'Turnover':
                list.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
                break;
            case 'New':
                // For Binance tickers, new listings are often towards the end, but we can also use a secondary sort
                list = list.reverse().slice(0, 100);
                break;
            case 'Gainers':
                list.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
                break;
            case 'Losers':
                list.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
                break;
            case 'MCap':
                // Placeholder: Use lastPrice * volume as a proxy for 'activity' or just volume
                list.sort((a, b) => (parseFloat(b.lastPrice) * parseFloat(b.quoteVolume)) - (parseFloat(a.lastPrice) * parseFloat(a.quoteVolume)));
                break;
            default:
                list.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        }

        return list.slice(0, 50);
    }, [markets, futuresMarkets, favorites, favoriteGroups, mainTab, subTab, filter]);

    const handleAddGroup = useCallback(() => {
        const name = window.prompt("Enter new group name:");
        if (name) addFavoriteGroup(name);
    }, [addFavoriteGroup]);

    const handleCoinClick = useCallback((symbol: string) => {
        useExchangeStore.setState({ selectedCoin: symbol });
        setActivePage(subTab === 'Spot' ? 'trade' : 'futures');
    }, [setActivePage, subTab]);

    return (
        <div className="pb-24 bg-[#FDFDFD] min-h-screen font-sans">
            <div className="p-4 pt-[calc(16px+var(--safe-area-top))] flex gap-4 items-center">
                <div className="relative flex-1 flex items-center bg-[#F5F7F9] rounded-full px-4 py-2.5 cursor-pointer h-[44px]" onClick={() => setSearchOpen(true)}>
                    <Search className="text-slate-400 mr-2" size={18} />
                    <AnimatedPlaceholder className="ml-0" />
                </div>
                <div className="relative">
                    <AlarmClock size={24} strokeWidth={1.5} className="text-slate-900" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </div>
            </div>

            <div className="px-4 pt-1 flex items-center mb-4">
                <div className="flex gap-5 text-[18px] font-medium text-slate-400 overflow-x-auto no-scrollbar">
                    {['Favorites', 'Marketplace', 'Overview'].map((t) => (
                        <span
                            key={t}
                            onClick={() => setMainTab(t)}
                            className={`cursor-pointer whitespace-nowrap transition-colors ${mainTab === t ? 'text-slate-900 font-bold' : ''}`}
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {mainTab !== 'Overview' && (
                <div className="px-4 flex items-center justify-between mb-4">
                    <div className="flex gap-6 text-[15px] font-bold text-slate-400 overflow-x-auto no-scrollbar">
                        {mainTab === 'Favorites' ? (
                            ['Futures', 'Spot', ...Object.keys(favoriteGroups)].map(g => (
                                <span
                                    key={g}
                                    onClick={() => setSubTab(g)}
                                    className={`cursor-pointer pb-2 whitespace-nowrap ${subTab === g ? 'text-slate-900 border-b-2 border-slate-900' : ''}`}
                                >
                                    {g}
                                </span>
                            ))
                        ) : (
                            ['Futures', 'Spot'].map(t => (
                                <span
                                    key={t}
                                    onClick={() => setSubTab(t)}
                                    className={`cursor-pointer pb-2 ${subTab === t ? 'text-slate-900 border-b-2 border-slate-900' : ''}`}
                                >
                                    {t}
                                </span>
                            ))
                        )}
                    </div>
                    {mainTab === 'Favorites' && (
                        <div className="flex items-center gap-2">
                            <MdEditNote size={24} className="text-slate-400 mb-2 cursor-pointer" onClick={() => setManageGroupsOpen(true)} />
                        </div>
                    )}
                </div>
            )}

            {mainTab !== 'Favorites' && mainTab !== 'Overview' && (
                <div className="px-4 flex items-center justify-between mb-2 overflow-hidden relative">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar items-center pr-10 w-full py-1">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => updateFilter(f)}
                                className={`relative text-[13px] whitespace-nowrap px-3 py-0.5 transition-all outline-none ${filter === f ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}
                            >
                                {filter === f && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className="absolute inset-0 bg-[#EBEEF2] rounded-full border border-slate-200"
                                        transition={{ type: "spring", bounce: 0.1, duration: 0.25 }}
                                    />
                                )}
                                <span className={`relative ${filter === f ? 'z-10' : ''}`}>{f}</span>
                            </button>
                        ))}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#FDFDFD] via-[#FDFDFD] to-transparent pl-6 flex items-center justify-center shrink-0 pr-4">
                        <TbFilter2Cog size={18} className="text-slate-900" />
                    </div>
                </div>
            )}

            {mainTab === 'Overview' ? (
                <MarketOverview />
            ) : (
                <>
                    <div className="px-4 flex justify-between items-center text-[12px] font-bold text-slate-400 mb-2 mt-4">
                        <div className="flex items-center gap-1">
                            <span>Name</span>
                            <div className="flex flex-col -space-y-3 opacity-50">
                                <ArrowDropUp size={18} className="text-slate-400" />
                                <ArrowDropDown size={18} className="text-slate-400" />
                            </div>
                            <span className="text-slate-200 mx-0.5">/</span>
                            <span>Turnover</span>
                            <div className="flex flex-col -space-y-3 opacity-50">
                                <ArrowDropUp size={18} className="text-slate-400" />
                                <ArrowDropDown size={18} className="text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span>Last price</span>
                                <div className="flex flex-col -space-y-3 opacity-50">
                                    <ArrowDropUp size={18} className="text-slate-400" />
                                    <ArrowDropDown size={18} className="text-slate-400" />
                                </div>
                            </div>
                            <div className="w-[72px] flex items-center justify-center gap-1">
                                <span>Change</span>
                                <div className="flex flex-col -space-y-3 opacity-50">
                                    <ArrowDropUp size={18} className="text-slate-400" />
                                    <ArrowDropDown size={18} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 pb-4 overflow-hidden relative min-h-[400px] touch-pan-y">
                        <AnimatePresence mode="popLayout" custom={direction}>
                            <motion.div
                                key={`${mainTab}-${subTab}-${filter}`}
                                custom={direction}
                                variants={{
                                    enter: (d: number) => ({
                                        x: d > 0 ? '50%' : d < 0 ? '-50%' : 0,
                                        opacity: 0
                                    }),
                                    center: { x: 0, opacity: 1 },
                                    exit: (d: number) => ({
                                        x: d > 0 ? '-50%' : d < 0 ? '50%' : 0,
                                        opacity: 0
                                    })
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 400, damping: 40 },
                                    opacity: { duration: 0.15 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -60) handleSwipe(1);
                                    else if (info.offset.x > 60) handleSwipe(-1);
                                }}
                                className="w-full"
                            >
                                {filtered.map(coin => (
                                    <MarketRow
                                        key={coin.symbol}
                                        coin={coin}
                                        showPerp={subTab === 'Futures' || mainTab === 'Favorites'}
                                        onClick={() => handleCoinClick(coin.symbol)}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketView;
