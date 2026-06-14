/**
 * Abstração para Seleção e Acesso a Arquivos.
 * No futuro do ambiente Electron puro, a implementação desta interface utilizará o
 * IPC (Inter-Process Communication) para invocar 'dialog.showOpenDialog' no Node.js Principal,
 * desacoplando a escolha e leitura de arquivos do ambiente web/browser atual.
 */
export interface FileSystemProvider {
  /**
   * Abre a janela ou serviço padrão do SO para escolher arquivos/pastas.
   * Retorna um construto flexível. Browsers retornam 'File[]', Electron retorna strings de caminhos absolutos nativos.
   */
  requestFolderSelection(): Promise<any[]>;
}
