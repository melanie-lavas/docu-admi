// Utility to convert an imported image URL to a base64 data URL for use in jsPDF
export async function imageToBase64(src: string): Promise<string> {
  // If already a data URL, return as-is
  if (src.startsWith("data:")) return src;

  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external URLs, not local assets
    if (src.startsWith("http") && !src.includes(window.location.hostname)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject("No canvas context"); return; }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        if (!dataUrl || dataUrl === "data:,") {
          reject("Canvas produced empty data URL");
          return;
        }
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(`Failed to load image: ${src}`);
    img.src = src;
  });
}
