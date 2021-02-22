import * as vscode from 'vscode';
import * as fileOperations from './file_operations';
import * as fs from 'fs';
import * as path from 'path';


export function activate() {
    
  //IMPORTANT: For folders this event is only fired once for the folder and not for every file and folder that is inside of this folder
  vscode.workspace.onDidRenameFiles(async event => {
    event.files.forEach(async (fileChange)  => {

        //XXX: Multiple files in folder handeln mit nested foldern
        //XXX: Change Path to sourcefile in test file (path to package)


        if(fileOperations.isPathInLibFolder(fileChange.oldUri.path)) {

          var oldtestFilePath = fileOperations.getPathOfTestFile(fileChange.oldUri.path);
          console.log(oldtestFilePath);

          var testFileName = fileOperations.getNameOfTestFile(fileChange.oldUri.path);

          if(fs.existsSync(oldtestFilePath)) {
            var selectedItem = await vscode.window.showInformationMessage("Do you want to move " + testFileName, "Yes, move", "No");
            if(selectedItem === "Yes, move") {
              
              var newTestFilePath = fileOperations.getPathOfTestFile(fileChange.newUri.path);
              
              //Verzeichnisse die nicht existieren erstellen
              fs.mkdir(path.dirname(newTestFilePath), { recursive: true }, (err) => {

                fs.copyFileSync(oldtestFilePath, newTestFilePath);

                fs.unlinkSync(oldtestFilePath);
                //XXX: Nun leere Ordner, löschen

                vscode.window.showInformationMessage("Moved file to " + newTestFilePath);
              });

              
            }

          }
        }

        
    });
  });

}
