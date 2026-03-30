import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ImageCompressor } from '../../js/features/image-compressor.js';

function createMockImageFile(name = 'test.jpg', type = 'image/jpeg') {
  return new File(['dummy'], name, { type });
}

function setupCanvasMock(mockBlob) {
  const mockToBlob = jest.fn((callback) => {
    callback(mockBlob);
  });
  const mockDrawImage = jest.fn();
  const mockGetContext = jest.fn(() => ({ drawImage: mockDrawImage }));
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: mockGetContext,
    toBlob: mockToBlob,
  };
  const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
  return { mockCanvas, mockBlob, mockToBlob, mockDrawImage, mockGetContext, createElementSpy };
}

function setupURLMock() {
  const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
  const mockRevokeObjectURL = jest.fn();
  const origCreateObjectURL = URL.createObjectURL;
  const origRevokeObjectURL = URL.revokeObjectURL;
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
  return {
    mockCreateObjectURL,
    mockRevokeObjectURL,
    restore() {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    },
  };
}

function setupImageMock(naturalWidth, naturalHeight, triggerOnload = true) {
  const OrigImage = global.Image;
  const instances = [];
  global.Image = function () {
    this.onload = null;
    this.onerror = null;
    this.src = '';
    this.naturalWidth = naturalWidth;
    this.naturalHeight = naturalHeight;
    instances.push(this);
    if (triggerOnload) {
      setTimeout(() => { if (this.onload) this.onload(); }, 0);
    }
  };
  return {
    instances,
    restore() { global.Image = OrigImage; },
  };
}

function setupImageErrorMock() {
  const OrigImage = global.Image;
  global.Image = function () {
    this.onload = null;
    this.onerror = null;
    this.src = '';
    setTimeout(() => { if (this.onerror) this.onerror(); }, 0);
  };
  return {
    restore() { global.Image = OrigImage; },
  };
}

function setupFileReaderMock(result, shouldError = false) {
  const OrigFileReader = global.FileReader;
  global.FileReader = function () {
    this.onload = null;
    this.onerror = null;
    this.result = result;
    this.readAsDataURL = jest.fn(() => {
      setTimeout(() => {
        if (shouldError) {
          if (this.onerror) this.onerror();
        } else {
          if (this.onload) this.onload({ target: { result } });
        }
      }, 0);
    });
  };
  return {
    restore() { global.FileReader = OrigFileReader; },
  };
}

describe('ImageCompressor', () => {
  let compressor;
  let canvasMocks;
  let urlMocks;

  beforeEach(() => {
    compressor = new ImageCompressor();
    const mockBlob = new Blob(['compressed'], { type: 'image/jpeg' });
    canvasMocks = setupCanvasMock(mockBlob);
    urlMocks = setupURLMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    urlMocks.restore();
  });

  test('应该使用默认选项创建实例', () => {
    expect(compressor.maxWidth).toBe(1200);
    expect(compressor.maxHeight).toBe(1200);
    expect(compressor.quality).toBe(0.8);
    expect(compressor.mimeType).toBe('image/jpeg');
  });

  test('应该使用自定义选项创建实例', () => {
    const custom = new ImageCompressor({
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.5,
      mimeType: 'image/png',
    });
    expect(custom.maxWidth).toBe(800);
    expect(custom.maxHeight).toBe(600);
    expect(custom.quality).toBe(0.5);
    expect(custom.mimeType).toBe('image/png');
  });

  test('compress应该压缩图片文件并返回Blob', async () => {
    const file = createMockImageFile();
    const imgMocks = setupImageMock(2000, 2000);

    const result = await compressor.compress(file);

    imgMocks.restore();

    expect(result).toBeDefined();
    expect(result instanceof Blob).toBe(true);
    expect(urlMocks.mockCreateObjectURL).toHaveBeenCalledWith(file);
    expect(urlMocks.mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(canvasMocks.mockDrawImage).toHaveBeenCalled();
  });

  test('compress应该在图片加载失败时拒绝', async () => {
    const file = createMockImageFile();
    const imgMocks = setupImageErrorMock();

    await expect(compressor.compress(file)).rejects.toThrow('Failed to load image');

    imgMocks.restore();
  });

  test('processImage应该在小图片上保持原尺寸', async () => {
    const img = { naturalWidth: 100, naturalHeight: 80 };

    const result = await compressor.processImage(img);

    expect(canvasMocks.mockCanvas.width).toBe(100);
    expect(canvasMocks.mockCanvas.height).toBe(80);
    expect(canvasMocks.mockDrawImage).toHaveBeenCalledWith(img, 0, 0, 100, 80);
    expect(result instanceof Blob).toBe(true);
  });

  test('processImage应该缩小宽度超大的图片', async () => {
    const compressor2 = new ImageCompressor({ maxWidth: 600, maxHeight: 600 });
    const img = { naturalWidth: 1200, naturalHeight: 600 };

    await compressor2.processImage(img);

    expect(canvasMocks.mockCanvas.width).toBe(600);
    expect(canvasMocks.mockCanvas.height).toBe(300);
  });

  test('processImage应该缩小高度超大的图片', async () => {
    const compressor2 = new ImageCompressor({ maxWidth: 600, maxHeight: 600 });
    const img = { naturalWidth: 600, naturalHeight: 1200 };

    await compressor2.processImage(img);

    expect(canvasMocks.mockCanvas.width).toBe(300);
    expect(canvasMocks.mockCanvas.height).toBe(600);
  });

  test('processImage应该处理正方形大图片', async () => {
    const compressor2 = new ImageCompressor({ maxWidth: 500, maxHeight: 500 });
    const img = { naturalWidth: 2000, naturalHeight: 2000 };

    await compressor2.processImage(img);

    expect(canvasMocks.mockCanvas.width).toBe(500);
    expect(canvasMocks.mockCanvas.height).toBe(500);
  });

  test('processImage应该使用正确的mimeType和quality', async () => {
    const compressor2 = new ImageCompressor({
      maxWidth: 100,
      maxHeight: 100,
      quality: 0.5,
      mimeType: 'image/webp',
    });
    const img = { naturalWidth: 50, naturalHeight: 50 };

    await compressor2.processImage(img);

    expect(canvasMocks.mockToBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/webp',
      0.5
    );
  });

  test('compressToBase64应该返回base64字符串', async () => {
    const file = createMockImageFile();
    const imgMocks = setupImageMock(100, 100);
    const frMocks = setupFileReaderMock('data:image/jpeg;base64,dGVzdA==');

    const result = await compressor.compressToBase64(file);

    imgMocks.restore();
    frMocks.restore();

    expect(result).toBe('data:image/jpeg;base64,dGVzdA==');
  });

  test('compressToBase64应该在FileReader出错时拒绝', async () => {
    const file = createMockImageFile();
    const imgMocks = setupImageMock(100, 100);
    const frMocks = setupFileReaderMock(null, true);

    await expect(compressor.compressToBase64(file)).rejects.toThrow('Failed to read blob as base64');

    imgMocks.restore();
    frMocks.restore();
  });
});
