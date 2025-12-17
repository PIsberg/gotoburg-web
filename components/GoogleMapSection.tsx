import React, { useEffect, useRef, useState } from 'react';
import { Article } from '../types';

interface GoogleMapSectionProps {
    articles: Article[];
}

// Custom hook to load Google Maps script
const useGoogleMapsScript = (apiKey: string) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if ((window as any).google?.maps) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, [apiKey]);

    return loaded;
};

const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({ articles }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const isLoaded = useGoogleMapsScript(apiKey || '');
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Filter articles with map links and parse coordinates
    const mapArticles = articles.filter(a => a.googleMapsUrl && a.googleMapsUrl.includes('@'));

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
                styles: [
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [{ "visibility": "off" }]
                    }
                ]
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
                // Extract lat/lng from URL: .../@57.712,11.958,...
                const match = article.googleMapsUrl!.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                    const lat = parseFloat(match[1]);
                    const lng = parseFloat(match[2]);

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
                        window.location.hash = `/${article.slug}`;
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

    if (!apiKey) {
        return (
            <div className="w-full h-64 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-12 flex flex-col items-center justify-center text-center p-6 shadow-sm">
                <div className="text-4xl mb-2">🗺️</div>
                <h3 className="font-bold text-lg text-yellow-800">Google Maps är inte konfigurerad</h3>
                <p className="text-sm text-yellow-700 max-w-md">
                    Du behöver lägga till en API-nyckel i <code>.env.local</code> för att se kartan.
                    <br />
                    Se <code>README.md</code> för instruktioner.
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
