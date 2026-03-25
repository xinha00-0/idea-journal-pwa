import 'fake-indexeddb/auto';
import { TextEncoder, TextDecoder } from 'node:util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const originalFile = global.File;

class TestFile extends originalFile {
  constructor(fileBits, fileName, options = {}) {
    super(fileBits, fileName, options);
    this._parts = fileBits;
  }

  async text() {
    return this._parts.join('');
  }
}

global.File = TestFile;

if (typeof URL.createObjectURL === 'undefined') {
  const blobUrls = new Map();
  let blobUrlId = 0;

  global.URL.createObjectURL = (blob) => {
    const url = `blob:${blobUrlId++}`;
    blobUrls.set(url, blob);
    return url;
  };

  global.URL.revokeObjectURL = (url) => {
    blobUrls.delete(url);
  };
}
