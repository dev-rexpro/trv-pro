// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    MarketData, Asset, ExchangeRates, FavoriteGroups, CurrencyCode,
    WalletBalances, TransactionRecord, TradeRecord, PendingOrder, FuturesPosition, UnifiedCoin
} from '../types';
import type { BinanceSymbolInfo } from '../utils/api';

interface ExchangeState {
    markets: MarketData[];
    futuresMarkets: MarketData[];
    spotSymbols: BinanceSymbolInfo[];
    futuresSymbols: BinanceSymbolInfo[];
    history: string[];
    favorites: string[];
    favoriteGroups: FavoriteGroups;
    balance: number;
    spotBalance: number;
    futuresBalance: number;
    earnBalance: number;
    todayPnl: number;
    pnlPercent: number;
    activePage: string;
    isSearchOpen: boolean;
    isManageGroupsOpen: boolean;
    isDepositOptionOpen: boolean;
    selectedCoin: string;
    tradeType: 'spot' | 'futures';
    isPairPickerOpen: boolean;
    searchQuery: string;
    homeFilter: string;
    assets: Asset[];
    currency: CurrencyCode;
    rates: ExchangeRates;
    hideBalance: boolean;

    // Demo Engine State
    wallets: {
        spot: WalletBalances;
        futures: WalletBalances;
        earn: WalletBalances;
    };
    positions: FuturesPosition[];
    openOrders: PendingOrder[];
    transactionHistory: TransactionRecord[];
    tradeHistory: TradeRecord[];
    watchlist: UnifiedCoin[];

    // Actions
    setMarkets: (data: MarketData[]) => void;
    setFuturesMarkets: (data: MarketData[]) => void;
    setSpotSymbols: (data: BinanceSymbolInfo[]) => void;
    setFuturesSymbols: (data: BinanceSymbolInfo[]) => void;
    setCurrency: (currency: CurrencyCode) => void;
    setRates: (rates: ExchangeRates) => void;
    setActivePage: (page: string) => void;
    setSearchOpen: (val: boolean) => void;
    setManageGroupsOpen: (val: boolean) => void;
    setDepositOptionOpen: (val: boolean) => void;
    setSearchQuery: (query: string) => void;
    setHomeFilter: (filter: string) => void;
    setTradeType: (type: 'spot' | 'futures') => void;
    setPairPickerOpen: (val: boolean) => void;
    clearHistory: () => void;
    addToHistory: (query: string) => void;
    toggleFavorite: (symbol: string) => void;
    addFavoriteGroup: (name: string) => void;
    deleteFavoriteGroup: (name: string) => void;
    updateAssetPrices: () => void;

    // Demo Actions
    setWallets: (wallets: { spot: WalletBalances; futures: WalletBalances; earn: WalletBalances }) => void;
    addTransaction: (tx: TransactionRecord) => void;
    addTrade: (trade: TradeRecord) => void;
    addPosition: (pos: FuturesPosition) => void;
    removePosition: (id: string) => void;
    updatePosition: (id: string, updates: Partial<FuturesPosition>) => void;
    resetWallets: () => void;
    setHideBalance: (val: boolean) => void;
}

