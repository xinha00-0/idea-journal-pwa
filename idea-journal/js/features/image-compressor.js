export class ImageCompressor {
  constructor(options = {}) {
    this.maxWidth = options.maxWidth ?? 1200;
    this.maxHeight = options.maxHeight ?? 1200;
    this.quality = options.quality ?? 0.8;
    this.mimeType = options.mimeType ?? 'image/jpeg';
  }

  compress(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        this.processImage(img).then(resolve).catch(reject);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  processImage(img) {
    let { naturalWidth: width, naturalHeight: height } = img;

    if (width > this.maxWidth) {
      height = (height * this.maxWidth) / width;
      width = this.maxWidth;
    }
    if (height > this.maxHeight) {
      width = (width * this.maxHeight) / height;
      height = this.maxHeight;
    }

    width = Math.round(width);
    height = Math.round(height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        this.mimeType,
        this.quality
      );
    });
  }

  compressToBase64(file) {
    return this.compress(file).then((blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read blob as base64'));
        reader.readAsDataURL(blob);
      });
    });
  }
}
