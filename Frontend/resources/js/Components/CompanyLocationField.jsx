import React, { useEffect, useRef, useState } from 'react';
import {
    MapPin,
    Navigation,
    Camera,
    ImagePlus,
    Trash2,
    Loader2,
    Check,
    Square,
    Crosshair,
} from 'lucide-react';
import { optimizeImage } from '@/utils/imageOptimizer';

const DEFAULT_CENTER = [-24.1858, -65.2995]; // Jujuy, Argentina

const isNum = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));

export default function CompanyLocationField({
    latitude,
    longitude,
    accuracy,
    onLocationChange,
    photoFile = null,
    existingPhotoUrl = null,
    photoRemoved = false,
    onPhotoChange,
    onPhotoRemove,
    errors = {},
}) {
    const mapEl = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const watchRef = useRef(null);
    const placedOnce = useRef(false);

    // Siempre apuntan a la última versión de los callbacks (los handlers de Leaflet se crean una sola vez)
    const changeCb = useRef(onLocationChange);
    changeCb.current = onLocationChange;

    const [tracking, setTracking] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [processingPhoto, setProcessingPhoto] = useState(false);
    const [locationMode, setLocationMode] = useState('pending');
    const [coordinatesInput, setCoordinatesInput] = useState('');

    const hasLocation = isNum(latitude) && isNum(longitude);
    const lat = hasLocation ? Number(latitude) : null;
    const lng = hasLocation ? Number(longitude) : null;
    const acc = isNum(accuracy) ? Number(accuracy) : null;
    const leafletReady = typeof window !== 'undefined' && !!window.L;
    const mapInteractionEnabled = locationMode === 'point';
    const mapInteractionRef = useRef(false);
    mapInteractionRef.current = mapInteractionEnabled;

    useEffect(() => {
        setCoordinatesInput(hasLocation ? `${lat}, ${lng}` : '');
    }, [hasLocation, lat, lng]);

    const stopTracking = () => {
        if (watchRef.current !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchRef.current);
        }
        watchRef.current = null;
        setTracking(false);
    };

    // ---------- Mapa (se crea una sola vez) ----------
    useEffect(() => {
        if (!window.L || !mapEl.current) return;
        const L = window.L;

        const map = L.map(mapEl.current).setView(DEFAULT_CENTER, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Clic manual en el mapa: corta el seguimiento en vivo y fija el punto elegido
        map.on('click', (e) => {
            if (!mapInteractionRef.current) return;
            stopTracking();
            changeCb.current?.({ latitude: e.latlng.lat, longitude: e.latlng.lng, accuracy: null });
        });

        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 200);

        return () => {
            if (watchRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchRef.current);
                watchRef.current = null;
            }
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
            circleRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- Sincroniza marcador y círculo de precisión con los valores del formulario ----------
    useEffect(() => {
        const map = mapRef.current;
        const L = window.L;
        if (!map || !L) return;

        if (!hasLocation) {
            markerRef.current?.remove();
            circleRef.current?.remove();
            markerRef.current = null;
            circleRef.current = null;
            placedOnce.current = false;
            return;
        }

        if (!markerRef.current) {
            const marker = L.marker([lat, lng], { draggable: mapInteractionEnabled }).addTo(map);
            marker.on('dragend', () => {
                stopTracking();
                const p = marker.getLatLng();
                changeCb.current?.({ latitude: p.lat, longitude: p.lng, accuracy: null });
            });
            markerRef.current = marker;
        } else {
            markerRef.current.setLatLng([lat, lng]);
            if (mapInteractionEnabled) markerRef.current.dragging.enable();
            else markerRef.current.dragging.disable();
        }

        if (acc && acc > 0) {
            if (!circleRef.current) {
                circleRef.current = L.circle([lat, lng], {
                    radius: acc,
                    color: '#2563eb',
                    weight: 1,
                    fillOpacity: 0.12,
                }).addTo(map);
            } else {
                circleRef.current.setLatLng([lat, lng]);
                circleRef.current.setRadius(acc);
            }
        } else if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
        }

        if (!placedOnce.current) {
            map.setView([lat, lng], 17);
            placedOnce.current = true;
        } else if (!map.getBounds().contains([lat, lng])) {
            map.panTo([lat, lng]);
        }
    }, [hasLocation, lat, lng, acc, mapInteractionEnabled]);

    // ---------- GPS en tiempo real ----------
    const startTracking = () => {
        if (!navigator.geolocation) {
            setGeoError('Este navegador no soporta geolocalización.');
            return;
        }
        if (!window.isSecureContext) {
            setGeoError(
                'El GPS solo funciona en una conexión segura (HTTPS) o en localhost. Abrí el sistema con https:// o fijá el punto a mano en el mapa.'
            );
            return;
        }

        setGeoError('');
        stopTracking();
        setTracking(true);

        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: la, longitude: lo, accuracy: ac } = pos.coords;
                changeCb.current?.({ latitude: la, longitude: lo, accuracy: Math.round(ac * 10) / 10 });
            },
            (err) => {
                const messages = {
                    1: 'Permiso de ubicación denegado. Habilitalo en la configuración del navegador.',
                    2: 'No se pudo determinar la ubicación (sin señal GPS).',
                    3: 'Se agotó el tiempo esperando la señal GPS. Probá de nuevo al aire libre.',
                };
                setGeoError(messages[err.code] || 'No se pudo obtener la ubicación GPS.');
                stopTracking();
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
    };

    const clearLocation = () => {
        stopTracking();
        setGeoError('');
        changeCb.current?.({ latitude: '', longitude: '', accuracy: '' });
    };

    const choosePoint = () => {
        setLocationMode('point');
        setGeoError('');
        setTimeout(() => mapRef.current?.invalidateSize(), 0);
    };

    const markLocationUnknown = () => {
        clearLocation();
        setLocationMode('unknown');
    };

    const updateCoordinatesInput = (value) => {
        setCoordinatesInput(value);
        const parts = value.split(',').map((part) => part.trim());
        if (parts.length !== 2 || !parts[0] || !parts[1]) return;

        const nextLat = Number(parts[0]);
        const nextLng = Number(parts[1]);
        if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng) || nextLat < -90 || nextLat > 90 || nextLng < -180 || nextLng > 180) return;

        stopTracking();
        changeCb.current?.({ latitude: nextLat, longitude: nextLng, accuracy: null });
    };

    // ---------- Foto ----------
    useEffect(() => {
        if (!photoFile) {
            setPhotoPreview(null);
            return;
        }
        const url = URL.createObjectURL(photoFile);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [photoFile]);

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setProcessingPhoto(true);
        const ready = await optimizeImage(file);
        setProcessingPhoto(false);
        onPhotoChange?.(ready);
    };

    const shownPhoto = photoPreview || (!photoRemoved ? existingPhotoUrl : null);

    return (
        <div className="space-y-5">
            {/* ===== GPS ===== */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {hasLocation ? (
                            <span className="font-mono">
                                {lat.toFixed(6)}, {lng.toFixed(6)}
                                {acc ? <span className="text-slate-400"> · ±{Math.round(acc)} m</span> : null}
                            </span>
                        ) : (
                            <span className="text-slate-400">Ubicación sin definir</span>
                        )}
                        {tracking && (
                            <span className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                En vivo
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {!tracking ? (
                            <button
                                type="button"
                                onClick={startTracking}
                                disabled={!mapInteractionEnabled}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                Usar mi GPS en vivo
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopTracking}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Fijar esta ubicación
                            </button>
                        )}
                        {hasLocation && (
                            <button
                                type="button"
                                onClick={clearLocation}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <Square className="w-3.5 h-3.5" />
                                Quitar
                            </button>
                        )}
                    </div>
                </div>

                {geoError && (
                    <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        {geoError}
                    </p>
                )}

                {leafletReady ? (
                    <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <div ref={mapEl} className="w-full h-full" />
                        {!mapInteractionEnabled && (
                            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4 text-center backdrop-blur-[1px]">
                                <div className="max-w-xs rounded-2xl bg-white/95 p-4 shadow-xl">
                                    {locationMode === 'unknown' ? (
                                        <>
                                            <p className="text-sm font-bold text-slate-900">Ubicación sin registrar</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">Podés continuar sin coordenadas y agregarlas más adelante.</p>
                                            <button type="button" onClick={choosePoint} className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Elegir un punto</button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-bold text-slate-900">¿Querés registrar la ubicación?</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">Elegí un punto para habilitar el mapa o continuá sin ubicación.</p>
                                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                                <button type="button" onClick={choosePoint} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Elegir punto</button>
                                                <button type="button" onClick={markLocationUnknown} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">No conozco la ubicación</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        No se pudo cargar el mapa (Leaflet). Revisá la conexión a internet.
                    </p>
                )}

                {mapInteractionEnabled && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Coordenadas</label><input type="text" inputMode="decimal" value={coordinatesInput} onChange={(event) => updateCoordinatesInput(event.target.value)} placeholder="Ej: -24.268621545130223, -65.23299320318309" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="mt-1.5 text-[11px] text-slate-500">Ingresá latitud y longitud separadas por una coma. El mapa se actualiza automáticamente.</p></div>}

                {mapInteractionEnabled && <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <Crosshair className="w-3 h-3 mt-0.5 shrink-0" />
                    Tocá “Usar mi GPS en vivo” estando en el lugar: el punto se actualiza solo mientras mejora la
                    precisión. Cuando el círculo azul sea chico, tocá “Fijar”. También podés hacer clic en el mapa o
                    arrastrar el marcador para ajustarlo.
                </p>}
                {(errors.latitude || errors.longitude) && (
                    <p className="text-xs text-rose-600">{errors.latitude || errors.longitude}</p>
                )}
            </div>

            {/* ===== Foto ===== */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">Foto del lugar</p>

                {shownPhoto ? (
                    <div className="relative w-full sm:w-72 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img src={shownPhoto} alt="Foto del lugar" className="w-full h-48 object-cover" />
                        <button
                            type="button"
                            onClick={onPhotoRemove}
                            title="Quitar foto"
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white shadow-xs"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400">Todavía no se cargó ninguna foto.</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    {/* capture="environment" abre directamente la cámara trasera en el celular */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        Tomar foto
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhoto}
                            className="hidden"
                        />
                    </label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-700 cursor-pointer transition-colors">
                        <ImagePlus className="w-3.5 h-3.5" />
                        Elegir de la galería
                        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                    {processingPhoto && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Procesando...
                        </span>
                    )}
                </div>
                {errors.location_photo && <p className="text-xs text-rose-600">{errors.location_photo}</p>}
            </div>
        </div>
    );
}
