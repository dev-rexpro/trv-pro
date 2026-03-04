// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import useExchangeStore from '../stores/useExchangeStore';
import CoinIcon from '../components/CoinIcon';
import CurrencySelector from '../components/CurrencySelector';
import FavoritesBottomSheet from '../components/FavoritesBottomSheet';
import { convertAmount } from '../utils/format';
import trivLogo from '../assets/triv-logo.svg';
import {
    FiSearch as Search,
    FiFilter as Filter,
} from 'react-icons/fi';
import {
    MdLocalFireDepartment as Flame,
} from 'react-icons/md';
import { IoTicketOutline as Ticket } from 'react-icons/io5';
import { PiHeadset as Headphones } from 'react-icons/pi';
import { LuUser as User } from 'react-icons/lu';
import { RxTriangleDown as ChevronDown } from 'react-icons/rx';
import { FiEye as Eye, FiGift as Gift, FiGrid as Grid } from 'react-icons/fi';

const HomeView = () => {
    const { balance, todayPnl, pnlPercent, markets, setActivePage, setSearchOpen, homeFilter, setHomeFilter, favorites, currency, rates, setDepositOptionOpen } = useExchangeStore();
    const [isFavSheetOpen, setIsFavSheetOpen] = useState(false);
    const [favSubFilter, setFavSubFilter] = useState('All');

    const filteredMarkets = useMemo(() => {
        let list = [...markets];
        switch (homeFilter) {
            case 'Favorites':
                let favs = list.filter(m => favorites.includes(m.symbol));
                if (favSubFilter === 'Futures') return favs;
                if (favSubFilter === 'Spot') return favs;
                return favs;
            case 'New':
                return list.slice().reverse().slice(0, 10);
            case 'Popular':
            case 'Highest Volume':
                return list.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
            case 'Gainers':
                return list.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
            case 'Losers':
                return list.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
            default:
                return list;
        }
    }, [markets, homeFilter, favorites, favSubFilter]);

    const handleCoinClick = useCallback((symbol: string) => {
        useExchangeStore.getState().selectedCoin = symbol;
        useExchangeStore.setState({ selectedCoin: symbol });
        setActivePage('trade');
    }, [setActivePage]);

    // Convert balance to selected currency
    const displayBalance = useMemo(() => convertAmount(balance, currency, rates), [balance, currency, rates]);
    const displayPnl = useMemo(() => convertAmount(todayPnl, currency, rates), [todayPnl, currency, rates]);

    return (
        <div className="pb-24">
            <div className="sticky top-0 z-50 bg-white flex justify-between items-center px-4 py-4">
                <div className="flex items-center">
                    <img src={trivLogo} alt="Triv" className="h-7" />
                </div>
                <div className="bg-[#F5F7F9] px-6 py-1.5 rounded-full flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">Exchange</span>
                    <ChevronDown size={16} className="text-slate-500" />
                </div>
                <div className="flex gap-4 text-slate-800">
                    <Headphones size={24} strokeWidth={1.5} />
                    <User size={24} strokeWidth={1.5} />
                </div>
            </div>

            <div className="px-4 mt-1">
                <div className="relative mb-6" onClick={() => setSearchOpen(true)}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Flame className="absolute left-10 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
                    <input
                        readOnly
                        className="w-full bg-[#F5F7F9] border-none rounded-full py-3 pl-16 pr-4 text-sm font-medium text-slate-500 outline-none"
                        placeholder="SOL frequently traded"
                    />
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mb-1">
                        Est total value <Eye size={16} />
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-slate-900">{displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <CurrencySelector />
                            </div>
                            <div className="text-sm font-medium mt-1 flex items-center gap-1">
                                <span className="text-slate-500">Today's PnL</span>
                                <span className={todayPnl >= 0 ? "text-[#00C076]" : "text-[#FF4D5B]"}>
                                    {todayPnl >= 0 ? '+' : '-'} {Math.abs(displayPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todayPnl >= 0 ? '+' : ''}{pnlPercent}%)
                                </span>
                            </div>
                        </div>
                        <div className="w-24 h-10 text-[#00C076]">
                            <svg viewBox="0 0 100 40" className="w-full h-full stroke-current fill-current/20" preserveAspectRatio="none">
                                <path d="M0,30 L20,20 L40,25 L60,10 L80,15 L100,5 L100,40 L0,40 Z" stroke="none" />
                                <path d="M0,30 L20,20 L40,25 L60,10 L80,15 L100,5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setDepositOptionOpen(true)} className="flex-1 bg-[#F5F7F9] py-2.5 rounded-full font-bold text-slate-900 text-sm">Deposit</button>
                        <button className="flex-1 bg-[#121212] py-2.5 rounded-full font-bold text-white text-sm">Trade</button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Earn', icon: <div className="relative"><div className="w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold">1</div><div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-slate-800 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div></div> },
                        { label: 'My rewards', icon: <Ticket size={28} strokeWidth={1.5} className="text-slate-800" /> },
                        { label: 'Referral', icon: <Gift size={28} strokeWidth={1.5} className="text-slate-800" /> },
                        { label: 'More', icon: <Grid size={28} strokeWidth={1.5} className="text-slate-800" /> }
                    ].map(item => (
                        <div key={item.label} className="flex flex-col items-center gap-2">
                            <div className="h-8 flex items-center justify-center">{item.icon}</div>
                            <span className="text-xs font-medium text-slate-600">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-[#F5F7F9] rounded-2xl p-4 flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 border border-slate-200 rounded-full" />
                            <div className="absolute inset-1 border border-slate-200 rounded-full" />
                            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center z-10">
                                <User size={16} className="text-white" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold z-20">T</div>
                            <div className="absolute top-0 left-0 w-3 h-3 bg-black rounded-full border-2 border-white flex items-center justify-center text-[6px] text-white font-bold z-20">S</div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-800">Prefer Refer</div>
                            <div className="text-xs text-slate-600 leading-snug mt-0.5">Refer friends & earn a reward of up to $100<br />USDT trading bonus</div>
                        </div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 self-start mt-1">3/7</div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-6 text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar items-center">
                            {['Favorites', 'Hot', 'New', 'Stocks', 'DEX'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setHomeFilter(tab);
                                        if (tab === 'Favorites') setIsFavSheetOpen(true);
                                    }}
                                    className={`whitespace-nowrap relative ${homeFilter === tab ? 'text-slate-900 font-bold' : ''}`}
                                >
                                    {tab === 'Favorites' ? (
                                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${homeFilter === tab ? 'bg-[#F5F7F9]' : ''}`}>
                                            Favorites <ChevronDown size={14} />
                                        </div>
                                    ) : tab}
                                    {(tab === 'New' || tab === 'Stocks') && <div className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                        <Filter size={16} className="text-slate-400" />
                    </div>

                    <div className="space-y-6 mt-2">
                        {filteredMarkets.slice(0, 10).map(coin => (
                            <div key={coin.symbol} onClick={() => handleCoinClick(coin.symbol)} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <CoinIcon symbol={coin.symbol} size={8} />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            {coin.symbol.endsWith('USDT') ? (
                                                <>
                                                    <span className="font-bold text-base text-slate-900 uppercase">{coin.symbol}</span>
                                                    <span className="text-[11px] bg-[#FFF8E6] text-orange-500 px-1.5 py-0.5 rounded font-bold uppercase leading-none">Perp</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-base text-slate-900 uppercase">{coin.symbol.replace('USDT', '')}</span>
                                                    <span className="text-[12px] text-slate-300 font-medium">/USDT</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium mt-0.5">${(parseFloat(coin.quoteVolume) / 1e9).toFixed(2)}B</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold text-base text-slate-900">{parseFloat(coin.lastPrice).toLocaleString()}</div>
                                        <div className="text-xs text-slate-400 font-medium mt-0.5">${parseFloat(coin.lastPrice).toLocaleString()}</div>
                                    </div>
                                    <div className={`w-[72px] py-1.5 rounded text-sm font-bold text-center text-white ${parseFloat(coin.priceChangePercent) >= 0 ? 'bg-[#00C076]' : 'bg-[#FF4D5B]'}`}>
                                        {parseFloat(coin.priceChangePercent) > 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <FavoritesBottomSheet
                isOpen={isFavSheetOpen}
                onClose={() => setIsFavSheetOpen(false)}
                selected={favSubFilter}
                onSelect={(val) => {
                    setFavSubFilter(val);
                    setIsFavSheetOpen(false);
                }}
            />
        </div>
    );
};

export default HomeView;
