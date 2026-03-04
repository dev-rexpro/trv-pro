// @ts-nocheck
import React, { useState } from 'react';

interface CoinIconProps {
    symbol: string;
    size?: number;
    iconUrl?: string;
}

const CoinIcon = React.memo(({ symbol, size = 10, iconUrl }: CoinIconProps) => {
    const [error, setError] = useState(false);
    const clean = (symbol === 'USDT' || symbol === 'USDC') ? symbol.toLowerCase() : symbol?.replace('USDT', '').toLowerCase();

    // Priority 1: DexScreener Image URL (passed as prop)
    // Fallback 1: Binance Icons CDN
    // Fallback 2: Initials

    const src = iconUrl || (error ? null : `https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${clean}.svg`);

    return (
        <div className={`w-${size} h-${size} flex items-center justify-center shrink-0 overflow-hidden rounded-full`}>
            {src ? (
                <img
                    src={src}
                    onError={() => setError(true)}
                    className="w-full h-full object-cover"
                    alt={symbol}
                />
            ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {clean?.substring(0, 2).toUpperCase()}
                </div>
            )}
        </div>
    );
});

CoinIcon.displayName = 'CoinIcon';

export default CoinIcon;
