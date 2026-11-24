/**
 * SGD DUNCAN 2.0 — Utilidad de Compresión y Optimización de Fotos Client-Side
 * Permite capturar fotos de alta resolución con la cámara del teléfono y comprimirlas
 * en el navegador (PWA) mediante Canvas antes de persistirlas en Base64 o enviarlas.
 * Optimiza drásticamente el espacio (de ~5-10MB a ~80-150KB por foto) asegurando alta
 * legibilidad técnica para reportes de inspección sin saturar el almacenamiento offline.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 a 1.0 (default: 0.75)
  format?: 'image/jpeg' | 'image/webp';
}

/**
 * Comprime un archivo File o Blob de imagen y devuelve una Promise con la cadena Base64 DataURL.
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al cargar la imagen en memoria'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular factor de escala manteniendo relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto 2D de Canvas'));
          return;
        }

        // Renderizado nítido
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG / WebP comprimido
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Procesa múltiples archivos de imagen en paralelo
 */
export async function compressMultipleFiles(
  files: FileList | File[],
  options: CompressOptions = {}
): Promise<string[]> {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => compressImageFile(file, options));
  return Promise.all(promises);
}
