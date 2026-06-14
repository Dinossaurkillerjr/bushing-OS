/**
 * Abstração para a camada de persistência local da HUD.
 * Desacoplado para facilitar injeção de SQLite ou Sistema de Arquivos (Node fs) no Electron posteriormente.
 */
export interface PersistenceProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}
