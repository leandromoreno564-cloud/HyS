import React, { useRef, useState, useEffect } from 'react';

export default function SignatureCanvas({ label, initialData, onSave }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(!!initialData);

    useEffect(() => {
        if (initialData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = initialData;
        }
    }, [initialData]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(
            (e.clientX || e.touches?.[0]?.clientX) - rect.left,
            (e.clientY || e.touches?.[0]?.clientY) - rect.top
        );
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineTo(
            (e.clientX || e.touches?.[0]?.clientX) - rect.left,
            (e.clientY || e.touches?.[0]?.clientY) - rect.top
        );
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (onSave && canvasRef.current) {
            onSave(canvasRef.current.toDataURL());
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        if (onSave) onSave(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {label}
            </label>
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden relative">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 touch-none cursor-crosshair"
                />
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">
                        Firme aquí con el mouse o pantalla táctil
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
                Limpiar firma
            </button>
        </div>
    );
}