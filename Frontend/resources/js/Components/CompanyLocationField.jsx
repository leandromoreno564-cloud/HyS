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

const DEFAULT_CENTER = [-24.1858, -65.2995]; // Jujuy, Argentina

const isNum = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));

// Reduce fotos de celular (5-10 MB) a un tamaño razonable antes de subirlas
const compressImage = (file, maxSide = 1600, quality = 0.82) =>
    new Promise((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(file);

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            if (scale === 1 && file.size < 1.5 * 1024 * 1024) return resolve(file);

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return resolve(file);
                    const name = (file.name.replace(/\.\w+$/, '') || 'foto') + '.jpg';
                    resolve(new File([blob], name, { type: 'image/jpeg' }));
                },
                'image/jpeg',
                quality
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };
        img.src = url;
    });

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

    const hasLocation = isNum(latitude) && isNum(longitude);
    const lat = hasLocation ? Number(latitude) : null;
    const lng = hasLocation ? Number(longitude) : null;
    const acc = isNum(accuracy) ? Number(accuracy) : null;
    const leafletReady = typeof window !== 'undefined' && !!window.L;

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
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on('dragend', () => {
                stopTracking();
                const p = marker.getLatLng();
                changeCb.current?.({ latitude: p.lat, longitude: p.lng, accuracy: null });
            });
            markerRef.current = marker;
        } else {
            markerRef.current.setLatLng([lat, lng]);
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
    }, [hasLocation, lat, lng, acc]);

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
        const ready = await compressImage(file);
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
                    </div>
                ) : (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        No se pudo cargar el mapa (Leaflet). Revisá la conexión a internet.
                    </p>
                )}

                <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <Crosshair className="w-3 h-3 mt-0.5 shrink-0" />
                    Tocá “Usar mi GPS en vivo” estando en el lugar: el punto se actualiza solo mientras mejora la
                    precisión. Cuando el círculo azul sea chico, tocá “Fijar”. También podés hacer clic en el mapa o
                    arrastrar el marcador para ajustarlo.
                </p>
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
