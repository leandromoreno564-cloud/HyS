import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

export default function SignatureCanvas({ onSave, initialData = null, label = 'Firma Digital' }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Handle high DPI displays
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
                setHasDrawn(true);
            };
            img.src = initialData;
        }
    }, [initialData]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        saveSignature();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        if (onSave) onSave(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        if (onSave) onSave(dataUrl);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    {label}
                </label>
                {hasDrawn && (
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
                    >
                        <Eraser className="w-3.5 h-3.5" />
                        Limpiar firma
                    </button>
                )}
            </div>
            
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white hover:border-slate-400 transition-colors">
                <canvas
                    ref={canvasRef}
                    className="w-full h-36 touch-none cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                        Dibuja la firma aquí con el dedo o mouse
                    </div>
                )}
            </div>
            <p className="text-[11px] text-slate-400">
                La firma electrónica manuscrita se almacena de forma segura y se estampará en el informe PDF final.
            </p>
        </div>
    );
}
