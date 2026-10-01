import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function LeafletMap({ lat = null, lng = null, onLocationChange = null, readOnly = false, height = 'h-64' }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [currentCoords, setCurrentCoords] = useState({
        lat: lat || -24.1858, // Jujuy / Argentina default
        lng: lng || -65.2995,
    });
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        if (!mapContainerRef.current || !window.L) return;

        // Clean up previous instance
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
        }

        const initialLat = lat || currentCoords.lat;
        const initialLng = lng || currentCoords.lng;

        const map = window.L.map(mapContainerRef.current).setView([initialLat, initialLng], lat && lng ? 16 : 13);
        mapInstanceRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        const marker = window.L.marker([initialLat, initialLng], {
            draggable: !readOnly,
        }).addTo(map);
        markerRef.current = marker;

        if (!readOnly && onLocationChange) {
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                setCurrentCoords({ lat: pos.lat, lng: pos.lng });
                onLocationChange(pos.lat, pos.lng);
            });

            map.on('click', (e) => {
                marker.setLatLng(e.latlng);
                setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
                onLocationChange(e.latlng.lat, e.latlng.lng);
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [lat, lng]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no es soportada por su navegador.');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCurrentCoords({ lat: latitude, lng: longitude });

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 17);
                    markerRef.current.setLatLng([latitude, longitude]);
                }

                if (onLocationChange) {
                    onLocationChange(latitude, longitude);
                }
                setLocating(false);
            },
            (err) => {
                alert('No se pudo obtener la ubicación GPS: ' + err.message);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-2">
            {!readOnly && (
                <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Coords: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                        {locating ? 'Obteniendo GPS...' : 'Usar mi GPS actual'}
                    </button>
                </div>
            )}
            <div className={`relative ${height} rounded-xl overflow-hidden border border-slate-200 shadow-xs`}>
                <div ref={mapContainerRef} className="w-full h-full" />
            </div>
            {!readOnly && (
                <p className="text-[11px] text-slate-400">
                    Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta del establecimiento o hallazgo.
                </p>
            )}
        </div>
    );
}
