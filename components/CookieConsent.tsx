import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const CONSENT_STORAGE_KEY = 'gotoburg:consent';
const OPEN_SETTINGS_EVENT = 'gotoburg:open-consent';

type ConsentChoice = 'granted' | 'denied';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

/** Re-opens the banner so a visitor can withdraw or change consent (GDPR art. 7.3). */
export const openConsentSettings = () => {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
};

const readStoredChoice = (): ConsentChoice | null => {
    try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch {
        // Private mode or blocked storage: treat as "not asked yet".
        return null;
    }
};

/**
 * Pushes a Consent Mode v2 update to gtag. index.html sets every signal to
 * 'denied' by default, so nothing is stored on the device until this runs.
 */
const applyConsent = (choice: ConsentChoice) => {
    const value = choice === 'granted' ? 'granted' : 'denied';
    window.gtag?.('consent', 'update', {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
    });
};

const CookieConsent: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const stored = readStoredChoice();
        if (stored) {
            applyConsent(stored);
        } else {
            setVisible(true);
        }

        const reopen = () => setVisible(true);
        window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
        return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
    }, []);

    const choose = (choice: ConsentChoice) => {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, choice);
        } catch {
            // Storage blocked: the choice still applies for this page view.
        }
        applyConsent(choice);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-label="Cookie-inställningar"
            data-testid="cookie-consent"
            className="fixed inset-x-0 bottom-0 z-[100] bg-gray-950 text-gray-300 border-t border-gray-800 shadow-2xl"
        >
            <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm leading-relaxed">
                    <p className="font-semibold text-white mb-1">Vi använder cookies</p>
                    <p>
                        Vi vill mäta hur sajten används och visa annonser som betalar för den. Väljer du
                        Endast nödvändiga sparar vi inget för statistik eller annonsanpassning. Läs mer i{' '}
                        <Link to="/integritetspolicy" className="text-blue-400 hover:text-blue-300 underline">
                            integritetspolicyn
                        </Link>.
                    </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={() => choose('denied')}
                        className="px-4 py-2 text-sm font-semibold rounded border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        Endast nödvändiga
                    </button>
                    <button
                        type="button"
                        onClick={() => choose('granted')}
                        className="px-4 py-2 text-sm font-semibold rounded bg-white text-gray-900 hover:bg-gray-200 transition-colors"
                    >
                        Acceptera alla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
