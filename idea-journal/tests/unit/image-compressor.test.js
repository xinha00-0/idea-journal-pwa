import { ImageCompressor } from '../../js/features/image-compressor.js';

describe('ImageCompressor', () => {
  let compressor;
  
  beforeEach(() => {
    compressor = new ImageCompressor({
      maxWidth: 1200,
      quality: 0.8
    });
  });
  
  test('应该初始化压缩器', () => {
    expect(compressor).toBeDefined();
    expect(compressor.options.maxWidth).toBe(1200);
    expect(compressor.options.maxHeight).toBe(1200);
    expect(compressor.options.quality).toBe(0.8);
    expect(compressor.options.mimeType).toBe('image/jpeg');
  });
  
  test('应该设置自定义选项', () => {
    const customCompressor = new ImageCompressor({
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.6,
      mimeType: 'image/png'
    });
    
    expect(customCompressor.options.maxWidth).toBe(800);
    expect(customCompressor.options.maxHeight).toBe(800);
    expect(customCompressor.options.quality).toBe(0.6);
    expect(customCompressor.options.mimeType).toBe('image/png');
  });
  
  test('应该处理压缩错误', async () => {
    await expect(compressor.compress(null)).rejects.toThrow();
  });
  
  test('应该有compress方法', () => {
    expect(typeof compressor.compress).toBe('function');
  });
  
  test('应该有compressToBase64方法', () => {
    expect(typeof compressor.compressToBase64).toBe('function');
  });
});
