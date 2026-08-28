import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '../src/constants';

interface AdSenseProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: string; // 'true' or 'false'
    className?: string;
    label?: string;
    style?: React.CSSProperties;
    /**
     * `data-ad-layout`. Required as "in-article" by an in-article unit; without
     * it the unit still serves but renders as a plain display ad instead of the
     * native format it was created as.
     */
    layout?: string;
    /**
     * `data-ad-layout-key`. Generated with an in-feed unit and specific to the
     * layout picked when it was created, so it cannot be guessed or shared
     * between units. Lives in ADSENSE_CONFIG next to the slot id it belongs to.
     */
    layoutKey?: string;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

/**
 * A real AdSense ad unit id is numeric (currently 10 digits). src/constants.ts
 * has shipped placeholders since the ads were first wired in
 * (`header-banner-12345`, `feed-middle-56789`, ...), and AdSense reserves layout
 * space for an `<ins>` it cannot fill: measured in the browser on 2026-08-28,
 * every page opened with roughly 330px of blank white between the nav and the
 * first line of content, on the home page and on every article. That is the
 * first thing a policy reviewer sees, and "low value content" is partly a
 * judgement about the page a visitor lands on.
 *
 * Rendering nothing for a slot we know cannot fill is strictly better than
 * reserving space for it. Drop the real ids into ADSENSE_CONFIG and every slot
 * lights up with no other change.
 */
export const isServableSlot = (slot: string): boolean => /^\d{6,}$/.test(slot.trim());

const AdSense: React.FC<AdSenseProps> = ({
    slot,
    format = 'auto',
    responsive = 'true',
    className = '',
    label,
    style = { display: 'block' },
    layout,
    layoutKey
}) => {
    // Read at render time, so it must survive the prerender pass where there is
    // no window at all.
    const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    const initialized = useRef(false);
    const servable = isServableSlot(slot);

    useEffect(() => {
        if (!servable) return;
        if (initialized.current) return;
        initialized.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, [servable]);

    // No markup at all, so nothing reserves height.
    if (!servable && !isDev) return null;

    return (
        <div
            className={`adsense-container ${className} ${isDev ? 'bg-gray-100 border-2 border-dashed border-gray-300 relative min-h-[100px] flex items-center justify-center' : ''}`}
        >
            {label && <div className="text-[10px] uppercase text-gray-400 font-sans tracking-widest mb-1">{label}</div>}

            {/* Debug overlay for dev mode */}
            {isDev && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-gray-400 font-mono pointer-events-none z-10">
                    <span>AdSense Slot: {slot}</span>
                    <span className="font-bold text-gray-500">
                        {servable ? '(Test Mode)' : '(placeholder id - hidden in production)'}
                    </span>
                </div>
            )}

            {/* The <ins> is what AdSense reserves height for, so a slot that
                cannot fill must not emit one anywhere, dev included. The dev
                placeholder above still marks where the unit will sit; the tests
                run against localhost, so gating this on isDev would assert the
                fix on a page that never had it. */}
            {servable && <ins
                className="adsbygoogle"
                style={{ width: '100%', ...style }}
                data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                {...(layout ? { 'data-ad-layout': layout } : {})}
                {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
                data-full-width-responsive={responsive}
                data-adtest={isDev ? "on" : "off"}
            />}
        </div>
    );
};

export default AdSense;