const useExchangeStore = create<ExchangeState>()(
    persist(
        (set, get) => ({
            markets: [],
            futuresMarkets: [],
            spotSymbols: [],
            futuresSymbols: [],
            history: ['NEWT (Ethereum)', 'JTOUSDT Perp', 'SOLUSDT Perp'],
            favorites: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'],
            favoriteGroups: { 'Group-1': ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'] },
            balance: 0,
            spotBalance: 0,
            futuresBalance: 0,
            earnBalance: 0,
            todayPnl: 0,
            pnlPercent: 0,
            activePage: 'home',
            isSearchOpen: false,
            isManageGroupsOpen: false,
            isDepositOptionOpen: false,
            selectedCoin: 'BTCUSDT',
            tradeType: 'spot',
            isPairPickerOpen: false,
            searchQuery: '',
            homeFilter: 'Favorites',
            assets: [
                { symbol: 'BTC', amount: 0.15, valueUsdt: 10036.59 },
                { symbol: 'USDT', amount: 5000, valueUsdt: 5000 },
                { symbol: 'SOL', amount: 14.5, valueUsdt: 1225.68 },
                { symbol: 'HYPE', amount: 1000, valueUsdt: 31848 },
            ],
            currency: 'USD',
            rates: { USD: 1, USDT: 1, IDR: 16300, BTC: 0.000015 },
            hideBalance: false,

            // Demo Engine State Init
            wallets: {
                spot: { USDT: 5000, BTC: 0.15, SOL: 14.5, HYPE: 1000 },
                futures: { USDT: 5000 },
                earn: { USDT: 0 }
            },
            positions: [],
            openOrders: [],
            transactionHistory: [],
            tradeHistory: [],
            watchlist: [],

            setMarkets: (data) => set({ markets: data }),
            setFuturesMarkets: (data) => set({ futuresMarkets: data }),
            setSpotSymbols: (data) => set({ spotSymbols: data }),
            setFuturesSymbols: (data) => set({ futuresSymbols: data }),
            setCurrency: (currency) => set({ currency }),
            setRates: (rates) => set({ rates }),
            setHideBalance: (val) => set({ hideBalance: val }),
            setActivePage: (page) => set({ activePage: page }),
            setSearchOpen: (val) => set({ isSearchOpen: val }),
            setManageGroupsOpen: (val) => set({ isManageGroupsOpen: val }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setHomeFilter: (filter) => set({ homeFilter: filter }),
            setTradeType: (type) => set({ tradeType: type }),
            setPairPickerOpen: (val) => set({ isPairPickerOpen: val }),
            clearHistory: () => set({ history: [] }),
            addToHistory: (query) => set((state) => {
                const filtered = state.history.filter(h => h !== query);
                return { history: [query, ...filtered].slice(0, 20) };
            }),

            toggleFavorite: (symbol) => {
                const favs = get().favorites;
                const newFavs = favs.includes(symbol) ? favs.filter(s => s !== symbol) : [...favs, symbol];

                // Also update default group
                const newGroups = { ...get().favoriteGroups };
                if (newGroups['Group-1']) {
                    newGroups['Group-1'] = newFavs;
                }

                set({ favorites: newFavs, favoriteGroups: newGroups });
            },

            addFavoriteGroup: (name) => set((state) => ({ favoriteGroups: { ...state.favoriteGroups, [name]: [] } })),

            deleteFavoriteGroup: (name) => set((state) => {
                const newGroups = { ...state.favoriteGroups };
                delete newGroups[name];
                return { favoriteGroups: newGroups };
            }),

            // Demo Actions Impl
            setWallets: (w) => {
                set({ wallets: w });
                get().updateAssetPrices();
            },
            setDepositOptionOpen: (val) => set({ isDepositOptionOpen: val }),
            addTransaction: (tx) => set(s => ({ transactionHistory: [tx, ...s.transactionHistory] })),
            addTrade: (tr) => set(s => ({ tradeHistory: [tr, ...s.tradeHistory] })),
            addPosition: (pos) => set(s => ({ positions: [...s.positions, pos] })),
            removePosition: (id) => set(s => ({ positions: s.positions.filter(p => p.id !== id) })),
            updatePosition: (id, updates) => set(s => ({
                positions: s.positions.map(p => p.id === id ? { ...p, ...updates } : p)
            })),
            resetWallets: () => {
                const { markets } = get();
                const btcMarket = markets.find(m => m.symbol === 'BTCUSDT' || m.symbol === 'BTCUSD');
                const solMarket = markets.find(m => m.symbol === 'SOLUSDT' || m.symbol === 'SOLUSD');
                const bnbMarket = markets.find(m => m.symbol === 'BNBUSDT' || m.symbol === 'BNBUSD');

                const btcPrice = btcMarket ? parseFloat(btcMarket.lastPrice) : 60000;
                const solPrice = solMarket ? parseFloat(solMarket.lastPrice) : 100;
                const bnbPrice = bnbMarket ? parseFloat(bnbMarket.lastPrice) : 300;

                const btcAmount = 5000 / btcPrice;
                const solAmount = 2500 / solPrice;
                const bnbAmount = 2500 / bnbPrice;

                // Create initial deposit history
                const now = Date.now();
                const initialHistory = [
                    { id: `INIT-USDT-${now}`, type: 'Deposit', status: 'Completed', amount: 5000, currency: 'USDT', timestamp: now, to: 'Futures' },
                    { id: `INIT-BTC-${now}`, type: 'Deposit', status: 'Completed', amount: btcAmount, currency: 'BTC', timestamp: now, to: 'Spot' },
                    { id: `INIT-SOL-${now}`, type: 'Deposit', status: 'Completed', amount: solAmount, currency: 'SOL', timestamp: now, to: 'Spot' },
                    { id: `INIT-BNB-${now}`, type: 'Deposit', status: 'Completed', amount: bnbAmount, currency: 'BNB', timestamp: now, to: 'Spot' },
                ];

                set({
                    wallets: {
                        spot: { USDT: 0, BTC: btcAmount, SOL: solAmount, BNB: bnbAmount },
                        futures: { USDT: 5000 },
                        earn: { USDT: 0 }
                    },
                    transactionHistory: initialHistory,
                    tradeHistory: [],
                    positions: [],
                    openOrders: [],
                });
                get().updateAssetPrices();
            },

            // Auto-Calculation: recalculate asset values from latest market prices and wallets
            // Auto-PnL: compute daily PnL from weighted asset × priceChangePercent
            updateAssetPrices: () => {
                const { wallets, markets } = get();
                let spotTotal = 0;
                let futuresTotal = 0;
                let earnTotal = 0;
                let weightedPnl = 0;

                const updatedAssets = Object.entries(wallets.spot).map(([symbol, amount]) => {
                    let valueUsdt = amount;
                    let changePercent = 0;
                    if (symbol !== 'USDT' && symbol !== 'USDC') {
                        const market = markets.find(m => m.symbol === `${symbol}USDT` || m.symbol === `${symbol}USD`);
                        if (market) {
                            valueUsdt = amount * parseFloat(market.lastPrice);
                            changePercent = parseFloat(market.priceChangePercent);
                        }
                    }
                    spotTotal += valueUsdt;
                    weightedPnl += valueUsdt * changePercent / 100;
                    return { symbol, amount, valueUsdt };
                }).filter(a => a.amount > 0 || a.symbol === 'USDT');

                Object.entries(wallets.futures).forEach(([symbol, amount]) => {
                    let valueUsdt = amount;
                    if (symbol !== 'USDT' && symbol !== 'USDC') {
                        const market = markets.find(m => m.symbol === `${symbol}USDT` || m.symbol === `${symbol}USD`);
                        if (market) valueUsdt = amount * parseFloat(market.lastPrice);
                    }
                    futuresTotal += valueUsdt;
                });

                Object.entries(wallets.earn).forEach(([symbol, amount]) => {
                    let valueUsdt = amount;
                    if (symbol !== 'USDT' && symbol !== 'USDC') {
                        const market = markets.find(m => m.symbol === `${symbol}USDT` || m.symbol === `${symbol}USD`);
                        if (market) valueUsdt = amount * parseFloat(market.lastPrice);
                    }
                    earnTotal += valueUsdt;
                });

                const totalValue = spotTotal + futuresTotal + earnTotal;
                const pnlPercent = totalValue > 0 ? (weightedPnl / totalValue) * 100 : 0;

                // Dynamically update BTC rate for display purposes
                const btcMarket = markets.find(m => m.symbol === 'BTCUSDT');
                const btcPrice = btcMarket ? parseFloat(btcMarket.lastPrice) : 0;
                const newRates = { ...get().rates };
                if (btcPrice > 0) {
                    newRates.BTC = 1 / btcPrice;
                }

                set({
                    assets: updatedAssets,
                    balance: totalValue,
                    spotBalance: spotTotal,
                    futuresBalance: futuresTotal,
                    earnBalance: earnTotal,
                    todayPnl: weightedPnl,
                    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                    rates: newRates,
                });
            },
        }),
        { name: 'triv-ultra-storage' }
    )
);

export default useExchangeStore;
