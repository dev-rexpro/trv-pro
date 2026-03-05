// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useExchangeStore from '../stores/useExchangeStore';
import CoinIcon from '../components/CoinIcon';
import TradingViewChart from '../components/TradingViewChart';
import { AssetPositionCard, PendingOrderCard } from '../components/TradeCards';
import { useOrderBookSocket } from '../hooks/useOrderBookSocket';
import { useTickerSocket } from '../hooks/useTickerSocket';
import {
    FiCheck as Check,
    FiInfo as Info,
    FiChevronRight as ChevronRight,
    FiFilter as Filter,
    FiShare2 as Share,
    FiEdit2 as Edit2,
    FiFileText as FileText,
    FiPlusCircle as PlusCircle,
} from 'react-icons/fi';
import { RxTriangleDown as ChevronDown, RxTriangleUp as ChevronUp } from 'react-icons/rx';
import { RiPlayListAddFill as MoreHorizontal } from 'react-icons/ri';
import { MdOutlineCandlestickChart as CandlestickChart } from 'react-icons/md';
import { PiDotsSixBold } from 'react-icons/pi';

const TradeView = () => {
    const { selectedCoin, markets, futuresMarkets, activePage, setActivePage, assets } = useExchangeStore();
    const [tpSlEnabled, setTpSlEnabled] = useState(false);
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState<'Market order' | 'Limit order'>('Market order');
    const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
    const [reduceOnly, setReduceOnly] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [chartInterval, setChartInterval] = useState('15m');
    const [activeTab, setActiveTab] = useState('Positions');
    const isFutures = activePage === 'futures';

    // Fetch real orderbook via WebSocket
    const { orderBook } = useOrderBookSocket(selectedCoin, isFutures ? 'futures' : 'spot', 20);
    const coin = (isFutures ? futuresMarkets : markets).find(m => m.symbol === selectedCoin) || markets.find(m => m.symbol === selectedCoin) || { symbol: selectedCoin, lastPrice: '0', priceChangePercent: '0' };

    // Fetch real ticker via WebSocket
    const liveTicker = useTickerSocket(selectedCoin, isFutures ? 'futures' : 'spot', {
        lastPrice: parseFloat(coin.lastPrice),
        priceChangePercent: parseFloat(coin.priceChangePercent)
    });

    const lastPrice = liveTicker?.lastPrice || parseFloat(coin.lastPrice) || 0;
    const priceChange = liveTicker?.priceChangePercent || parseFloat(coin.priceChangePercent) || 0;
    const baseAsset = selectedCoin.replace('USDT', '').replace('BUSD', '');

    // Mock Futures Positions
    const futuresPositions = [
        { type: 'future', pair: 'BTCUSDT Perp', side: 'Buy', pnl: '+81.18', pnlPct: '+11.78%', size: '1.0184', margin: '688.8', entry: '67,635.9', mark: '67,721.1', liq: '67,262.4' },
        { type: 'future', pair: 'ETHUSDT Perp', side: 'Sell', pnl: '-12.45', pnlPct: '-2.15%', size: '15.500', margin: '450.2', entry: '3,452.1', mark: '3,460.5', liq: '3,680.0' },
    ];

    // Map Assets to Position-like objects
    const assetPositions = useMemo(() => assets.filter(a => a.symbol !== 'USDT').map(asset => {
        const market = markets.find(m => m.symbol === `${asset.symbol}USDT`) || { lastPrice: '0' };
        const lastPrice = parseFloat(market.lastPrice) || 0;
        return {
            type: 'spot',
            symbol: asset.symbol,
            amount: asset.amount,
            lastPrice: lastPrice
        };
    }), [assets, markets]);

    const combinedPositions = [...futuresPositions, ...assetPositions];
    const totalCount = combinedPositions.length;

    const orderBookRowCount = isFutures
        ? (tpSlEnabled ? 11 : 8)
        : (tpSlEnabled ? 7 : 6);

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24 animate-in slide-in-from-right duration-300">
            {/* Top Navigation - Non-sticky */}
            <div className="bg-white">
                <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                    <div className="flex gap-5 text-[18px] font-bold text-slate-400">
                        <span className={!isFutures ? "text-slate-900" : ""} onClick={() => setActivePage('trade')}>Spot</span>
                        <span className={isFutures ? "text-slate-900" : ""} onClick={() => setActivePage('futures')}>Futures</span>
                        <span>Bots</span>
                        <span>Convert</span>
                    </div>
                    <MoreHorizontal size={20} className="text-slate-900" />
                </div>
            </div>

            {/* Header (Pair info) - Sticky */}
            <div className="sticky top-0 z-50 bg-white px-4 h-[52px] flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-2">
                    {isFutures ? (
                        <>
                            <span className="font-bold text-[20px] text-slate-900 tracking-tight uppercase">{coin.symbol}</span>
                            <span className="text-[11px] font-bold text-orange-500 bg-[#FFF8E6] px-1.5 py-0.5 rounded leading-none">Perp</span>
                        </>
                    ) : (
                        <>
                            <span className="font-bold text-[20px] text-slate-900 tracking-tight uppercase">{coin.symbol.replace('USDT', '')}</span>
                            <span className="text-[16px] text-slate-300 font-medium -ml-1">/USDT</span>
                        </>
                    )}
                    <ChevronDown size={16} className="text-slate-400" />
                </div>
                <div className="flex gap-4">
                    <CandlestickChart size={24} className="text-slate-900 cursor-pointer" onClick={() => {
                        useExchangeStore.setState({ tradeType: isFutures ? 'futures' : 'spot' });
                        setActivePage('chart-trade');
                    }} />
                    <PiDotsSixBold size={24} className="text-slate-900" />
                </div>
            </div>

            {/* Main Trade Area */}
            <div className="flex px-4 gap-4 bg-white pt-2">
                {/* Left Column */}
                <div className="flex-1 flex flex-col">
                    {/* Spot Buy/Sell Toggle */}
                    {!isFutures && (
                        <div className="flex rounded-lg bg-slate-100 p-0.5 mb-4">
                            <button
                                onClick={() => setSide('buy')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold text-center transition-colors ${side === 'buy' ? 'bg-[#00C076] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setSide('sell')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold text-center transition-colors ${side === 'sell' ? 'bg-[#FF4D5B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sell
                            </button>
                        </div>
                    )}

                    {/* Futures Margin/Leverage */}
                    {isFutures && (
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 flex justify-between items-center bg-[#F5F7F9] px-3 py-1.5 rounded text-sm font-bold text-slate-700">
                                Isolated <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            <div className="w-[70px] flex justify-between items-center bg-[#F5F7F9] px-3 py-1.5 rounded text-sm font-bold text-slate-700">
                                50x <ChevronDown size={14} className="text-slate-400" />
                            </div>
                        </div>
                    )}

                    {/* Order Type */}
                    <div
                        className="flex justify-between items-center bg-[#F5F7F9] px-3 py-2 rounded mb-4 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => setOrderType(orderType === 'Market order' ? 'Limit order' : 'Market order')}
                    >
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1">{orderType} <Info size={12} className="text-slate-400" /></span>
                        <ChevronDown size={16} className="text-slate-400" />
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center bg-[#F5F7F9] px-3 py-2 rounded mb-4">
                        <span className="text-sm font-medium text-slate-400">Amount</span>
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1">USDT <ChevronDown size={14} className="text-slate-400" /></span>
                    </div>

                    {/* Percentage Buttons */}
                    <div className="flex gap-2 mb-4">
                        {[25, 50, 75, 100].map((pct) => (
                            <button
                                key={pct}
                                onClick={() => setSelectedPercentage(pct)}
                                className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${selectedPercentage === pct
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-[#F5F7F9] text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>

                    {/* Available */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-medium text-slate-400">Available</span>
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">0 USDT <PlusCircle size={12} className="text-slate-400" /></span>
                    </div>

                    {/* Futures Reduce-only */}
                    {isFutures && (
                        <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setReduceOnly(!reduceOnly)}>
                            <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${reduceOnly ? 'bg-slate-900 border-slate-900' : 'border-slate-300 bg-white'}`}>
                                {reduceOnly && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[12px] font-medium text-slate-600">Reduce-only</span>
                        </div>
                    )}

                    {/* TP/SL */}
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setTpSlEnabled(!tpSlEnabled)}>
                        <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${tpSlEnabled ? 'bg-slate-900 border-slate-900' : 'border-slate-300 bg-white'}`}>
                                {tpSlEnabled && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[12px] font-medium text-slate-600">TP/SL</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">Advanced &gt;</span>
                    </div>

                    {/* TP/SL Forms */}
                    {tpSlEnabled && (
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center bg-[#F5F7F9] px-3 py-2 rounded">
                                <span className="text-sm font-medium text-slate-400">{isFutures ? 'TP price' : 'TP trigger price'}</span>
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-1">USDT {isFutures && <ChevronDown size={14} className="text-slate-400" />}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#F5F7F9] px-3 py-2 rounded">
                                <span className="text-sm font-medium text-slate-400">{isFutures ? 'SL price' : 'SL trigger price'}</span>
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-1">USDT {isFutures && <ChevronDown size={14} className="text-slate-400" />}</span>
                            </div>
                        </div>
                    )}

                    {/* Spot Max Buy */}
                    {!isFutures && (
                        <div className="mb-2 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-medium text-slate-400">Max buy</span>
                                <span className="text-[11px] font-medium text-slate-700">0 BTC</span>
                            </div>
                        </div>
                    )}

                    {/* Futures Max Buy/Cost */}
                    {isFutures && (
                        <div className="mb-4 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-medium text-slate-400">Max buy</span>
                                <span className="text-[11px] font-medium text-slate-700">0 BTC</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-medium text-slate-400">Cost</span>
                                <span className="text-[11px] font-medium text-slate-700">0 USDT</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-medium text-slate-400">Liq. price</span>
                                <span className="text-[11px] font-medium text-slate-700">--</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!isFutures ? (
                        <button
                            className={`w-full py-3 text-white font-bold rounded-lg text-sm transition-colors ${side === 'buy' ? 'bg-[#00C076] hover:bg-[#00A666]' : 'bg-[#FF4D5B] hover:bg-[#E64552]'}`}
                        >
                            {side === 'buy' ? 'Buy' : 'Sell'} {coin.symbol.replace('USDT', '')}
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <button className="w-full py-2.5 bg-[#00C076] text-white font-bold rounded-lg text-[13px]">
                                Buy (Long) 50x
                            </button>
                            <div className="space-y-1 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400">Max sell</span>
                                    <span className="text-[11px] font-medium text-slate-700">0 BTC</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400">Cost</span>
                                    <span className="text-[11px] font-medium text-slate-700">0 USDT</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400">Liq. price</span>
                                    <span className="text-[11px] font-medium text-slate-700">--</span>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-[#FF4D5B] text-white font-bold rounded-lg text-[13px]">
                                Sell (Short) 50x
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column (Order Book) */}
                <div className="w-[140px] flex flex-col">
                    {isFutures && (
                        <div className="text-[9px] font-medium text-slate-400 text-right mb-2 leading-tight">
                            Funding rate / Countdown<br />
                            <span className="text-slate-700 font-bold text-[10px]">0.004% / 00:14:22</span>
                        </div>
                    )}

                    <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1 leading-tight">
                        <span>Price<br />(USDT)</span>
                        <span className="text-right">Amount<br />(BTC <ChevronDown size={10} className="inline" />)</span>
                    </div>

                    {/* Asks (Red) */}
                    <div className="space-y-[2px] mb-2">
                        {orderBook.asks.slice(0, orderBookRowCount).reverse().map(([price, qty], i) => {
                            const maxQty = Math.max(...orderBook.asks.slice(0, orderBookRowCount).map(a => parseFloat(a[1])), 0.0001);
                            const pct = (parseFloat(qty) / maxQty) * 100;
                            const p = parseFloat(price);
                            return (
                                <div key={`ask-${i}`} className="flex justify-between text-[11px] font-medium relative h-[18px] items-center">
                                    <div className="absolute right-0 top-0 bottom-0 bg-[#FF4D5B]/10" style={{ width: `${pct}%` }}></div>
                                    <span className="text-[#FF4D5B] relative z-10">{p >= 10 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}</span>
                                    <span className="text-slate-600 relative z-10">{parseFloat(qty).toFixed(5)}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Price */}
                    <div className="my-1">
                        <div className={`text-lg font-bold leading-none flex items-center gap-1 ${priceChange >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>
                            {lastPrice >= 10 ? lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : lastPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} <ChevronRight size={14} className="text-slate-400" />
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                            ≈ ${lastPrice >= 10 ? lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : lastPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} <span className={priceChange >= 0 ? 'text-[#00C076]' : 'text-[#FF4D5B]'}>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                        </div>
                    </div>

                    {/* Bids (Green) */}
                    <div className="space-y-[2px] mt-2 mb-3">
                        {orderBook.bids.slice(0, orderBookRowCount).map(([price, qty], i) => {
                            const maxQty = Math.max(...orderBook.bids.slice(0, orderBookRowCount).map(b => parseFloat(b[1])), 0.0001);
                            const pct = (parseFloat(qty) / maxQty) * 100;
                            const p = parseFloat(price);
                            return (
                                <div key={`bid-${i}`} className="flex justify-between text-[11px] font-medium relative h-[18px] items-center">
                                    <div className="absolute right-0 top-0 bottom-0 bg-[#00C076]/10" style={{ width: `${pct}%` }}></div>
                                    <span className="text-[#00C076] relative z-10">{p >= 10 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}</span>
                                    <span className="text-slate-600 relative z-10">{parseFloat(qty).toFixed(5)}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Buy/Sell Ratio */}
                    <div className="mt-auto">
                        <div className="flex h-[6px] rounded-full overflow-hidden mb-2">
                            <div className="bg-[#00C076] w-[49%]"></div>
                            <div className="bg-[#FF4D5B] w-[51%]"></div>
                        </div>
                        <div className="flex justify-between items-center text-[12px] font-bold mb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[#00C076] bg-[#00C076]/10 border border-[#00C076]/20 rounded-[4px] px-[5px] py-[1px] text-[10px] leading-none flex items-center justify-center h-[16px]">B</span>
                                <span className="text-[#00C076]">49%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[#FF4D5B]">51%</span>
                                <span className="text-[#FF4D5B] bg-[#FF4D5B]/10 border border-[#FF4D5B]/20 rounded-[4px] px-[5px] py-[1px] text-[10px] leading-none flex items-center justify-center h-[16px]">S</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 flex justify-between items-center bg-[#F8FAFC] border border-slate-100 px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium text-slate-600">
                                0.1 <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            <div className="w-[34px] h-[32px] bg-[#F8FAFC] border border-slate-100 rounded-[6px] flex flex-col items-center justify-center gap-[3px] shrink-0">
                                <div className="w-[14px] h-[5px] bg-[#FF4D5B] rounded-full"></div>
                                <div className="w-[14px] h-[5px] bg-[#00C076] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Positions & Orders */}
            <div className="mt-2">
                <div className="sticky top-[52px] z-40 bg-white flex gap-6 px-4 pt-4 border-b border-slate-100">
                    <span
                        onClick={() => setActiveTab('Orders')}
                        className={`text-[14px] font-bold pb-3 cursor-pointer ${activeTab === 'Orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 font-medium'}`}
                    >
                        Orders (2)
                    </span>
                    <span
                        onClick={() => setActiveTab('Positions')}
                        className={`text-[14px] font-bold pb-3 cursor-pointer flex items-center gap-1 ${activeTab === 'Positions' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 font-medium'}`}
                    >
                        Positions ({totalCount}) & assets <ChevronDown size={14} className="inline" />
                    </span>
                    <span className="text-[14px] font-medium text-slate-400 pb-3">Bots (0)</span>
                    <div className="ml-auto pb-3">
                        <FileText size={16} className="text-slate-400" />
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                            <span className="text-[13px] font-medium text-slate-600">Current symbol</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button className="px-3 py-1 bg-[#F5F7F9] rounded-full text-[12px] font-bold text-slate-700">Close all</button>
                            <Filter size={16} className="text-slate-400" />
                        </div>
                    </div>

                    {activeTab === 'Orders' && (
                        <div>
                            <PendingOrderCard
                                order={{
                                    symbol: 'BTCUSDT Perp',
                                    side: 'Buy',
                                    time: '03/03, 03:04:03',
                                    amount: '0.2662',
                                    filled: '0',
                                    price: '67,200',
                                    coin: 'BTC'
                                }}
                            />
                            <PendingOrderCard
                                order={{
                                    symbol: 'ETHUSDT Perp',
                                    side: 'Sell',
                                    time: '03/03, 03:05:12',
                                    amount: '5.500',
                                    filled: '0',
                                    price: '3,550',
                                    coin: 'ETH'
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'Positions' && (
                        <>
                            {combinedPositions.map((pos, idx) => {
                                if (pos.type === 'spot') {
                                    return <AssetPositionCard key={`spot-${idx}`} symbol={pos.symbol} amount={pos.amount} lastPrice={pos.lastPrice} />
                                }
                                return (
                                    <div key={`future-${idx}`} className="mb-8 border-b border-slate-50 pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className="font-bold text-[18px] text-slate-900 tracking-tight">{pos.pair}</span>
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className={`text-[10px] font-bold ${pos.side === 'Buy' ? 'text-[#00C076] bg-[#00C076]/10' : 'text-[#FF4D5B] bg-[#FF4D5B]/10'} px-1.5 py-0.5 rounded`}>{pos.side}</span>
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Isolated</span>
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">100x <Edit2 size={10} /></span>
                                                    <Share size={12} className={pos.side === 'Buy' ? "text-[#00C076]" : "text-[#FF4D5B]"} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className={`font-bold text-[16px] ${pos.pnl.startsWith('+') ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>{pos.pnl}</div>
                                                <div className={`text-[12px] font-bold ${pos.pnl.startsWith('+') ? 'text-[#00C076]' : 'text-[#FF4D5B]'}`}>{pos.pnlPct}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <div className="text-[11px] font-medium text-slate-400 mb-1">Size (USDT)</div>
                                                <div className="font-bold text-[14px] text-slate-900">{pos.size}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-medium text-slate-400 mb-1">Margin (USDT)</div>
                                                <div className="font-bold text-[14px] text-slate-900">{pos.margin}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[11px] font-medium text-slate-400 mb-1">Entry Price</div>
                                                <div className="font-bold text-[14px] text-slate-900">{pos.entry}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <div className="text-[11px] font-medium text-slate-400 mb-1">Mark Price</div>
                                                <div className="font-bold text-[14px] text-slate-900">{pos.mark}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-medium text-slate-400 mb-1">Liq. Price</div>
                                                <div className="font-bold text-[14px] text-slate-900">{pos.liq}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 bg-[#F5F7F9] py-2.5 rounded-full text-[13px] font-bold text-slate-700 hover:bg-slate-100 transition-colors">TP/SL</button>
                                            <button className="flex-1 bg-[#F5F7F9] py-2.5 rounded-full text-[13px] font-bold text-slate-700 hover:bg-slate-100 transition-colors">Close</button>
                                            <button className="flex-1 bg-[#F5F7F9] py-2.5 rounded-full text-[13px] font-bold text-slate-700 hover:bg-slate-100 transition-colors">Close All</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}

                    <div className="h-40"></div> {/* Extra space at the bottom */}
                </div>
            </div>

            {/* Sticky Chart Bar */}
            <div className="fixed bottom-[68px] left-0 right-0 z-40">
                <div className="bg-white border-t border-slate-100 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
                    <div
                        className="flex justify-between items-center px-4 py-3 cursor-pointer active:bg-slate-50 transition-colors"
                        onClick={() => setIsChartOpen(!isChartOpen)}
                    >
                        <span className="font-bold text-[14px] text-slate-900">
                            {isFutures ? (
                                <>
                                    {coin.symbol} <span className="text-[11px] text-orange-500 font-bold uppercase">Perp</span>
                                </>
                            ) : (
                                <>
                                    {coin.symbol.replace('USDT', '')}<span className="text-slate-300 font-medium">/USDT</span>
                                </>
                            )} chart
                        </span>
                        <ChevronUp size={20} className={`text-slate-400 transition-transform duration-300 ${isChartOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {isChartOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden bg-white px-2 pb-4"
                            >
                                <div className="flex gap-4 px-2 mb-3 text-[12px] font-bold text-slate-400">
                                    {['15m', '1h', '4h', '1d'].map(intv => (
                                        <span
                                            key={intv}
                                            onClick={() => setChartInterval(intv)}
                                            className={`cursor-pointer pb-1 transition-colors ${chartInterval === intv ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-600'}`}
                                        >
                                            {intv}
                                        </span>
                                    ))}
                                    <span className="cursor-pointer hover:text-slate-600">More</span>
                                </div>
                                <TradingViewChart symbol={coin.symbol} interval={chartInterval} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
};

export default TradeView;
