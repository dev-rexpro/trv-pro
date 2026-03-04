import type { MarketData, ExchangeRates } from '../types';

export const fetchBinanceTicker = async (): Promise<MarketData[]> => {
    const r = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const d = await r.json();
    return d
        .filter((p: any) => p.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
};

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    try {
        const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const d = await r.json();
        return d.rates;
    } catch {
        return { USD: 1, USDT: 1, IDR: 16300, BTC: 0.000015 };
    }
};

export const searchDexScreener = async (query: string): Promise<any[]> => {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`);
    const data = await res.json();
    return data.pairs || [];
};
