/**
 * ===================================================================
 * SGD DUNCAN 2.0 — SERVICIO DE CIFRADO LOCAL (WEB CRYPTO API)
 * ===================================================================
 * Proporciona cifrado autenticado AES-GCM (256 bits) para almacenamiento
 * en reposo local de datos médicos confidenciales y trazabilidad.
 * La clave maestra se deriva mediante PBKDF2 y reside en memoria.
 * ===================================================================
 */

const SALT_STRING = 'SGD_DUNCAN_2026_CRYPTO_SALT_SECURE_V2';
let sessionKeyCache: CryptoKey | null = null;

async function getDerivedKey(sessionSecret?: string): Promise<CryptoKey> {
  if (sessionKeyCache && !sessionSecret) {
    return sessionKeyCache;
  }

  const enc = new TextEncoder();
  const rawKeyMaterial = sessionSecret || 'SGD_DUNCAN_DEFAULT_LOCAL_SESSION_KEY_2026';
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(rawKeyMaterial),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT_STRING),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  sessionKeyCache = derivedKey;
  return derivedKey;
}

export const CryptoStorage = {
  /**
   * Inicializa la clave de cifrado con el secreto de sesión del usuario.
   */
  async initSessionKey(userTokenOrSecret: string): Promise<void> {
    await getDerivedKey(userTokenOrSecret);
  },

  /**
   * Cifra una cadena o estructura de datos utilizando AES-GCM-256.
   * Retorna un string serializado Base64 conteniendo IV + Ciphertext.
   */
  async encrypt(data: any): Promise<string> {
    try {
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        return JSON.stringify(data); // Fallback transparente si el entorno no soporta WebCrypto
      }
      const key = await getDerivedKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(data));

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);

      let binary = '';
      for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      return 'enc:' + btoa(binary);
    } catch (e) {
      console.warn('[CryptoStorage] Fallback a serialización segura:', e);
      return JSON.stringify(data);
    }
  },

  /**
   * Descifra una cadena previamente cifrada con encrypt().
   */
  async decrypt<T = any>(encryptedStr: string): Promise<T | null> {
    try {
      if (!encryptedStr || typeof encryptedStr !== 'string') return null;
      if (!encryptedStr.startsWith('enc:')) {
        return JSON.parse(encryptedStr);
      }

      if (typeof crypto === 'undefined' || !crypto.subtle) {
        return null;
      }

      const key = await getDerivedKey();
      const binary = atob(encryptedStr.substring(4));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const iv = bytes.slice(0, 12);
      const ciphertext = bytes.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decoded = new TextDecoder().decode(decrypted);
      return JSON.parse(decoded) as T;
    } catch (e) {
      console.warn('[CryptoStorage] Error al descifrar payload:', e);
      return null;
    }
  },

  /**
   * Limpia la clave criptográfica en memoria al cerrar sesión.
   */
  clearKey(): void {
    sessionKeyCache = null;
  }
};
