/**
 * Storage Utilities - LocalStorage wrapper with type safety
 */

// Storage interface
export interface StorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Default drivers
const localStorageDriver: StorageDriver = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

const sessionStorageDriver: StorageDriver = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key),
  clear: () => sessionStorage.clear(),
};

// Memory storage fallback
const memoryStorage = new Map<string, string>();
const memoryStorageDriver: StorageDriver = {
  getItem: (key) => memoryStorage.get(key) ?? null,
  setItem: (key, value) => memoryStorage.set(key, value),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
};

// Storage class
export class Storage {
  private driver: StorageDriver;
  private prefix: string;

  constructor(driver: StorageDriver, prefix: string = '') {
    this.driver = driver;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.driver.getItem(this.getKey(key));
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.driver.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Storage set failed:', error);
    }
  }

  remove(key: string): void {
    this.driver.removeItem(this.getKey(key));
  }

  clear(): void {
    this.driver.clear();
  }

  has(key: string): boolean {
    return this.driver.getItem(this.getKey(key)) !== null;
  }
}

// Check if storage is available
function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch {
    return false;
  }
}

// Export storage instances
export const storage = new Storage(
  isStorageAvailable('localStorage') ? localStorageDriver : memoryStorageDriver,
  'app'
);

export const sessionStore = new Storage(
  isStorageAvailable('sessionStorage') ? sessionStorageDriver : memoryStorageDriver,
  'app'
);

// Convenience functions
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  return storage.get(key, defaultValue);
}

export function setStorageItem<T>(key: string, value: T): void {
  storage.set(key, value);
}

export function removeStorageItem(key: string): void {
  storage.remove(key);
}
