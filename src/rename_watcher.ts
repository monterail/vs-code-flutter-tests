import * as vscode from 'vscode';
import * as fileOperations from './file_operations';
import * as fs from 'fs';
import * as path from 'path';


export function activate() {
    
  //IMPORTANT: For folders this event is only fired once for the folder and not for every file and folder that is inside of this folder
  vscode.workspace.onDidRenameFiles(async event => {
    event.files.forEach(async (fileChange)  => {

        //XXX: Multiple files in folder handeln mit nested foldern


        if(fileOperations.isPathInLibFolder(fileChange.oldUri.path)) {

          var oldtestFilePath = fileOperations.getPathOfTestFile(fileChange.oldUri.path);
          //console.log(oldtestFilePath);

          var testFileName = fileOperations.getNameOfTestFile(fileChange.oldUri.path);

          if(fs.existsSync(oldtestFilePath)) {
            var selectedItem = await vscode.window.showInformationMessage("Do you want to move/rename " + testFileName + "?", "Yes", "No");
            if(selectedItem === "Yes") {
              
              var newTestFilePath = fileOperations.getPathOfTestFile(fileChange.newUri.path);
              
              //Verzeichnisse die nicht existieren erstellen
              fs.mkdir(path.dirname(newTestFilePath), { recursive: true }, (err) => {


                //XXX: VSCode erkennt nicht, dass die Datei verschoben wurde
                //-> Müssen nach aktive editors schauen und das modifizieren
                fs.renameSync(oldtestFilePath,newTestFilePath)

                //XXX: Nun leere Ordner, löschen

                //Dies bezieht sich nicht auf die Open als Registerkarte sichtbaren editoren
                //var editors = vscode.workspace.;


                //Change Path to sourcefile in test file (path to package)
                var relativePathOld = fileOperations.getRelativePathInLibFolder(fileChange.oldUri.path);
                var relativePathNew = fileOperations.getRelativePathInLibFolder(fileChange.newUri.path);

                console.log("Change \n" + relativePathOld + "\n to \n" + relativePathNew);
                var content = fs.readFileSync(newTestFilePath).toString();
                var content = content.replace(relativePathOld, relativePathNew);
                fs.writeFileSync(newTestFilePath, content);



                vscode.window.showInformationMessage("Moved file to " + newTestFilePath);
              });

              
            }

          }
        }

        
    });
  });

}
