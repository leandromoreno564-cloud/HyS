import React from 'react';

export default function LeafletMap({ height = 'h-80', lat = -24.1858, lng = -65.2995 }) {
    const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

    return (
        <div className={`w-full ${height} rounded-2xl overflow-hidden border border-slate-200 relative`}>
            <iframe
                title="Geolocalización del Establecimiento"
                src={mapUrl}
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
            />
        </div>
    );
}