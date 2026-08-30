import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type * as Leaflet from 'leaflet';
import { Article } from '../types';

interface MapSectionProps {
    articles: Article[];
}

/**
 * Coordinates live inside the Google Maps share URL as `/@57.70,11.97,17z`.
 * The articles keep those URLs (they are the outbound "Visa på Google Maps"
 * links), so they stay the single source of coordinates. One parser for both
 * the markers and the list under the map, so the two can never disagree about
 * which places are on this page.
 */
export const placeCoordinates = (article: Article): { lat: number; lng: number } | null => {
    const match = article.googleMapsUrl?.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return null;
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
};

export const mappedArticles = (articles: Article[]): Article[] =>
    articles.filter(article => placeCoordinates(article) !== null);

/**
 * Leaflet + OpenStreetMap, replacing the Google Maps JS API. The Cloud project
 * behind the old key never had billing enabled, so production answered
 * BillingNotEnabledMapError from the day the map shipped and every visitor saw
 * the fallback panel instead of a map. OSM tiles need no key, no billing and no
 * loader script, which deletes that entire failure class.
 *
 * Leaflet touches `window` at module scope, and this component is rendered by
 * scripts/entry-server.tsx in Node during prerender. Both the library and its
 * stylesheet are therefore imported dynamically inside the effect; a top-level
 * `import L from 'leaflet'` would crash `npm run build`.
 *
 * The OSM attribution control is a licence term (ODbL), not decoration. Do not
 * hide or remove it.
 */
const MapSection: React.FC<MapSectionProps> = ({ articles }) => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    // Anything the map library throws must degrade to the fallback panel below
    // rather than escape the effect. An uncaught throw here unmounts the whole
    // app, which is how /explore once became a blank page.
    const [crashed, setCrashed] = useState(false);

    const mapArticles = mappedArticles(articles);

    useEffect(() => {
        if (crashed || mapArticles.length === 0 || !mapRef.current) return;

        let cancelled = false;
        let map: Leaflet.Map | null = null;

        const init = async () => {
            try {
                const [{ default: L }] = await Promise.all([
                    import('leaflet'),
                    import('leaflet/dist/leaflet.css'),
                ]);
                if (cancelled || !mapRef.current) return;

                map = L.map(mapRef.current, {
                    // A full-width 600px map otherwise swallows the wheel and
                    // traps the visitor mid-page; the zoom control still works.
                    scrollWheelZoom: false,
                });

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsgivare',
                }).addTo(map);

                // Leaflet's stock marker PNGs resolve relative to the stylesheet
                // URL, which a bundler rewrites; the well-known result is a
                // broken-image marker. An inline SVG pin has no URL to break.
                const icon = L.divIcon({
                    className: '',
                    html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.716 23.284 0 15 0z" fill="#1d4ed8"/>
                        <circle cx="15" cy="15" r="6" fill="#ffffff"/>
                    </svg>`,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42],
                    popupAnchor: [0, -40],
                });

                const bounds = L.latLngBounds([]);
                for (const article of mapArticles) {
                    const position = placeCoordinates(article)!;
                    bounds.extend(position);

                    const marker = L.marker(position, { icon, title: article.title }).addTo(map);
                    marker.bindPopup(
                        `<div style="max-width: 200px;">
                            <h4 style="font-weight: bold; margin: 0; font-size: 14px;">${article.title}</h4>
                            <p style="font-size: 11px; margin: 2px 0; color: #666;">${article.category}</p>
                            <span style="font-size: 10px; color: blue;">Klicka för att läsa</span>
                        </div>`,
                        { closeButton: false }
                    );
                    marker.on('mouseover', () => marker.openPopup());
                    marker.on('mouseout', () => marker.closePopup());
                    marker.on('click', () => navigate(`/${article.slug}`));
                }

                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
            } catch (err) {
                console.error('The map refused to initialise:', err);
                if (!cancelled) setCrashed(true);
            }
        };
        init();

        return () => {
            // StrictMode mounts twice in dev; without remove() the second mount
            // hits "Map container is already initialized".
            cancelled = true;
            map?.remove();
        };
    }, [articles, crashed]);

    // A visitor is not the audience for a build instruction, so the fallback
    // says only what they need: the content is all in the list below.
    if (crashed) {
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
            <div ref={mapRef} className="w-full h-full" role="region" aria-label="Karta över platserna i listan nedan" />
        </div>
    );
};

export default MapSection;
