import * as vscode from 'vscode';


export function activate() {
    
  vscode.workspace.onDidRenameFiles(event => {
    event.files.forEach((fileChange) => {

        //Benennt man einen Ordner um, wird das Event nur einmal gefeuert und nicht für alle unter ordner.
        //- Leider ist das Schema genau das gleiche wie für dateien. Müssen schauen, ob es sich um einen Ordner handelt oder nicht.

        //+ Funktioniert auch für das Verschieben von Dateien

        
        console.log(fileChange.newUri);
        console.log(fileChange.oldUri);
    });
  });

}
