// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import useExchangeStore from '../stores/useExchangeStore';
import { searchDexScreener } from '../utils/api';
import CoinIcon from './CoinIcon';
import {
    FiSearch as Search,
    FiTrash2 as Trash2,
    FiStar as Star,
} from 'react-icons/fi';
import { RxTriangleDown as ChevronDown } from 'react-icons/rx';

const SearchOverlay = () => {
    const { searchQuery, setSearchQuery, setSearchOpen, history, clearHistory, markets, favorites, toggleFavorite, rates, currency } = useExchangeStore();
    const [dexResults, setDexResults] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    // Top 10 Popular from Binance (already sorted by volume in store)
    const top10 = useMemo(() => markets.slice(0, 10), [markets]);

    const spotResults = useMemo(() => {
        if (searchQuery.trim().length === 0) return [];
        const q = searchQuery.toLowerCase();
        return markets.filter(m => m.symbol.toLowerCase().includes(q));
    }, [searchQuery, markets]);

    useEffect(() => {
        if (searchQuery.length > 2) {
            setIsTyping(true);
            const timer = setTimeout(async () => {
                try {
                    const results = await searchDexScreener(searchQuery);
                    setDexResults(results);
                } catch (e) { }
                setIsTyping(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setDexResults([]);
        }
    }, [searchQuery]);

    const handleCancel = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery('');
    }, [setSearchOpen, setSearchQuery]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
        >
            <div className="p-4 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800" size={18} strokeWidth={2.5} />
                    <input
                        autoFocus
                        className="w-full bg-[#F5F7F9] border-none rounded-full py-2.5 pl-11 pr-4 text-[15px] font-medium placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                        placeholder="🔥 SOL frequently traded"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isTyping && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <button onClick={handleCancel} className="text-[15px] font-bold text-slate-900">Cancel</button>
            </div>

            {searchQuery.length > 0 && (
                <div className="border-b border-slate-100 flex gap-6 px-5 overflow-x-auto no-scrollbar items-center">
                    {['All', 'Spot', 'Futures', 'DEX', 'Bots', 'Traders', 'Feed'].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`pb-3 pt-2 text-[15px] font-bold whitespace-nowrap ${activeTab === t ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 font-medium'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
                {searchQuery.length === 0 ? (
                    <>
                        {history.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-[18px] text-slate-900 tracking-tight">Search history</h3>
                                    <button onClick={clearHistory}><Trash2 size={20} className="text-slate-400 hover:text-red-500 transition-colors" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {history.map((item, idx) => (
                                        <div key={idx} className="px-3.5 py-1.5 bg-[#F5F7F9] rounded-2xl text-[12px] font-semibold text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSearchQuery(item)}>
                                            {item}
                                        </div>
                                    ))}
                                    <div className="px-3 py-1.5 bg-[#F5F7F9] rounded-2xl text-[12px] font-semibold text-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                        <ChevronDown size={18} strokeWidth={1.5} className="mt-0.5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="font-bold text-[18px] text-slate-900 tracking-tight mb-6">Popular searches</h3>
                            <div className="space-y-6">
                                {top10.map((coin: any, i: number) => {
                                    const isFav = favorites.includes(coin.symbol);
                                    return (
                                        <div key={coin.symbol} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className={`font-medium text-sm w-4 ${i < 3 ? 'text-[#e9ba3b]' : 'text-slate-400'}`}>{i + 1}</span>
                                                <CoinIcon symbol={coin.symbol} size={8} />
                                                <div className="font-bold text-slate-900 text-[15px] leading-none">{coin.symbol.replace('USDT', '')}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-semibold text-[15px] text-slate-900 leading-tight">{coin.lastPrice >= 10 ? parseFloat(coin.lastPrice).toLocaleString() : parseFloat(coin.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
                                                    <div className={`text-[11px] font-semibold ${parseFloat(coin.priceChangePercent) >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>
                                                        {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                                    </div>
                                                </div>
                                                {isFav ? (
                                                    <Star size={20} className="text-[#e9ba3b]" fill="currentColor" onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.symbol); }} />
                                                ) : (
                                                    <Star size={20} className="text-slate-400" onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.symbol); }} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        {/* Spot Section */}
                        {(activeTab === 'All' || activeTab === 'Spot') && spotResults.length > 0 && (
                            <div>
                                {activeTab === 'All' && <h3 className="font-bold text-[16px] text-slate-900 mb-4">Spot</h3>}
                                <div className="space-y-6">
                                    {spotResults.slice(0, activeTab === 'All' ? 3 : undefined).map((coin: any) => {
                                        const isFav = favorites.includes(coin.symbol);
                                        return (
                                            <div key={`spot-${coin.symbol}`} className="flex items-center justify-between cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <CoinIcon symbol={coin.symbol} size={8} />
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[15px] text-slate-900 uppercase">{coin.symbol.replace('USDT', '')}</span>
                                                        <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">/ USDT</span>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded leading-none">10x</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-semibold text-[15px] text-slate-900 leading-tight">{coin.lastPrice >= 10 ? parseFloat(coin.lastPrice).toLocaleString() : parseFloat(coin.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
                                                        <div className={`text-[12px] font-semibold flex justify-end ${parseFloat(coin.priceChangePercent) >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>
                                                            {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <Star size={20} className={isFav ? "text-[#e9ba3b]" : "text-slate-400"} fill={isFav ? "currentColor" : "none"} onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.symbol); }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {activeTab === 'All' && spotResults.length > 3 && (
                                    <button className="w-full mt-4 py-2.5 bg-[#F5F7F9] rounded-[14px] text-[14px] font-bold text-slate-900 hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('Spot')}>Show more</button>
                                )}
                            </div>
                        )}

                        {/* Futures Section */}
                        {(activeTab === 'All' || activeTab === 'Futures') && spotResults.length > 0 && (
                            <div>
                                {activeTab === 'All' && <h3 className="font-bold text-[16px] text-slate-900 mb-4">Futures</h3>}
                                <div className="space-y-6">
                                    {spotResults.slice(0, activeTab === 'All' ? 3 : undefined).map((coin: any) => {
                                        const isFav = favorites.includes(coin.symbol);
                                        return (
                                            <div key={`fut-${coin.symbol}`} className="flex items-center justify-between cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <CoinIcon symbol={coin.symbol} size={8} />
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[15px] text-slate-900 uppercase">{coin.symbol}</span>
                                                        <span className="text-[11px] font-bold text-orange-500 bg-[#FFF8E6] px-1.5 py-0.5 rounded leading-none">Perp</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-semibold text-[15px] text-slate-900 leading-tight">{coin.lastPrice >= 10 ? parseFloat(coin.lastPrice).toLocaleString() : parseFloat(coin.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
                                                        <div className={`text-[12px] font-semibold flex justify-end ${parseFloat(coin.priceChangePercent) >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>
                                                            {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <Star size={20} className={isFav ? "text-[#e9ba3b]" : "text-slate-400"} fill={isFav ? "currentColor" : "none"} onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.symbol); }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {activeTab === 'All' && spotResults.length > 3 && (
                                    <button className="w-full mt-4 py-2.5 bg-[#F5F7F9] rounded-[14px] text-[14px] font-bold text-slate-900 hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('Futures')}>Show more</button>
                                )}
                            </div>
                        )}

                        {/* DEX Section */}
                        {(activeTab === 'All' || activeTab === 'DEX') && dexResults.length > 0 && (
                            <div>
                                {activeTab === 'All' && <h3 className="font-bold text-[16px] text-slate-900 mb-4">DEX</h3>}
                                <div className="space-y-6">
                                    {dexResults.slice(0, activeTab === 'All' ? 3 : undefined).map((pair: any, idx: number) => {
                                        const idrRate = rates?.IDR || 16300;
                                        const activeCurr = currency === 'BTC' ? 'USD' : currency; // fallback to USD if BTC

                                        const price = activeCurr === 'IDR' ? parseFloat(pair.priceUsd) * idrRate : parseFloat(pair.priceUsd);
                                        const liq = activeCurr === 'IDR' ? parseFloat(pair.liquidity?.usd || 0) * idrRate : parseFloat(pair.liquidity?.usd || 0);
                                        const vol = activeCurr === 'IDR' ? parseFloat(pair.volume?.h24 || 0) * idrRate : parseFloat(pair.volume?.h24 || 0);

                                        const prefix = activeCurr === 'IDR' ? 'Rp' : (activeCurr === 'USDT' ? '₮' : '$');

                                        const formatValue = (val: number) => {
                                            if (val >= 1e9) return `${prefix} ${(val / 1e9).toFixed(2)}B`;
                                            if (val >= 1e6) return `${prefix} ${(val / 1e6).toFixed(2)}M`;
                                            if (val >= 1e3) return `${prefix} ${(val / 1e3).toFixed(2)}K`;
                                            return `${prefix} ${val.toFixed(2)}`;
                                        };

                                        return (
                                            <div key={`dex-${pair.pairAddress}-${idx}`} className="flex items-center justify-between cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <CoinIcon symbol={pair.baseToken.symbol} iconUrl={pair.info?.imageUrl} size={10} />
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                                            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-[15px] flex items-center gap-1.5 mb-1 text-left">
                                                            <span className="truncate max-w-[80px]">{pair.baseToken.symbol}</span>
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase leading-none">DEX</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-medium text-left">
                                                            {pair.liquidity?.usd && `Liq. ${formatValue(liq)}`} <span className="mx-1.5">|</span>{pair.volume?.h24 && `24h turnover ${formatValue(vol)}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end shrink-0 overflow-hidden">
                                                    <div className="font-bold text-slate-900 text-[15px] truncate w-full text-right leading-tight">
                                                        {activeCurr === 'IDR' ? (
                                                            `${prefix} ${price >= 10 ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                                                        ) : (
                                                            `${prefix}${price < 0.01
                                                                ? price.toLocaleString(undefined, { maximumSignificantDigits: 4 })
                                                                : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                                                            }`
                                                        )}
                                                    </div>
                                                    <div className={`text-[12px] font-bold truncate w-full text-right ${pair.priceChange.h24 >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>
                                                        {pair.priceChange.h24 >= 0 ? '+' : ''}{parseFloat(pair.priceChange.h24).toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {activeTab === 'All' && dexResults.length > 3 && (
                                    <button className="w-full mt-4 py-2.5 bg-[#F5F7F9] rounded-[14px] text-[14px] font-bold text-slate-900 hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('DEX')}>Show more</button>
                                )}
                            </div>
                        )}

                        {dexResults.length === 0 && spotResults.length === 0 && !isTyping && (
                            <div className="text-center text-slate-400 mt-10">No results found</div>
                        )}
                        {isTyping && spotResults.length === 0 && dexResults.length === 0 && (
                            <div className="text-center text-slate-400 mt-10">Searching...</div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SearchOverlay;
