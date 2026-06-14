import type { FileSystemProvider } from '../../core/interfaces/FileSystemProvider';

export class BrowserFileSystemProvider implements FileSystemProvider {
  public requestFolderSelection(): Promise<File[]> {
    return new Promise((resolve) => {
      // Isolando o elemento HTML invisível fora da lógica do React
      const input = document.createElement('input');
      input.type = 'file';
      
      // Setando diretivas de webkit para suportar seleção de diretórios nativos
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.multiple = true;
      
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          resolve(Array.from(files));
        } else {
          resolve([]);
        }
      };

      // Listener para caso o usuário cancele a deleção e o window foque (hack browser para cancelar promise)
      // Omitido para simplicidade - em browser moderno retornar vazio requer mais listening
      // Mas clicar normalmente invocará
      input.click();
    });
  }
}
