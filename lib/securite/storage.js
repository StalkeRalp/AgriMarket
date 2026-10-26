const STORAGE_VERSION = '1.0';
const STORAGE_PREFIX = 'itexal_';

class TypedStorage {
  constructor() {
    this.prefix = STORAGE_PREFIX;
    this.version = STORAGE_VERSION;
  }

  getKey(key) {
    return `${this.prefix}${key}`;
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

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(fullKey, JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[Storage] Erreur lors de la sauvegarde de ${key}:`, error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const fullKey = this.getKey(key);
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }

      const item = window.localStorage.getItem(fullKey);
      if (!item) return defaultValue;

      const data = JSON.parse(item);

      // Vérifier l'expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        window.localStorage.removeItem(fullKey);
        return defaultValue;
      }

      // Vérifier la version
      if (data.version !== this.version) {
        console.warn(`[Storage] Version incompatible pour ${key}`);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      console.error(`[Storage] Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      const fullKey = this.getKey(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(fullKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[Storage] Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  }

  clear() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => window.localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('[Storage] Erreur lors du vidage:', error);
      return false;
    }
  }

  getMetadata(key) {
    try {
      const fullKey = this.getKey(key);
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      const item = window.localStorage.getItem(fullKey);
      if (!item) return null;

      const data = JSON.parse(item);
      return {
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        isExpired: data.expiresAt ? Date.now() > data.expiresAt : false,
        version: data.version,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error(`[Storage] Erreur lors de la lecture des métadonnées de ${key}:`, error);
      return null;
    }
  }

  cleanExpired() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return 0;
      }

      let cleaned = 0;
      const keysToRemove = [];

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(window.localStorage.getItem(key));
            if (item.expiresAt && Date.now() > item.expiresAt) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }

      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
        cleaned++;
      });

      return cleaned;
    } catch (error) {
      console.error('[Storage] Erreur lors du nettoyage des éléments expirés:', error);
      return 0;
    }
  }
}

export const storage = new TypedStorage();

// Hook pour utiliser dans les composants
export const useStorage = (key, defaultValue = null) => {
  const [value, setValue] = React.useState(() => storage.get(key, defaultValue));

  const updateValue = React.useCallback((newValue) => {
    const result = storage.set(key, newValue);
    if (result) {
      setValue(newValue);
    }
    return result;
  }, [key]);

  const removeValue = React.useCallback(() => {
    storage.remove(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, updateValue, removeValue];
};
