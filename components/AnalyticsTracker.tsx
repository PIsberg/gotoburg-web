import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        gtag: (command: string, targetId: string, params?: object) => void;
        dataLayer: any[];
    }
}

const AnalyticsTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'page_view', {
                page_location: window.location.href,
                page_path: location.pathname + location.search
            });
        }
    }, [location]);

    return null;
};

export default AnalyticsTracker;
