export class ImageCompressor {
  constructor(options = {}) {
    this.options = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      mimeType: 'image/jpeg',
      ...options
    };
  }
  
  async compress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const compressed = this.processImage(img);
            resolve(compressed);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = reject;
        img.src = event.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  processImage(img) {
    const { width, height } = img;
    const { maxWidth, maxHeight, quality, mimeType } = this.options;
    
    let newWidth = width;
    let newHeight = height;
    
    if (width > height) {
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = height * (maxWidth / width);
      }
    } else {
      if (height > maxHeight) {
        newHeight = maxHeight;
        newWidth = width * (maxHeight / height);
      }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        mimeType,
        quality
      );
    });
  }
  
  async compressToBase64(file) {
    const blob = await this.compress(file);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
