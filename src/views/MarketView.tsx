// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useExchangeStore from '../stores/useExchangeStore';
import CoinIcon from '../components/CoinIcon';
import MarketRow from '../components/MarketRow';
import {
    FiSearch as Search,
    FiClock as AlarmClock,
} from 'react-icons/fi';
import {
    MdLocalFireDepartment as Flame,
    MdEditNote,
} from 'react-icons/md';

const MarketView = () => {
    const { markets, favorites, favoriteGroups, addFavoriteGroup, deleteFavoriteGroup, setActivePage, setSearchOpen, setManageGroupsOpen } = useExchangeStore();
    const [mainTab, setMainTab] = useState('Marketplace');
    const [subTab, setSubTab] = useState('Futures');
    const [filter, setFilter] = useState('All');
    const [isFavSheetOpen, setIsFavSheetOpen] = useState(false);

    // Reset subTab when mainTab changes
    useEffect(() => {
        if (mainTab === 'Favorites') {
            setSubTab('Futures');
        } else {
            setSubTab('Futures');
        }
    }, [mainTab, favoriteGroups]);

    const filtered = useMemo(() => {
        let list = [...markets];

        if (mainTab === 'Favorites') {
            if (subTab === 'Futures' || subTab === 'Spot') {
                return list.filter(m => favorites.includes(m.symbol));
            }
            const groupFavs = favoriteGroups[subTab] || favorites;
            return list.filter(m => groupFavs.includes(m.symbol));
        }

        switch (filter) {
            case 'Gainers':
                list.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
                break;
            case 'Losers':
                list.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
                break;
            case 'New':
                list = list.reverse();
                break;
            case 'Popular':
                list.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
                break;
            default:
                list.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        }

        return list.slice(0, 50);
    }, [markets, favorites, favoriteGroups, mainTab, subTab, filter]);

    const handleAddGroup = useCallback(() => {
        const name = window.prompt("Enter new group name:");
        if (name) addFavoriteGroup(name);
    }, [addFavoriteGroup]);

    const handleCoinClick = useCallback((symbol: string) => {
        useExchangeStore.setState({ selectedCoin: symbol });
        setActivePage(subTab === 'Spot' ? 'trade' : 'futures');
    }, [setActivePage, subTab]);

    return (
        <div className="pb-24 bg-white min-h-screen">
            <div className="p-4 flex gap-4 items-center">
                <div className="relative flex-1 flex items-center bg-[#F5F7F9] rounded-full px-4 py-2.5 cursor-pointer" onClick={() => setSearchOpen(true)}>
                    <Search className="text-slate-400 mr-2" size={18} />
                    <Flame className="text-orange-500 mr-2" size={16} fill="currentColor" />
                    <input
                        readOnly
                        className="w-full bg-transparent border-none text-sm font-medium outline-none placeholder:text-slate-400 cursor-pointer"
                        placeholder="Search coin, contract, or pair"
                    />
                </div>
                <div className="relative">
                    <AlarmClock size={24} strokeWidth={1.5} className="text-slate-900" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </div>
            </div>

            <div className="px-4 flex gap-5 text-[18px] font-bold text-slate-400 mb-5 pt-1 overflow-x-auto no-scrollbar items-center">
                {['Favorites', 'Marketplace', 'Opportunities', 'Data'].map(t => (
                    <span
                        key={t}
                        onClick={() => setMainTab(t)}
                        className={`cursor-pointer whitespace-nowrap ${mainTab === t ? 'text-slate-900' : ''}`}
                    >
                        {t}
                    </span>
                ))}
            </div>

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

            {mainTab !== 'Favorites' && (
                <div className="px-4 flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                    {['All', 'Gainers', 'Losers', 'New', 'Popular'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-[#F5F7F9] text-slate-500'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}

            <div className="px-4 flex justify-between text-[11px] font-medium text-slate-400 mb-2">
                <span>Name / Vol</span>
                <div className="flex gap-8">
                    <span>Last Price</span>
                    <span>24h Chg%</span>
                </div>
            </div>

            <div className="px-4 pb-4">
                {filtered.map(coin => (
                    <MarketRow
                        key={coin.symbol}
                        coin={coin}
                        showPerp={subTab === 'Futures' || mainTab === 'Favorites'}
                        onClick={() => handleCoinClick(coin.symbol)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MarketView;
