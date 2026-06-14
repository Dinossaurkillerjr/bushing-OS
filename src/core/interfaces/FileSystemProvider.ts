/**
 * Abstração para Seleção e Acesso a Arquivos.
 * No futuro do ambiente Electron puro, a implementação desta interface utilizará o
 * IPC (Inter-Process Communication) para invocar 'dialog.showOpenDialog' no Node.js Principal,
 * desacoplando a escolha e leitura de arquivos do ambiente web/browser atual.
 */
export interface FileSystemProvider {
  /**
   * Abre a janela ou serviço padrão do SO para escolher arquivos/pastas.
   * Por enquanto retorna os Files HTML nativos. Futuramente retornará URIs absolutas.
   */
  requestFolderSelection(): Promise<File[]>;
}
