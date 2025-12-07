import React, { useEffect } from 'react';
import { ADSENSE_CONFIG } from '../src/constants';

interface AdSenseProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: string; // 'true' or 'false'
    className?: string;
    label?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdSense: React.FC<AdSenseProps> = ({
    slot,
    format = 'auto',
    responsive = 'true',
    className = '',
    label,
    style = { display: 'block' }
}) => {
    // Check if running on localhost or 127.0.0.1
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div
            className={`adsense-container ${className} ${isDev ? 'bg-gray-100 border-2 border-dashed border-gray-300 relative min-h-[100px] flex items-center justify-center' : ''}`}
        >
            {label && <div className="text-[10px] uppercase text-gray-400 font-sans tracking-widest mb-1">{label}</div>}

            {/* Debug overlay for dev mode */}
            {isDev && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-gray-400 font-mono pointer-events-none z-10">
                    <span>AdSense Slot: {slot}</span>
                    <span className="font-bold text-gray-500">(Test Mode)</span>
                </div>
            )}

            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
                data-adtest={isDev ? "on" : "off"}
            />
        </div>
    );
};

export default AdSense;
