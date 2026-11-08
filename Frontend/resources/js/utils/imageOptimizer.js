/** Reduce fotos grandes antes de subirlas, conservando suficiente detalle para evidencia y pantalla. */
export function optimizeImage(file, { maxSide = 1600, quality = 0.82 } = {}) {
    return new Promise((resolve) => {
        if (!file?.type?.startsWith('image/')) return resolve(file);

        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxSide / Math.max(image.width, image.height));

            // Evita recomprimir archivos que ya son livianos y tienen un tamaño adecuado.
            if (scale === 1 && file.size < 1.5 * 1024 * 1024) return resolve(file);

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) return resolve(file);
                const name = (file.name.replace(/\.\w+$/, '') || 'imagen') + '.jpg';
                resolve(new File([blob], name, { type: 'image/jpeg' }));
            }, 'image/jpeg', quality);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };
        image.src = url;
    });
}
