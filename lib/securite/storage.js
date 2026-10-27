import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_VERSION = '2.0';
const STORAGE_PREFIX = 'itexal_';

class TypedStorage {
  constructor() {
    this.prefix = STORAGE_PREFIX;
    this.version = STORAGE_VERSION;
  }

  getKey(key) {
    return `${this.prefix}${key}`;
  }

  get storage() {
    if (typeof window === 'undefined') return null;
    try { return window.localStorage; } catch { return null; }
  }

  set(key, value, options = {}) {
    try {
      const fullKey = this.getKey(key);
      const expiresAt = options.expiresIn
        ? Date.now() + options.expiresIn * 1000
        : null;

      const data = {
        value,
        version: this.version,
        createdAt: Date.now(),
        expiresAt,
        metadata: options.metadata || {},
      };

      const local = this.storage;
      if (local) {
        local.setItem(fullKey, JSON.stringify(data));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  get(key, defaultValue = null) {
    const local = this.storage;
    if (!local) return defaultValue;
    const fullKey = this.getKey(key);
    try {
      let item = local.getItem(fullKey);
      if (!item) {
        // Migrate values saved by the previous app version under unprefixed keys.
        item = local.getItem(key);
        if (!item) return defaultValue;
        const legacyValue = JSON.parse(item);
        this.set(key, legacyValue);
        return legacyValue;
      }

      const data = JSON.parse(item);
      // Migrate v1 envelopes and tolerate raw values written by older builds.
      if (!data || typeof data !== 'object' || !Object.prototype.hasOwnProperty.call(data, 'value')) {
        this.set(key, data);
        return data;
      }

      // Vérifier l'expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        local.removeItem(fullKey);
        local.removeItem(key);
        return defaultValue;
      }

      // Vérifier la version
      if (data.version !== this.version) {
        const remainingSeconds = data.expiresAt ? Math.max(1, Math.ceil((data.expiresAt - Date.now()) / 1000)) : null;
        this.set(key, data.value, {
          ...(remainingSeconds ? { expiresIn: remainingSeconds } : {}),
          metadata: data.metadata || {},
        });
        return data.value;
      }

      return data.value;
    } catch {
      try { local.removeItem(fullKey); } catch {}
      try { local.removeItem(key); } catch {}
      return defaultValue;
    }
  }

  remove(key) {
    try {
      const local = this.storage;
      if (local) {
        local.removeItem(this.getKey(key));
        local.removeItem(key);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  clear() {
    try {
      const local = this.storage;
      if (!local) return false;

      const keysToRemove = [];
      for (let i = 0; i < local.length; i++) {
        const key = local.key(i);
        if (key && (key.startsWith(this.prefix) || key.startsWith('agrimarket.') || key.startsWith('itexal.'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => local.removeItem(key));
      return true;
    } catch {
      return false;
    }
  }

  getMetadata(key) {
    try {
      const local = this.storage;
      if (!local) return null;

      const item = local.getItem(this.getKey(key));
      if (!item) return null;

      const data = JSON.parse(item);
      return {
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        isExpired: data.expiresAt ? Date.now() > data.expiresAt : false,
        version: data.version,
        metadata: data.metadata,
      };
    } catch {
      return null;
    }
  }

  cleanExpired() {
    try {
      const local = this.storage;
      if (!local) return 0;

      let cleaned = 0;
      const keysToRemove = [];

      for (let i = 0; i < local.length; i++) {
        const key = local.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(local.getItem(key));
            if (item.expiresAt && Date.now() > item.expiresAt) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        local.removeItem(key);
        cleaned++;
      });

      return cleaned;
    } catch {
      return 0;
    }
  }
}

export const storage = new TypedStorage();

// Hook pour utiliser dans les composants
export const useStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue);
  const fallbackRef = useRef(defaultValue);
  fallbackRef.current = defaultValue;

  useEffect(() => {
    setValue(storage.get(key, fallbackRef.current));
  }, [key]);

  const updateValue = useCallback((newValue) => {
    const result = storage.set(key, newValue);
    if (result) {
      setValue(newValue);
    }
    return result;
  }, [key]);

  const removeValue = useCallback(() => {
    storage.remove(key);
    setValue(fallbackRef.current);
  }, [key]);

  return [value, updateValue, removeValue];
};
