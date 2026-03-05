// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    FiCheck as Check,
    FiInfo as Info,
    FiChevronRight as ChevronRight,
    FiFileText as FileText,
} from 'react-icons/fi';
import { LuCirclePlus } from 'react-icons/lu';
import { RxTriangleDown as ChevronDown } from 'react-icons/rx';
import { RiPlayListAddFill as MoreHorizontal } from 'react-icons/ri';
import { MdOutlineCandlestickChart as CandlestickChart } from 'react-icons/md';
import { PiDotsSixBold as AlignRight } from 'react-icons/pi';
import { IoClose as XIcon, IoShareOutline as FiShare2 } from 'react-icons/io5';
import { FiEdit2, FiUpload as FiUploadLine } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useExchangeStore from '../stores/useExchangeStore';

const TradeView = () => {
    const { setActivePage, wallets, markets, openOrders, positions } = useExchangeStore();
    const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
    const [ticker, setTicker] = useState<any>(null);
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [priceInput, setPriceInput] = useState('0');
    const [amountInput, setAmountInput] = useState('');
    const [sliderPercent, setSliderPercent] = useState(0);
    const [isMarginEnabled, setIsMarginEnabled] = useState(false);
    const [isTpSlEnabled, setIsTpSlEnabled] = useState(false);
    const [isCurrentSymbolChecked, setIsCurrentSymbolChecked] = useState(false);
    const [orderBookView, setOrderBookView] = useState<'both' | 'buy' | 'sell'>('both');
    const [isMiniChartOpen, setIsMiniChartOpen] = useState(false);
    const [klines, setKlines] = useState<any[]>([]);
    const [precision, setPrecision] = useState(0.1);
    const [isPrecisionSheetOpen, setIsPrecisionSheetOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'positions' | 'assets' | 'bots'>('orders');
    const [orderType, setOrderType] = useState<'Limit' | 'Market' | 'TP/SL'>('Limit');
    const [isOrderTypeSheetOpen, setIsOrderTypeSheetOpen] = useState(false);

    const { placeSpotOrder, cancelSpotOrder } = useExchangeStore();

    // Get current asset for max calculation
    const currentAsset = tradeSide === 'buy' ? 'USDT' : 'BTC';
    const availableBalance = wallets?.spot?.[currentAsset] || 0;

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
                const data = await res.json();
                setTicker(data);
                if (priceInput === '0') {
                    const p = parseFloat(data.lastPrice);
                    setPriceInput((p * 0.9995).toFixed(1));
                }
            } catch (err) { }
        };

        const fetchKlines = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100');
                const data = await res.json();
                const formatted = data.map((d: any) => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4])
                }));
                setKlines(formatted);
            } catch (err) { }
        };

        const fetchOrderBook = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=20');
                const data = await res.json();
                setOrderBook({
                    bids: data.bids.map((b: any) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
                    asks: data.asks.map((a: any) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })).reverse()
                });
            } catch (err) { }
        };

        fetchTicker();
        fetchKlines();
        fetchOrderBook();

        const interval = setInterval(() => {
            fetchTicker();
            fetchOrderBook();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: string) => {
        if (!price) return '0.00';
        return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    };

    const handleTradeSideSwitch = (side: 'buy' | 'sell') => {
        setTradeSide(side);
        setAmountInput('');
        setSliderPercent(0);
        if (ticker?.lastPrice) {
            const p = parseFloat(ticker.lastPrice);
            setPriceInput(side === 'buy' ? (p * 0.9995).toFixed(1) : (p * 1.0005).toFixed(1));
        }
    };

    const handlePlaceOrder = () => {
        const price = orderType === 'Market' ? (ticker ? parseFloat(ticker.lastPrice) : 0) : parseFloat(priceInput);
        const amount = parseFloat(amountInput) || 0;
        if (amount <= 0) return;

        placeSpotOrder({
            symbol: 'BTCUSDT',
            side: tradeSide === 'buy' ? 'Buy' : 'Sell',
            type: orderType === 'TP/SL' ? 'Limit' : orderType,
            price,
            amount,
            marginMode: 'Spot',
            leverage: 1
        });
        setAmountInput('');
        setSliderPercent(0);
        setActiveTab('orders');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow empty or numeric with optional decimal
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountInput(val);
            const numVal = parseFloat(val);
            if (!isNaN(numVal) && availableBalance > 0) {
                let maxAmount = availableBalance;
                if (tradeSide === 'buy') {
                    const price = parseFloat(priceInput) || 0;
                    maxAmount = price > 0 ? availableBalance / price : 0;
                }
                const pct = Math.min(100, Math.max(0, (numVal / maxAmount) * 100));
                setSliderPercent(pct);
            } else {
                setSliderPercent(0);
            }
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pct = parseInt(e.target.value);
        setSliderPercent(pct);
        if (availableBalance > 0) {
            let maxAmount = availableBalance;
            if (tradeSide === 'buy') {
                const price = parseFloat(priceInput) || 0;
                maxAmount = price > 0 ? availableBalance / price : 0;
            }
            const val = maxAmount * (pct / 100);
            setAmountInput(pct === 0 ? '' : val.toFixed(8));
        }
    };

    const cycleOrderBookView = () => {
        setOrderBookView(prev => {
            if (prev === 'both') return 'buy';
            if (prev === 'buy') return 'sell';
            return 'both';
        });
    };

    const aggregateOrderBook = (data: any[], type: 'buy' | 'sell') => {
        if (!data || data.length === 0) return [];
        const grouped: { [key: string]: number } = {};
        data.forEach(item => {
            const p = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const groupedPrice = type === 'buy'
                ? Math.floor(p / precision) * precision
                : Math.ceil(p / precision) * precision;
            const priceKey = groupedPrice.toFixed(precision >= 1 ? 0 : 1);
            grouped[priceKey] = (grouped[priceKey] || 0) + (typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount);
        });
        return Object.entries(grouped)
            .map(([price, amount]) => ({ price: parseFloat(price), amount }))
            .sort((a, b) => type === 'buy' ? b.price - a.price : a.price - b.price);
    };

    const aggregatedAsks = aggregateOrderBook(orderBook.asks, 'sell');
    const aggregatedBids = aggregateOrderBook(orderBook.bids, 'buy');

    const isPositive = ticker ? parseFloat(ticker.priceChangePercent) >= 0 : true;
    const currentPriceNum = parseFloat(priceInput) || 0;

    const displayAvailable = availableBalance === 0 ? '0' : availableBalance.toLocaleString('en-US', { minimumFractionDigits: currentAsset === 'USDT' ? 2 : 4, maximumFractionDigits: 8 });

    const maxBuySellAmount = (() => {
        if (tradeSide === 'buy') {
            return currentPriceNum > 0 ? (availableBalance / currentPriceNum) : 0;
        }
        return availableBalance;
    })();

    const maxBuySellValue = maxBuySellAmount === 0 ? '0' : maxBuySellAmount.toFixed(8);

    const totalUsdt = amountInput && !isNaN(parseFloat(amountInput))
        ? (parseFloat(amountInput) * currentPriceNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '';

    const renderSvgChart = (customHeight?: number) => {
        if (!klines || klines.length === 0) return null;
        const width = 400;
        const height = customHeight || 320;
        const padding = customHeight ? 5 : 20;
        const drawableHeight = height - padding * 2;

        const minPrice = Math.min(...klines.map(d => d.low));
        const maxPrice = Math.max(...klines.map(d => d.high));
        const range = maxPrice - minPrice || 1;
        const candleWidth = width / klines.length;
        const getY = (price: number) => height - padding - ((price - minPrice) / range) * drawableHeight;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                {klines.map((d, i) => {
                    const x = i * candleWidth;
                    const yOpen = getY(d.open);
                    const yClose = getY(d.close);
                    const yHigh = getY(d.high);
                    const yLow = getY(d.low);
                    const isUp = d.close >= d.open;
                    const color = isUp ? '#10b981' : '#ef4444';
                    const rectY = Math.min(yOpen, yClose);
                    const rectHeight = Math.max(Math.abs(yOpen - yClose), 1);
                    return (
                        <g key={i}>
                            <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1" />
                            <rect x={x + candleWidth * 0.1} y={rectY} width={candleWidth * 0.8} height={rectHeight} fill={color} />
                        </g>
                    );
                })}
            </svg>
        );
    };

    const halfListCount = isTpSlEnabled ? 8 : 6;
    const fullListCount = isTpSlEnabled ? 16 : 12;
    const askLimit = orderBookView === 'sell' ? fullListCount : halfListCount;
    const bidLimit = orderBookView === 'buy' ? fullListCount : halfListCount;

    const currentAsks = aggregatedAsks.slice(0, askLimit);
    const currentBids = aggregatedBids.slice(0, bidLimit);

    const maxAskAmount = currentAsks.length > 0 ? Math.max(...currentAsks.map((a: any) => a.amount)) : 1;
    const maxBidAmount = currentBids.length > 0 ? Math.max(...currentBids.map((b: any) => b.amount)) : 1;

    return (
        <div className="flex flex-col bg-white min-h-screen relative pb-[120px] overflow-x-hidden">
            <style>
                {`
          @font-face {
            font-family: 'OKX Sans';
            src: url('https://www.okx.com/cdn/assets/okfe/libs/fonts/OKX_Sans/Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          body { font-family: 'OKX Sans', sans-serif !important; }
        `}
            </style>

            {/* Top Header Tabs */}
            <div className="px-4 pt-4 pb-2 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5 text-[15px]">
                        <span className="font-bold text-gray-900 border-b-2 border-gray-900 pb-1">Spot</span>
                        <span className="font-semibold text-gray-400 pb-1">Futures</span>
                        <span className="font-semibold text-gray-400 pb-1">Bots</span>
                        <span className="font-semibold text-gray-400 pb-1">Convert</span>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-800" />
                </div>
            </div>

            {/* Symbol Header */}
            <div className="px-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-30 h-[52px]">
                <div className="flex items-center gap-2">
                    <h1 className="text-[22px] font-bold text-gray-900 leading-none">BTC/USDT</h1>
                    <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-1.5 py-[1px] rounded-[4px] leading-none mt-0.5">10x</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 mt-0.5" />
                </div>
                <div className="flex items-center gap-4">
                    <CandlestickChart className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => setActivePage('chart-trade')} />
                    <AlignRight className="w-6 h-6 text-gray-800" />
                </div>
            </div>

            <div className="flex">
                {/* Left Panel: Trade Inputs */}
                <div className="w-[58%] p-3 pr-2 border-r border-gray-50 flex flex-col">
                    <div className="flex rounded-[8px] bg-gray-100 p-[3px] mb-4">
                        <button
                            className={`flex-1 py-1.5 text-[14px] font-bold rounded-[6px] transition-colors ${tradeSide === 'buy' ? 'bg-[#20b26c] text-white shadow-sm' : 'text-gray-500'}`}
                            onClick={() => handleTradeSideSwitch('buy')}
                        >
                            Buy
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-[14px] font-bold rounded-[6px] transition-colors ${tradeSide === 'sell' ? 'bg-[#ef454a] text-white shadow-sm' : 'text-gray-500'}`}
                            onClick={() => handleTradeSideSwitch('sell')}
                        >
                            Sell
                        </button>
                    </div>

                    <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-3 flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-200" onClick={() => setIsOrderTypeSheetOpen(true)}>
                        <span className="font-semibold text-[14px] text-gray-800 flex items-center gap-1.5">
                            {orderType === 'Market' ? 'Market order' : orderType === 'Limit' ? 'Limit order' : 'TP/SL'} <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    </div>

                    <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-3 flex flex-col justify-center border border-transparent focus-within:border-gray-300 transition-colors">
                        <span className="text-[11px] text-gray-500 font-medium leading-none mb-1">Price (USDT)</span>
                        {orderType === 'Market' ? (
                            <div className="font-semibold text-gray-400 text-[15px]">Market price</div>
                        ) : (
                            <input
                                type="text"
                                className="bg-transparent font-semibold text-gray-900 text-[15px] outline-none w-full p-0 leading-none"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-3 flex flex-col justify-center border border-transparent focus-within:border-gray-300 transition-colors relative cursor-text">
                        {amountInput ? (
                            <div className="flex flex-col w-full z-10">
                                <span className="text-[11px] text-gray-500 font-medium leading-none mb-1">Amount (BTC)</span>
                                <input
                                    type="text"
                                    className="bg-transparent font-semibold text-gray-900 text-[15px] outline-none w-full p-0 leading-none"
                                    value={amountInput}
                                    onChange={handleAmountChange}
                                />
                            </div>
                        ) : (
                            <div className="flex justify-between items-center w-full relative">
                                <span className="text-[14px] text-gray-500 font-medium">Amount</span>
                                <span className="text-[14px] text-gray-500 font-medium">BTC</span>
                                <input
                                    type="text"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                                    value={amountInput}
                                    onChange={handleAmountChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Precision Slider */}
                    <div className="relative w-full h-8 flex items-center mb-4 mt-2 px-[6px]">
                        <div className="absolute left-[6px] right-[6px] h-[3px] bg-gray-200">
                            <div className="h-full transition-all duration-75 bg-gray-800" style={{ width: `${sliderPercent}%` }} />
                        </div>
                        <div className="absolute left-[6px] right-[6px] flex justify-between items-center h-full pointer-events-none">
                            {[0, 25, 50, 75, 100].map(val => (
                                <div key={val} className={`w-[9px] h-[9px] rounded-full border-[2px] z-10 transition-colors duration-75 ${sliderPercent >= val ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-300'}`} />
                            ))}
                        </div>
                        <input
                            type="range" min="0" max="100" value={sliderPercent}
                            onChange={handleSliderChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-30 left-0"
                        />
                        <div
                            className="absolute w-[15px] h-[15px] bg-white border-[3.5px] border-gray-800 rounded-full z-20 pointer-events-none transition-all duration-75 shadow-sm"
                            style={{
                                left: `calc(10.5px + (${sliderPercent} / 100) * (100% - 21px))`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                    </div>

                    <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-4 flex flex-col justify-center relative">
                        {totalUsdt && amountInput ? (
                            <div className="flex flex-col w-full z-10">
                                <span className="text-[11px] text-gray-500 font-medium leading-none mb-1">Total (USDT)</span>
                                <input
                                    type="text"
                                    className="bg-transparent font-semibold text-gray-900 text-[15px] outline-none w-full p-0 leading-none pointer-events-none"
                                    value={totalUsdt}
                                    readOnly
                                />
                            </div>
                        ) : (
                            <div className="flex justify-between items-center w-full pointer-events-none z-10">
                                <span className="text-[14px] text-gray-500 font-medium">Total</span>
                                <span className="text-[14px] text-gray-500 font-medium">USDT</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-[12px] mb-1 px-1">
                        <span className="text-gray-400 font-medium">Available</span>
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                            {displayAvailable} {currentAsset} <LuCirclePlus className="w-3.5 h-3.5 text-gray-700" />
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] mb-4 px-1">
                        <span className="text-gray-400 font-medium">Max {tradeSide}</span>
                        <span className="font-medium text-gray-700">{maxBuySellValue} BTC</span>
                    </div>

                    <div className="flex items-center justify-between mb-3 px-1 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIsTpSlEnabled(!isTpSlEnabled)}>
                            <div className={`w-4 h-4 rounded-[3px] flex items-center justify-center border-2 transition-colors ${isTpSlEnabled ? 'border-gray-900 bg-gray-900' : 'border-gray-400'}`}>
                                {isTpSlEnabled && <Check className="w-3 h-3 text-white stroke-[4]" />}
                            </div>
                            <span className="text-[13px] font-medium text-gray-600 border-b border-dashed border-gray-400 leading-none pb-[1px]">TP/SL</span>
                        </label>
                    </div>

                    {isTpSlEnabled && (
                        <div className="animate-in fade-in duration-300">
                            <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-2 flex items-center justify-between">
                                <span className="text-[13px] font-medium text-gray-500">TP trigger price</span>
                                <span className="text-[13px] font-semibold text-gray-800">USDT</span>
                            </div>
                            <div className="bg-[#f5f5f5] rounded-lg px-3 h-[44px] mb-4 flex items-center justify-between">
                                <span className="text-[13px] font-medium text-gray-500">SL trigger price</span>
                                <span className="text-[13px] font-semibold text-gray-800">USDT</span>
                            </div>
                        </div>
                    )}

                    <button
                        className={`w-full py-3 rounded-full font-bold text-white text-[16px] mt-auto shadow-sm ${tradeSide === 'buy' ? 'bg-[#20b26c]' : 'bg-[#ef454a]'}`}
                        onClick={handlePlaceOrder}
                    >
                        {tradeSide === 'buy' ? 'Buy BTC' : 'Sell BTC'}
                    </button>
                </div>

                {/* Right Column: Order Book */}
                <div className="w-[42%] p-3 pl-2 flex flex-col text-[11px]">
                    <div className="flex items-center justify-end gap-2 mb-3">
                        <span className="text-gray-800 text-[13px] font-medium">Margin</span>
                        <div
                            className={`w-[34px] h-[18px] rounded-full flex items-center p-[2px] cursor-pointer ${isMarginEnabled ? 'bg-[#20b26c] justify-end' : 'bg-gray-300 justify-start'}`}
                            onClick={() => setIsMarginEnabled(!isMarginEnabled)}
                        >
                            <div className="w-[14px] h-[14px] bg-white rounded-full shadow-sm" />
                        </div>
                    </div>

                    <div className="flex justify-between text-gray-400 mb-1.5 text-[11px] font-medium px-1">
                        <span>Price<br />(USDT)</span>
                        <span className="text-right">Amount<br />(BTC)</span>
                    </div>

                    {(orderBookView === 'both' || orderBookView === 'sell') && (
                        <div className="flex flex-col flex-1 justify-end relative gap-[1px]">
                            {currentAsks.reverse().map((ask: any, i: number) => (
                                <div key={`ask-${i}`} className="flex justify-between relative h-[22px] items-center px-1">
                                    <div className="absolute right-0 top-0 h-full bg-[#ffecec] transition-all duration-500 ease-in-out" style={{ width: `${(ask.amount / maxAskAmount) * 100}%` }} />
                                    <span className="text-[#ef454a] font-medium relative z-10 text-[12px] tracking-tight">
                                        {ask.price.toLocaleString('en-US', { minimumFractionDigits: precision >= 1 ? 0 : 1, maximumFractionDigits: precision >= 1 ? 0 : 1 })}
                                    </span>
                                    <span className="text-gray-700 relative z-10 text-[12px] font-medium tracking-tight">{ask.amount.toFixed(5)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="py-2 my-0.5 relative group">
                        <div className="flex items-center justify-between px-1">
                            <span className={`text-[18px] font-bold ${isPositive ? 'text-[#20b26c]' : 'text-[#ef454a]'}`}>
                                {ticker ? formatPrice(ticker.lastPrice) : '--'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-[11px] px-1 mt-0.5 font-medium">
                            ≈${ticker ? formatPrice(ticker.lastPrice) : '--'}
                            <span className={isPositive ? 'text-[#20b26c] ml-1' : 'text-[#ef454a] ml-1'}>
                                {ticker ? `${parseFloat(ticker.priceChangePercent) > 0 ? '+' : ''}${parseFloat(ticker.priceChangePercent).toFixed(2)}%` : ''}
                            </span>
                        </div>
                    </div>

                    {(orderBookView === 'both' || orderBookView === 'buy') && (
                        <div className="flex flex-col flex-1 relative gap-[1px]">
                            {currentBids.map((bid: any, i: number) => (
                                <div key={`bid-${i}`} className="flex justify-between relative h-[22px] items-center px-1">
                                    <div className="absolute right-0 top-0 h-full bg-[#e5f7ed] transition-all duration-500 ease-in-out" style={{ width: `${(bid.amount / maxBidAmount) * 100}%` }} />
                                    <span className="text-[#20b26c] font-medium relative z-10 text-[12px] tracking-tight">
                                        {bid.price.toLocaleString('en-US', { minimumFractionDigits: precision >= 1 ? 0 : 1, maximumFractionDigits: precision >= 1 ? 0 : 1 })}
                                    </span>
                                    <span className="text-gray-700 relative z-10 text-[12px] font-medium tracking-tight">{bid.amount.toFixed(5)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {(() => {
                        let buyRatio = 50;
                        if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
                            const totalBids = orderBook.bids.reduce((acc, curr: any) => acc + curr.amount, 0);
                            const totalAsks = orderBook.asks.reduce((acc, curr: any) => acc + curr.amount, 0);
                            const total = totalBids + totalAsks;
                            if (total > 0) buyRatio = (totalBids / total) * 100;
                        }
                        const buyDisplay = Math.round(buyRatio);
                        const sellDisplay = 100 - buyDisplay;

                        const sellRatio = 100 - buyRatio;
                        const clampedBuyRatio = Math.max(25, Math.min(75, buyRatio));
                        const clampedSellRatio = 100 - clampedBuyRatio;

                        return (
                            <div className="relative h-[18px] w-full mt-2 mb-3 px-1">
                                <div className="absolute inset-y-0 left-1 right-1 flex gap-[1px]">
                                    <div
                                        className="h-full bg-[#e5f7ed] transition-all duration-500 ease-in-out"
                                        style={{
                                            width: `${clampedBuyRatio}%`,
                                            clipPath: 'polygon(0 0, 100% 0, calc(100% - 3px) 100%, 0 100%)',
                                        }}
                                    />
                                    <div
                                        className="h-full bg-[#ffecec] transition-all duration-500 ease-in-out"
                                        style={{
                                            width: `${clampedSellRatio}%`,
                                            clipPath: 'polygon(3px 0, 100% 0, 100% 100%, 0 100%)',
                                        }}
                                    />
                                </div>

                                <div className="relative h-full flex items-center justify-between z-10 pointer-events-none">
                                    <div className="flex items-center h-full text-[#20b26c] font-bold text-[10px]">
                                        <div className="h-full w-[18px] flex items-center justify-center border border-[#20b26c] rounded-[4px] mr-2 text-[9px] bg-transparent">
                                            B
                                        </div>
                                        {Math.round(buyRatio)}%
                                    </div>

                                    <div className="flex items-center h-full text-[#ef454a] font-bold text-[10px]">
                                        {Math.round(sellRatio)}%
                                        <div className="h-full w-[18px] flex items-center justify-center border border-[#ef454a] rounded-[4px] ml-2 text-[9px] bg-transparent">
                                            S
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="flex items-center gap-1.5 px-1">
                        <div
                            className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-100 px-2 h-[26px] rounded-[6px] text-[13px] font-semibold text-gray-600 shadow-sm cursor-pointer"
                            onClick={() => setIsPrecisionSheetOpen(true)}
                        >
                            {precision} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div
                            className="w-[26px] h-[26px] shrink-0 flex flex-col items-center justify-center gap-[4px] border border-gray-100 rounded-[6px] bg-gray-50 cursor-pointer shadow-sm"
                            onClick={cycleOrderBookView}
                        >
                            {orderBookView === 'both' && (
                                <><div className="w-[14px] h-[5px] bg-[#ef454a]" /><div className="w-[14px] h-[5px] bg-[#20b26c]" /></>
                            )}
                            {orderBookView === 'buy' && (
                                <><div className="w-[14px] h-[5px] bg-[#20b26c]" /><div className="w-[14px] h-[5px] bg-[#20b26c]" /></>
                            )}
                            {orderBookView === 'sell' && (
                                <><div className="w-[14px] h-[5px] bg-[#ef454a]" /><div className="w-[14px] h-[5px] bg-[#ef454a]" /></>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders/Positions Tabs */}
            <div className="border-b border-gray-100 px-4 flex items-center justify-between sticky top-[52px] z-20 bg-white h-[48px]">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar h-full pr-10">
                    <div
                        className={`flex items-center gap-1 h-full shrink-0 cursor-pointer transition-colors ${activeTab === 'orders' ? 'text-gray-900 font-bold' : 'text-gray-500 font-semibold'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <span className="text-[14px]">Orders ({
                            openOrders.filter(o => !isCurrentSymbolChecked || o.symbol === 'BTCUSDT').length
                        })</span>
                        <ChevronDown className="w-3 h-3 pt-0.5" />
                    </div>
                    <div
                        className={`flex items-center gap-1 h-full shrink-0 cursor-pointer transition-colors ${activeTab === 'positions' ? 'text-gray-900 font-bold' : 'text-gray-500 font-semibold'}`}
                        onClick={() => setActiveTab('positions')}
                    >
                        <span className="text-[14px]">Positions ({
                            positions.filter(p => !isCurrentSymbolChecked || p.symbol === 'BTCUSDT').length +
                            Object.entries(wallets?.spot || {})
                                .filter(([symbol, amount]) => symbol !== 'USDT' && amount > 0 && (!isCurrentSymbolChecked || symbol === 'BTC')).length
                        }) & assets</span>
                        <ChevronDown className="w-3 h-3 pt-0.5" />
                    </div>
                    <div
                        className={`flex items-center gap-1 h-full shrink-0 cursor-pointer transition-colors ${activeTab === 'bots' ? 'text-gray-900 font-bold' : 'text-gray-500 font-semibold'}`}
                        onClick={() => setActiveTab('bots')}
                    >
                        <span className="text-[14px]">Bots (0)</span>
                    </div>
                </div>
                <div className="flex items-center h-full pl-2 bg-white sticky right-0">
                    <FileText className="w-5 h-5 text-gray-800" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-[400px] relative z-10 bg-white">
                {activeTab === 'orders' && (
                    <div className="flex flex-col">
                        <div className="px-4 py-2.5 flex items-center justify-between bg-white border-b border-gray-50">
                            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCurrentSymbolChecked(!isCurrentSymbolChecked)}>
                                <div className={`w-[15px] h-[15px] rounded-[3px] flex items-center justify-center border-[1.5px] transition-colors ${isCurrentSymbolChecked ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                                    {isCurrentSymbolChecked && <Check className="w-3 h-3 text-white stroke-[4]" />}
                                </div>
                                <span className="text-[13px] font-medium text-gray-800">Current symbol</span>
                            </label>
                            <button className="bg-[#f5f5f5] text-[#cccccc] text-[12px] font-semibold px-3 py-1.5 rounded-full cursor-not-allowed" disabled>
                                Cancel all
                            </button>
                        </div>

                        {/* Order Cards from Store */}
                        {openOrders
                            .filter(order => !isCurrentSymbolChecked || order.symbol === 'BTCUSDT')
                            .map((order) => (
                                <div key={order.id} className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-[16px] font-bold text-gray-900">{order.symbol.replace('USDT', '/USDT')} <ChevronRight className="w-4 h-4 inline text-gray-400" /></h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FiEdit2 className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-400 font-medium">|</span>
                                            <span className="text-[14px] font-semibold text-gray-900">Chase</span>
                                            <span className="text-[14px] font-semibold text-gray-900 cursor-pointer" onClick={() => cancelSpotOrder(order.id)}>Cancel</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <span className="bg-[#e5f7ed] text-[#20b26c] text-[11px] font-bold px-1.5 py-[2px] rounded-[2px]">{order.type}</span>
                                        <span className={`${order.side === 'Buy' ? 'bg-[#e5f7ed] text-[#20b26c]' : 'bg-[#fdeaea] text-[#ef454a]'} text-[11px] font-bold px-1.5 py-[2px] rounded-[2px]`}>{order.side}</span>
                                        <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-1.5 py-[2px] rounded-[2px]">{order.marginMode} {order.leverage}x</span>
                                        <span className="text-[11px] text-gray-400 font-medium ml-1">03/03, 03:04:03</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                        <div>
                                            <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 w-max">Order amount (BTC)</p>
                                            <p className="text-[15px] font-bold text-gray-900">{order.amount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 mx-auto w-max">Filled (BTC)</p>
                                            <p className="text-[15px] font-bold text-gray-900">{order.filled}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 ml-auto w-max">Order price</p>
                                            <p className="text-[15px] font-bold text-gray-900">{order.price.toLocaleString('en-US')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Empty state placeholder if no orders */}
                        {openOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center relative mb-4">
                                    <div className="absolute -left-1 bottom-4 w-5 h-4 bg-[#4a5568] rounded-[3px]" />
                                    <div className="absolute -left-1 bottom-9 w-5 h-4 bg-[#4a5568] rounded-[3px]" />
                                    <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm z-10">
                                        <span className="text-gray-300 text-xl font-light">!</span>
                                    </div>
                                </div>
                                <span className="text-[14px] text-gray-400 font-medium">No open orders</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'positions' && (
                    <div className="flex flex-col">
                        <div className="px-4 py-2.5 flex items-center justify-between bg-white border-b border-gray-50">
                            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCurrentSymbolChecked(!isCurrentSymbolChecked)}>
                                <div className={`w-[15px] h-[15px] rounded-[3px] flex items-center justify-center border-[1.5px] transition-colors ${isCurrentSymbolChecked ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                                    {isCurrentSymbolChecked && <Check className="w-3 h-3 text-white stroke-[4]" />}
                                </div>
                                <span className="text-[13px] font-medium text-gray-800">Current symbol</span>
                            </label>
                            <button className="bg-[#f5f5f5] text-[#cccccc] text-[12px] font-semibold px-3 py-1.5 rounded-full cursor-not-allowed" disabled>
                                Cancel all
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Position Cards from Store */}
                            {positions
                                .filter(pos => !isCurrentSymbolChecked || pos.symbol === 'BTCUSDT')
                                .map((pos) => (
                                    <div key={pos.id} className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[16px] font-bold text-gray-900">{pos.symbol} Perp</h4>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[12px] text-gray-400 font-medium flex items-center gap-1 justify-end border-b border-dashed border-gray-200 w-max ml-auto">PnL (USDT) <FiShare2 className="w-3.5 h-3.5" /></p>
                                                <p className={`text-[16px] font-bold ${pos.pnl >= 0 ? 'text-[#20b26c]' : 'text-[#ef454a]'}`}>
                                                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-5">
                                            <span className={`${pos.side === 'Buy' ? 'bg-[#e5f7ed] text-[#20b26c]' : 'bg-[#fdeaea] text-[#ef454a]'} text-[11px] font-bold px-1.5 py-[2px] rounded-[2px]`}>{pos.side}</span>
                                            <span className="bg-gray-100 text-gray-500 text-[11px] font-medium px-1.5 py-[2px] rounded-[2px]">{pos.marginMode}</span>
                                            <span className="bg-gray-100 text-gray-900 text-[11px] font-bold px-1.5 py-[2px] rounded-[2px] flex items-center">{pos.leverage}x <FiEdit2 className="ml-1 w-3 h-3" /></span>
                                            <div className="flex gap-[1px] ml-1">
                                                <div className="w-[3px] h-3 bg-[#20b26c]" />
                                                <div className="w-[3px] h-3 bg-[#20b26c]" />
                                                <div className="w-[3px] h-3 bg-gray-200" />
                                                <div className="w-[3px] h-3 bg-gray-200" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-y-4 mb-6">
                                            <div>
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 w-max">Size (BTC)</p>
                                                <p className="text-[15px] font-bold text-gray-900">{pos.size}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 mx-auto w-max flex items-center">Margin (USDT) <LuCirclePlus className="ml-1 w-3 h-3" /></p>
                                                <p className="text-[15px] font-bold text-gray-900">{pos.margin.toFixed(1)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 ml-auto w-max">MMR</p>
                                                <p className="text-[15px] font-bold text-gray-900">249.88%</p>
                                            </div>
                                            <div>
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 w-max">Entry price</p>
                                                <p className="text-[15px] font-bold text-gray-900">{pos.entryPrice.toLocaleString('en-US')}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 mx-auto w-max">Mark price</p>
                                                <p className="text-[15px] font-bold text-gray-900">{pos.markPrice.toLocaleString('en-US')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 ml-auto w-max">Liq. price</p>
                                                <p className="text-[15px] font-bold text-gray-900">{pos.liqPrice.toLocaleString('en-US')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-900 font-bold text-[14px]">TP/SL</button>
                                            <button className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-900 font-bold text-[14px]">Close</button>
                                            <button className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-900 font-bold text-[14px]">Close all</button>
                                        </div>
                                    </div>
                                ))}

                            {/* Spot Assets as Position Cards */}
                            {Object.entries(wallets?.spot || {})
                                .filter(([symbol, balance]: [string, any]) => {
                                    if (symbol === 'USDT' || balance <= 0) return false;
                                    if (isCurrentSymbolChecked) return symbol === 'BTC';
                                    return true;
                                })
                                .map(([symbol, balance]) => {
                                    const marketSymbol = `${symbol}USDT`;
                                    const market = markets.find(m => m.symbol === marketSymbol);
                                    const lastPrice = market ? parseFloat(market.lastPrice) : (symbol === 'BTC' ? (ticker?.lastPrice || 68940.6) : 1);

                                    // Mock cost price for demo
                                    const mockCostPrice = symbol === 'BTC' ? 64685.59 : lastPrice * 0.98;
                                    const pnlAbsolute = (lastPrice - mockCostPrice) * balance;
                                    const pnlPercent = ((lastPrice - mockCostPrice) / mockCostPrice) * 100;

                                    return (
                                        <div key={`spot-${symbol}`} className="mb-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${symbol === 'BTC' ? 'bg-[#f7931a]' : 'bg-[#10b981]'}`}>
                                                        {symbol[0]}
                                                    </div>
                                                    <h4 className="text-[16px] font-bold text-gray-900">{symbol}/USDT</h4>
                                                    <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-1 rounded-sm">Spot</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] text-gray-400 font-medium border-b border-dashed border-gray-200 w-max ml-auto">PnL (USDT)</p>
                                                    <p className={`text-[16px] font-bold ${pnlAbsolute >= 0 ? 'text-[#20b26c]' : 'text-[#ef454a]'}`}>
                                                        {pnlAbsolute >= 0 ? '+' : ''}{pnlAbsolute.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-y-4 mb-6">
                                                <div>
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 w-max">Amount ({symbol})</p>
                                                    <p className="text-[15px] font-bold text-gray-900">{balance.toFixed(symbol === 'BTC' ? 4 : 2)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 mx-auto w-max">Value (USDT)</p>
                                                    <p className="text-[15px] font-bold text-gray-900">{(balance * lastPrice).toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 ml-auto w-max">Equity</p>
                                                    <p className="text-[15px] font-bold text-gray-900">100%</p>
                                                </div>
                                                <div>
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 w-max">Cost price</p>
                                                    <p className="text-[15px] font-bold text-gray-900">{mockCostPrice.toLocaleString('en-US')}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 mx-auto w-max">Last price</p>
                                                    <p className="text-[15px] font-bold text-gray-900">{lastPrice.toLocaleString('en-US')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] text-gray-400 font-medium mb-1 border-b border-dashed border-gray-200 ml-auto w-max">Action</p>
                                                    <button className="text-[13px] font-bold text-[#20b26c]">Buy/Sell</button>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-900 font-bold text-[14px]">TP/SL</button>
                                                <button className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-900 font-bold text-[14px]">Sell</button>
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* USDT Wallet Balance (separate section or end of list) */}
                            {(!isCurrentSymbolChecked && wallets?.spot?.USDT > 0) && (
                                <div className="mt-8 pt-6 border-t border-gray-100 opacity-60">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-[#26a17b] flex items-center justify-center text-[10px] text-white font-bold">T</div>
                                            <span className="text-[14px] font-bold text-gray-500">USDT Wallet</span>
                                        </div>
                                        <span className="text-[16px] font-bold text-gray-700">${wallets.spot.USDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'bots' && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center relative mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <span className="text-[14px] text-gray-400 font-medium">No active bots</span>
                    </div>
                )}
            </div>

            {/* Mini Chart Drawer */}
            <div className={`fixed bottom-[65px] w-full max-w-md bg-white transition-all duration-300 border-t border-gray-100 z-40 ${isMiniChartOpen ? 'h-[280px] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]' : 'h-[44px]'}`}>
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => setIsMiniChartOpen(!isMiniChartOpen)}
                >
                    <span className="text-[14px] font-bold text-gray-900">BTC/USDT chart</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isMiniChartOpen ? '' : 'rotate-180'}`} />
                </div>
                {isMiniChartOpen && (
                    <div className="px-4 pb-2 animate-in fade-in">
                        <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-2">
                            <span>5m</span><span>15m</span>
                            <span className="text-gray-900 font-bold border-b-2 border-gray-900 pb-2 -mb-2">1h</span>
                            <span>4h</span>
                            <span>More <ChevronDown className="w-3.5 h-3.5 inline" /></span>
                        </div>
                        <div className="h-[200px] w-full relative bg-white">
                            <div className="absolute top-2 left-0 z-10 opacity-[0.03] pointer-events-none w-full h-full flex justify-center items-center">
                                <h1 className="text-[100px] font-black text-gray-900">OKX</h1>
                            </div>
                            {renderSvgChart(200)}
                        </div>
                    </div>
                )}
            </div>
            {/* Precision Bottom Sheet */}
            <AnimatePresence>
                {isPrecisionSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-[100]"
                            onClick={() => setIsPrecisionSheetOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[101] px-4 pb-8"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-3 mb-6" onClick={() => setIsPrecisionSheetOpen(false)} />
                                <div className="w-full flex flex-col gap-1">
                                    {[0.1, 1, 10, 100].map((val) => (
                                        <button
                                            key={val}
                                            className={`w-full py-4 rounded-xl text-[16px] font-semibold flex items-center justify-between px-4 transition-colors ${precision === val ? 'bg-gray-50 text-gray-900' : 'text-gray-500'}`}
                                            onClick={() => {
                                                setPrecision(val);
                                                setIsPrecisionSheetOpen(false);
                                            }}
                                        >
                                            {val}
                                            {precision === val && <Check className="w-5 h-5 text-[#20b26c]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Order Type Sheet */}
            <AnimatePresence>
                {isOrderTypeSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-[100]"
                            onClick={() => setIsOrderTypeSheetOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[101] px-4 pt-2 pb-10"
                        >
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                            <div className="flex items-center gap-2 mb-6 px-1">
                                <span className="text-[16px] font-bold text-gray-900">Basic</span>
                                <Info className="w-4 h-4 text-gray-300" />
                            </div>

                            <div className="flex flex-col gap-8">
                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => { setOrderType('Limit'); setIsOrderTypeSheetOpen(false); }}
                                >
                                    <div className="pt-1.5 min-w-[32px]">
                                        <svg width="32" height="20" viewBox="0 0 32 20">
                                            <line x1="0" y1="14" x2="10" y2="14" stroke="#9ca3af" strokeWidth="2" strokeDasharray="2,2" />
                                            <path d="M10 14 L16 8 L32 8" fill="none" stroke="#111827" strokeWidth="2" />
                                            <circle cx="16" cy="8" r="3" fill="#ffffff" stroke="#111827" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[18px] font-bold text-gray-900 mb-1">Limit order</h4>
                                        <p className="text-[14px] text-gray-500 font-medium leading-tight">Buy or sell at a specified price or better</p>
                                    </div>
                                    {orderType === 'Limit' && (
                                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center self-center">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => { setOrderType('Market'); setIsOrderTypeSheetOpen(false); }}
                                >
                                    <div className="pt-1.5 min-w-[32px]">
                                        <svg width="32" height="20" viewBox="0 0 32 20">
                                            <line x1="0" y1="12" x2="12" y2="12" stroke="#9ca3af" strokeWidth="2" strokeDasharray="2,2" />
                                            <line x1="12" y1="12" x2="28" y2="4" stroke="#111827" strokeWidth="2" />
                                            <circle cx="20" cy="8" r="3" fill="#ffffff" stroke="#111827" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[18px] font-bold text-gray-900 mb-1">Market order</h4>
                                        <p className="text-[14px] text-gray-500 font-medium leading-tight">Promptly buy or sell at the best price in the current market</p>
                                    </div>
                                    {orderType === 'Market' && (
                                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center self-center">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => { setOrderType('TP/SL'); setIsOrderTypeSheetOpen(false); }}
                                >
                                    <div className="pt-1.5 min-w-[32px]">
                                        <svg width="32" height="24" viewBox="0 0 32 24">
                                            <line x1="0" y1="18" x2="8" y2="18" stroke="#9ca3af" strokeWidth="2" strokeDasharray="2,2" />
                                            <path d="M8 18 L16 10 L24 18" fill="none" stroke="#111827" strokeWidth="2" />
                                            <circle cx="16" cy="10" r="3" fill="#ffffff" stroke="#111827" strokeWidth="2" />
                                            <circle cx="16" cy="18" r="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[18px] font-bold text-gray-900 mb-1">TP/SL</h4>
                                        <p className="text-[14px] text-gray-500 font-medium leading-tight">Automatically place an order when the market price reaches the target price</p>
                                    </div>
                                    {orderType === 'TP/SL' && (
                                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center self-center">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TradeView;
