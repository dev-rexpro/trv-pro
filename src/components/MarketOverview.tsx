import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
    FiInfo as Info,
    FiChevronRight as ChevronRight,
} from 'react-icons/fi';
import {
    LuTrendingUp as TrendingUp,
    LuZap as Zap,
    LuGlobe as Globe,
} from 'react-icons/lu';
import useExchangeStore from '../stores/useExchangeStore';
import CoinIcon from './CoinIcon';

const MarketOverview = () => {
    const { markets, futuresMarkets } = useExchangeStore();

    // Mock data for Market Cap Chart
    const mcapData = [2.48, 2.47, 2.49, 2.46, 2.45, 2.46, 2.44, 2.42, 2.43, 2.41, 2.42, 2.41];

    // Calculate Market Flow from real data
    const marketFlow = useMemo(() => {
        const all = [...markets, ...futuresMarkets];
        const up = all.filter(m => parseFloat(m.priceChangePercent) > 0).length;
        const down = all.filter(m => parseFloat(m.priceChangePercent) < 0).length;
        const total = up + down || 1;
        return { up, down, upPercent: (up / total) * 100 };
    }, [markets, futuresMarkets]);

    const renderMcapChart = () => {
        const width = mcapData.length * 40;
        const height = 120;
        const padding = 10;
        const min = Math.min(...mcapData) - 0.05;
        const max = Math.max(...mcapData) + 0.05;
        const range = max - min;
        const step = width / (mcapData.length - 1);

        const points = mcapData.map((val, i) => ({
            x: i * step,
            y: height - padding - ((val - min) / range) * (height - padding * 2)
        }));

        const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        const areaD = `${d} L ${width} ${height} L 0 ${height} Z`;

        return (
            <div className="relative w-full h-[120px] mt-4 mb-2">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="mcapGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#mcapGradient)" />
                    <path d={d} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Horizontal grid lines labels (Simplified) */}
                <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none pr-2">
                    <span>2.75T</span>
                    <span>2.60T</span>
                    <span>2.45T</span>
                    <span>2.30T</span>
                    <span>2.15T</span>
                </div>
                {/* Time labels */}
                <div className="flex justify-between text-[10px] text-slate-300 mt-1 px-4">
                    <span>05:33</span>
                    <span>11:06</span>
                    <span>16:40</span>
                    <span>22:13</span>
                    <span>03:46</span>
                </div>
            </div>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="px-4 pb-10 flex flex-col gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Market Cap Section */}
            <motion.section variants={itemVariants}>
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 pt-4">
                        <h2 className="text-[20px] font-bold text-slate-900">Market cap</h2>
                        <span className="text-slate-400"><Info size={16} /></span>
                    </div>
                    <div className="text-right">
                        <div className="text-[20px] font-bold text-slate-900">$2.41T</div>
                        <div className="inline-block bg-[#FDEAEA] text-[#EF454A] text-[12px] font-bold px-2 py-0.5 rounded-[4px]">-3.22%</div>
                    </div>
                </div>

                <div className="flex justify-between text-[13px] font-semibold text-slate-400 mt-2">
                    <span className="text-slate-900 bg-slate-100 rounded-full px-3 py-0.5 font-bold">24h</span>
                    <span>7D</span>
                    <span>30D</span>
                    <span>90D</span>
                    <span>1Y</span>
                    <span>All</span>
                </div>

                {renderMcapChart()}

                <div className="flex p-[3px] bg-slate-50 border border-slate-100 rounded-full mt-4">
                    <button className="flex-1 text-[13px] font-bold py-1.5 rounded-full bg-white shadow-sm text-slate-900">Market cap</button>
                    <button className="flex-1 text-[13px] font-medium py-1.5 text-slate-500">Turnover</button>
                    <button className="flex-1 text-[13px] font-medium py-1.5 text-slate-500">Dominance</button>
                </div>
            </motion.section>

            {/* Market Flow Section */}
            <motion.section variants={itemVariants} className="bg-slate-50 rounded-xl p-4">
                <div className="text-[13px] font-medium text-slate-400 mb-3">Market flow</div>
                <div className="flex gap-1 h-[8px] w-full rounded-full overflow-hidden mb-3">
                    <div className="bg-[#20b26c]" style={{ width: '15%' }} />
                    <div className="bg-[#e5f7ed]" style={{ width: '10%' }} />
                    <div className="bg-[#fdeaea]" style={{ width: '10%' }} />
                    <div className="bg-[#fbcaca]" style={{ width: '15%' }} />
                    <div className="bg-[#ef454a]" style={{ width: '50%' }} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[#20b26c] text-[13px] font-bold flex items-center gap-1">
                        <span className="inline-block transform rotate-[-45deg]"><TrendingUp size={14} /></span> 43
                    </span>
                    <div className="flex-1 flex justify-center opacity-30">
                        <span className="inline-block transform rotate-90"><ChevronRight size={16} /></span>
                    </div>
                    <span className="text-[#ef454a] text-[13px] font-bold flex items-center gap-1">
                        249 <span className="inline-block transform rotate-[135deg]"><TrendingUp size={14} /></span>
                    </span>
                </div>
            </motion.section>

            {/* Trading Calendar Section */}
            <motion.section variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900">Trading calendar</h2>
                    <span className="text-slate-400"><ChevronRight size={20} /></span>
                </div>
                <div className="flex flex-col gap-2">
                    {[
                        "Core Inflation Rate MoM (U.S.)",
                        "Inflation Rate MoM (U.S.)",
                        "Core Inflation Rate YoY (U.S.)"
                    ].map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                    <span className="text-slate-900"><Globe size={18} /></span>
                                </div>
                                <span className="text-[14px] font-bold text-slate-900">{event}</span>
                            </div>
                            <span className="text-[12px] font-medium text-slate-400">03/11, 19:30</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Trending Categories Section */}
            <motion.section variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900">Trending categories</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {/* DeFi Card */}
                    <div className="col-span-1 row-span-2 bg-[#FDEAEA] rounded-xl p-3 flex flex-col justify-between min-h-[180px]">
                        <div>
                            <div className="text-[#EF454A] text-[16px] font-bold leading-tight">DeFi</div>
                            <div className="text-[#EF454A] text-[12px] font-bold">-4.59%</div>
                        </div>
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                            <CoinIcon symbol="LRC" size={20} />
                            <CoinIcon symbol="AAVE" size={20} />
                            <CoinIcon symbol="CRV" size={20} />
                            <span className="text-[9px] text-slate-400 pl-2 font-bold">+50</span>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                        <div className="bg-[#FDEAEA] rounded-xl p-3 h-[88px] flex flex-col justify-between">
                            <div>
                                <div className="text-[#EF454A] text-[14px] font-bold leading-tight">AI</div>
                                <div className="text-[#EF454A] text-[11px] font-bold">-4.35%</div>
                            </div>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                <CoinIcon symbol="NEAR" size={20} />
                                <CoinIcon symbol="FET" size={20} />
                                <CoinIcon symbol="GRT" size={20} />
                                <span className="text-[9px] text-slate-400 pl-2 font-bold">+17</span>
                            </div>
                        </div>
                        <div className="bg-[#FDEAEA] rounded-xl p-3 h-[88px] flex flex-col justify-between">
                            <div>
                                <div className="text-[#EF454A] text-[14px] font-bold leading-tight">Top</div>
                                <div className="text-[#EF454A] text-[11px] font-bold">-4.19%</div>
                            </div>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                <CoinIcon symbol="BNB" size={20} />
                                <CoinIcon symbol="ADA" size={20} />
                                <CoinIcon symbol="XRP" size={20} />
                                <span className="text-[9px] text-slate-400 pl-2 font-bold">+5</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-2">
                        <div className="bg-[#FDEAEA] rounded-xl p-3 h-[88px] flex flex-col justify-between">
                            <div>
                                <div className="text-[#EF454A] text-[14px] font-bold leading-tight">DePIN</div>
                                <div className="text-[#EF454A] text-[11px] font-bold">-4.22%</div>
                            </div>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                <CoinIcon symbol="FIL" size={20} />
                                <CoinIcon symbol="HNT" size={20} />
                                <CoinIcon symbol="AR" size={20} />
                                <span className="text-[9px] text-slate-400 pl-2 font-bold">+6</span>
                            </div>
                        </div>
                        <div className="bg-[#FDEAEA] rounded-xl p-3 h-[88px] flex flex-col justify-between">
                            <div>
                                <div className="text-[#EF454A] text-[14px] font-bold leading-tight">Proof of Work</div>
                                <div className="text-[#EF454A] text-[11px] font-bold">-4.15%</div>
                            </div>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                <CoinIcon symbol="LTC" size={20} />
                                <CoinIcon symbol="BCH" size={20} />
                                <CoinIcon symbol="DASH" size={20} />
                                <span className="text-[9px] text-slate-400 pl-2 font-bold">+11</span>
                            </div>
                        </div>
                    </div>

                    {/* Others Button */}
                    <div className="col-start-2 col-span-2 bg-slate-50 rounded-xl flex items-center justify-center p-2 h-[40px] cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="text-slate-900 font-bold text-[14px]">Others</span>
                    </div>
                </div>
            </motion.section>

            {/* Trade Radar Section */}
            <motion.section variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900">Trade radar</h2>
                    <span className="text-slate-400"><ChevronRight size={20} /></span>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { symbol: "FLOW", change: "+23.15%", text: "Price surged +1.86% in the last 5m.", time: "2m ago", color: "#20b26c" },
                        { symbol: "NFT", change: "+0.42%", text: "Price surged +0.33% in the last 5m.", time: "2m ago", color: "#20b26c" }
                    ].map((alert, i) => (
                        <div key={i} className="min-w-[280px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CoinIcon symbol={alert.symbol} size={32} />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[15px] font-bold text-slate-900">{alert.symbol}</span>
                                            <span className="text-[#20b26c] text-[13px] font-bold">{alert.change}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#EBEEF2] text-[#636D7F] text-[10px] font-bold px-1.5 py-[2px] rounded-sm flex items-center gap-1 uppercase">
                                    Price swing
                                </div>
                            </div>
                            <p className="text-[14px] font-medium text-slate-900 mb-2">{alert.text}</p>
                            <div className="flex items-center justify-between text-[12px] text-slate-400">
                                <span>{alert.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Bottom Nav Spacer */}
            <div className="h-10" />
        </motion.div>
    );
};

export default MarketOverview;
