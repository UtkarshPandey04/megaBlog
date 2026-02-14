const DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 1200;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image."));
    };
    img.src = objectUrl;
  });
}

function drawToCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function compressImageIfNeeded(file, options = {}) {
  const maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE_BYTES;
  const maxDimension = options.maxDimension || DEFAULT_MAX_DIMENSION;

  if (!file || file.size <= maxSizeBytes) return file;

  const img = await loadImageFromFile(file);
  let scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  let width = Math.max(1, Math.round(img.width * scale));
  let height = Math.max(1, Math.round(img.height * scale));
  let quality = 0.88;
  const outputType = file.type === "image/webp" ? "image/webp" : "image/jpeg";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = drawToCanvas(img, width, height);
    const blob = await canvasToBlob(canvas, outputType, quality);
    if (blob.size <= maxSizeBytes) {
      const nextName = outputType === "image/webp" ? "avatar.webp" : "avatar.jpg";
      return new File([blob], nextName, { type: outputType });
    }

    if (quality > 0.58) {
      quality -= 0.08;
    } else {
      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(320, Math.round(height * 0.82));
    }
  }

  return file;
}
