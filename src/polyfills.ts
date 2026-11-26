/**
 * Polyfills ligeros para compatibilidad con navegadores móviles antiguos
 * (Android WebView, Chrome < 119, Safari < 17.4, Mi Browser, Samsung Internet)
 * y manejo automático de errores de carga de chunks tras despliegues en Vercel.
 */

// 1. Promise.withResolvers (ES2024 - requerido por pdfjs-dist y librerías modernas)
if (typeof Promise !== 'undefined' && typeof (Promise as any).withResolvers !== 'function') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 2. Object.hasOwn (ES2022)
if (typeof Object !== 'undefined' && typeof (Object as any).hasOwn !== 'function') {
  (Object as any).hasOwn = function (obj: object, prop: PropertyKey) {
    if (obj === null || obj === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object.prototype.hasOwnProperty.call(Object(obj), prop);
  };
}

// 3. Array.prototype.at & String.prototype.at (ES2022)
if (typeof Array !== 'undefined' && !('at' in Array.prototype)) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function (n: number) {
      const len = this.length >>> 0;
      let k = Math.trunc(n) || 0;
      if (k < 0) k += len;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

if (typeof String !== 'undefined' && !('at' in String.prototype)) {
  Object.defineProperty(String.prototype, 'at', {
    value: function (n: number) {
      const len = this.length;
      let k = Math.trunc(n) || 0;
      if (k < 0) k += len;
      if (k < 0 || k >= len) return undefined;
      return this.charAt(k);
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

// 4. Array.prototype.findLast & Array.prototype.findLastIndex (ES2023)
if (typeof Array !== 'undefined' && !('findLast' in Array.prototype)) {
  Object.defineProperty(Array.prototype, 'findLast', {
    value: function <T>(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (predicate.call(thisArg, this[i], i, this)) {
          return this[i];
        }
      }
      return undefined;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

if (typeof Array !== 'undefined' && !('findLastIndex' in Array.prototype)) {
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    value: function <T>(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (predicate.call(thisArg, this[i], i, this)) {
          return i;
        }
      }
      return -1;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

// 5. String.prototype.replaceAll (ES2021)
if (typeof String !== 'undefined' && !('replaceAll' in String.prototype)) {
  Object.defineProperty(String.prototype, 'replaceAll', {
    value: function (search: string | RegExp, replacement: any) {
      if (search instanceof RegExp) {
        if (!search.global) {
          throw new TypeError('replaceAll must be called with a global RegExp');
        }
        return this.replace(search, replacement);
      }
      return this.split(String(search)).join(String(replacement));
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

// 6. structuredClone fallback seguro
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).structuredClone !== 'function') {
  (globalThis as any).structuredClone = function <T>(val: T): T {
    if (val === undefined || val === null || typeof val !== 'object') return val;
    return JSON.parse(JSON.stringify(val));
  };
}

// 7. crypto.randomUUID fallback (entornos HTTP LAN o navegadores antiguos)
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
  try {
    Object.defineProperty(crypto, 'randomUUID', {
      value: () => {
        const bytes = new Uint8Array(16);
        if (typeof crypto.getRandomValues === 'function') {
          crypto.getRandomValues(bytes);
        } else {
          for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      },
      configurable: true,
    });
  } catch {
    // Ignorar si crypto no es extensible
  }
}

// 8. Auto-recuperación si un chunk lazy-loaded quedó obsoleto tras un nuevo deploy en Vercel
if (typeof window !== 'undefined') {
  const doReload = () => {
    try {
      (window as Window).location.reload();
    } catch {
      // noop
    }
  };

  window.addEventListener('vite:preloadError', () => {
    try {
      const key = 'sgd_chunk_reload_once';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        if (typeof caches !== 'undefined') {
          caches.keys().then(names => Promise.all(names.map(n => caches.delete(n)))).finally(doReload);
          return;
        }
        doReload();
      }
    } catch {
      doReload();
    }
  });
}
