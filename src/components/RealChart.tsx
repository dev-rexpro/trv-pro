// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface RealChartProps {
    data: any[];
    height?: number;
    pricePrecision?: number;
}

const RealChart: React.FC<RealChartProps> = ({ data, height = 200, pricePrecision = 2 }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#999999',
                fontSize: 10,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(240, 240, 240, 0.5)' },
                horzLines: { color: 'rgba(240, 240, 240, 0.5)' },
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: { labelBackgroundColor: '#111111' },
                horzLine: { labelBackgroundColor: '#111111' },
            },
            handleScale: { axisPressedMouseMove: true },
            handleScroll: { axisPressedMouseMove: true },
            width: chartContainerRef.current.clientWidth,
            height: height,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#20b26c',
            downColor: '#ef454a',
            borderVisible: false,
            wickUpColor: '#20b26c',
            wickDownColor: '#ef454a',
            priceFormat: {
                type: 'price',
                precision: pricePrecision,
                minMove: 1 / Math.pow(10, pricePrecision),
            },
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (seriesRef.current && data && data.length > 0) {
            // Filter invalid or duplicate times (lightweight-charts requirement)
            const seenTimes = new Set();
            const uniqueData = data.filter(d => {
                if (seenTimes.has(d.time)) return false;
                seenTimes.add(d.time);
                return true;
            }).sort((a, b) => a.time - b.time);

            seriesRef.current.setData(uniqueData);
        }
    }, [data]);

    return (
        <div ref={chartContainerRef} className="w-full relative" style={{ height: `${height}px` }} />
    );
};

export default RealChart;
