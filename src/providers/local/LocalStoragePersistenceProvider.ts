import type { PersistenceProvider } from '../../core/interfaces/PersistenceProvider';

export class LocalStoragePersistenceProvider implements PersistenceProvider {
  public async getItem<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

// Instância global provisória. Futuramente pode vir de Injeção de Dependância.
export const defaultPersistence = new LocalStoragePersistenceProvider();
