import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';

interface GoogleMapSectionProps {
    articles: Article[];
}

/**
 * Coordinates live inside the Google Maps share URL as `/@57.70,11.97,17z`.
 * One parser for both the markers and the list under the map, so the two can
 * never disagree about which places are on this page.
 */
export const placeCoordinates = (article: Article): { lat: number; lng: number } | null => {
    const match = article.googleMapsUrl?.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return null;
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
};

export const mappedArticles = (articles: Article[]): Article[] =>
    articles.filter(article => placeCoordinates(article) !== null);

// Custom hook to load Google Maps script
const useGoogleMapsScript = (apiKey: string) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        // The script tag loads and onload fires even when the API then refuses
        // to draw anything, so onload alone is not evidence of a working map.
        // Google calls this global on auth and billing failures; without it the
        // page sat on an empty grey box, which is what production has been
        // serving since billing was disabled (BillingNotEnabledMapError).
        (window as any).gm_authFailure = () => setFailed(true);

        if ((window as any).google?.maps) {
            setLoaded(true);
            return;
        }

        // loading=async is what Google asks for; without it the API logs a
        // performance warning on every page view. libraries=places was loaded
        // and never used, which widened the key's API surface to a separately
        // billed product for nothing.
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);
        script.onerror = () => setFailed(true);
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, [apiKey]);

    return { loaded, failed };
};

const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({ articles }) => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const { loaded: isLoaded, failed } = useGoogleMapsScript(apiKey || '');
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Filter articles with map links and parse coordinates
    const mapArticles = mappedArticles(articles);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || !apiKey) return;

        if (!map) {
            const newMap = new google.maps.Map(mapRef.current, {
                center: { lat: 57.70887, lng: 11.97456 }, // Default to Gothenburg Center
                zoom: 12,
                mapId: 'gotoburg-map', // Required for advanced markers if used, can be optional
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                // No `styles` here: with a mapId present the API ignores it and
                // warns. Styling belongs in the cloud console for this map id.
            });
            setMap(newMap);
        }
    }, [isLoaded, apiKey]);

    useEffect(() => {
        if (!map) return;

        // Clear existing markers if we were tracking them (omitted for simplicity as articles usually load once)
        const markers: google.maps.Marker[] = [];

        mapArticles.forEach(article => {
            try {
                const position = placeCoordinates(article);
                if (position) {
                    const { lat, lng } = position;

                    const marker = new google.maps.Marker({
                        position: { lat, lng },
                        map: map,
                        title: article.title,
                        animation: google.maps.Animation.DROP,
                    });

                    // Standard InfoWindow for hover preview
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="padding: 4px; max-width: 200px;">
                                <h4 style="font-weight: bold; margin: 0; font-size: 14px;">${article.title}</h4>
                                <p style="font-size: 11px; margin: 2px 0; color: #666;">${article.category}</p>
                                <span style="font-size: 10px; color: blue;">Klicka för att läsa</span>
                            </div>
                        `,
                        disableAutoPan: true // Prevent map moving on hover
                    });

                    marker.addListener('mouseover', () => {
                        infoWindow.open(map, marker);
                    });

                    marker.addListener('mouseout', () => {
                        infoWindow.close();
                    });

                    // Direct navigation on click
                    marker.addListener('click', () => {
                        // Was `window.location.hash = ...`, which only navigated
                        // while the app used HashRouter.
                        navigate(`/${article.slug}`);
                    });

                    markers.push(marker);
                }
            } catch (e) {
                console.error('Failed to parse map URL for article:', article.title, e);
            }
        });

        // Fit bounds if we have markers
        if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(m => bounds.extend(m.getPosition()!));
            map.fitBounds(bounds);
            // Don't zoom in too close automatically
            const listener = google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom()! > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
            });
        }

        return () => {
            markers.forEach(m => m.setMap(null));
        };

    }, [map, articles]);

    // A visitor is not the audience for a build instruction. The old version of
    // this panel told them to edit .env.local and read README.md, which is what
    // production would have shown had the key ever gone missing from Netlify.
    if (!apiKey || failed) {
        return (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl mb-8 p-6 text-center">
                <p className="text-gray-600 font-serif">
                    Kartan kan inte visas just nu. Alla platser finns i listan nedan.
                </p>
            </div>
        );
    }

    if (mapArticles.length === 0) {
        return (
            <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl mb-12 flex flex-col items-center justify-center text-center p-6">
                <p className="text-gray-500 font-medium">Inga artiklar med kartpositioner hittades.</p>
                <p className="text-xs text-gray-400 mt-1">Lägg till Google Maps-länkar i admin-panelen för att visa dem här.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100 mb-12 relative">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500 font-serif animate-pulse">Laddar karta...</p>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};

export default GoogleMapSection;
