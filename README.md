# 🚀 Triv Exchange Simulator

![Triv Banner](https://img.shields.io/badge/Triv-Crypto_Exchange-000000?style=for-the-badge&logo=bitcoin)

A high-fidelity **Crypto Exchange Demo** built specifically to simulate realistic trading experiences (Spot & Futures) and asset management. 

Featuring real-time, live order books and ticker prices powered by the **MEXC WebSocket V3 API**, Triv enables users to mock-trade with virtual funds and experience the thrill of a professional exchange environment without financial risk.

## 🌟 Key Features

### 📡 Real-Time Market Data
- **Live MEXC Integration**: Direct WebSocket connection (`wss://wbs.mexc.com/ws`) for hyper-fast, zero-delay price feeds affecting all platform values.
- **Dynamic Order Book**: Visually engaging Trade components reacting to live depth/liquidity shifts.
- **Sparkline Charts**: Lightweight Charts integration for aesthetic mini-price-curves across the dashboard.

### 💼 Comprehensive Wallet Engine
- **Spot Trading**: Support for major pairs (BTCUSDT, SOLUSDT, IDR, etc.) with functional balance deductions/additions. 
- **Futures Account**: Separate $5,000 USDT mock balance, built to showcase separate portfolio isolation.
- **Earn Ecosystem**: Passive stacking and reward UI mockup (Earn up to 12% APY, Dual Investment, Auto-Invest).
- **Consolidated Overview**: Instant net-worth calculation and 24h PnL that spans across all fragmented wallets instantly.

### 🎨 Pixel-Perfect UI/UX
- **Smooth Animations**: Tailored micro-interactions and transition delays ensure numbers (SlotTickers) don't jump aggressively, providing a premium feel.
- **Dark & Light Theming**: Fully styled utilizing the power of Tailwind CSS v4.
- **Responsive Navigation**: Bottom-tab ecosystem perfect for mobile/tablet dimensions with persistent sticky headers and elegant, non-scrolling footers.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust typing and error prevention.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for rapid, modern UI building.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, predictable global store logic (Wallet Balances, Prices, Navigation).
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Lightweight Charts (TradingView)](https://www.tradingview.com/lightweight-charts/)

## 🚀 Getting Started

### Prerequisites

You will need **Node.js** (v18+ recommended) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/triv-exchange.git
   cd triv-exchange/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Navigate** to `http://localhost:5173` in your browser.

## 📁 Project Structure

```bash
📦 src
 ┣ 📂 components       # Reusable UI elements (SlotTicker, PriceDisplay, Layout)
 ┣ 📂 hooks            # Custom React Hooks (useWebSocket, useTheme)
 ┣ 📂 pages            # Main Route Views (Home, Assets, Markets, Trade, Futures)
 ┣ 📂 providers        # Context Providers (WebSocketProvider)
 ┣ 📂 store            # Zustand Global State (useStore.ts)
 ┣ 📜 App.tsx          # Main Application Router
 ┗ 📜 main.tsx         # Vite Entry Point
```

## 🔒 Security
100% Mock implementation. **Secured by Fireblocks & Elliptic (Simulated)**. No real private keys, deposits, or mainnet transactions are processed by this application. 

---
*Built with ❤️ for advanced React and Fintech prototyping.*
