import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver; stub it for WebGLManager tests
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}

// jsdom does not implement DOMMatrix; stub it for BlockSuite's CanvasRenderer
if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrixStub {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    inverse() { return new DOMMatrixStub(); }
    multiply() { return new DOMMatrixStub(); }
    multiplySelf() { return this; }
    translate() { return new DOMMatrixStub(); }
    translateSelf() { return this; }
    scale() { return new DOMMatrixStub(); }
    scaleSelf() { return this; }
    rotate() { return new DOMMatrixStub(); }
    rotateSelf() { return this; }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat64Array() { return new Float64Array(16); }
    toFloat32Array() { return new Float32Array(16); }
  }
  globalThis.DOMMatrix = DOMMatrixStub as unknown as typeof globalThis.DOMMatrix
}

// jsdom does not implement FontFace; stub it for BlockSuite's font-loader
if (typeof globalThis.FontFace === 'undefined') {
  globalThis.FontFace = class FontFace {
    family: string
    status = 'loaded'
    constructor(family: string, _source: string | ArrayBuffer) {
      this.family = family
    }
    load() { return Promise.resolve(this); }
  } as unknown as typeof globalThis.FontFace
}

// jsdom does not implement document.fonts (FontFaceSet); stub it for font-loader
if (typeof document !== 'undefined' && !document.fonts) {
  const fontSet = new Set()
  Object.defineProperty(document, 'fonts', {
    value: {
      add: (face: unknown) => fontSet.add(face),
      delete: (face: unknown) => fontSet.delete(face),
      has: (face: unknown) => fontSet.has(face),
      forEach: (cb: (face: unknown) => void) => fontSet.forEach(cb),
      get size() { return fontSet.size },
      ready: Promise.resolve(),
    },
    configurable: true,
  })
}

// jsdom does not implement matchMedia; stub it for theme detection
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList
}
