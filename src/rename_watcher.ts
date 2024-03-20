import * as vscode from 'vscode';
import * as fileOperations from './file_operations';
import * as fs from 'fs';
import * as path from 'path';


export function activate() {

  //IMPORTANT: For folders this event is only fired once for the folder and not for every file and folder that is inside of this folder
  vscode.workspace.onDidRenameFiles(async event => {
    event.files.forEach(async (fileChange) => {

      let newPath = '';
      if ((process.platform === 'darwin')) {
        if (fileOperations.isPathInLibFolder(fileChange.oldUri.path)) {

          var isDirectory = fs.lstatSync(fileChange.newUri.path).isDirectory();

          if (isDirectory == true) {
            renameFolder(fileChange.oldUri.path, fileChange.newUri.path);
          }
          else {
            var oldtestFilePath = fileOperations.getPathOfTestFile(fileChange.oldUri.path);
            var testFileName = fileOperations.getNameOfTestFile(fileChange.oldUri.path);

            if (fs.existsSync(oldtestFilePath)) {

              var selectedItem = await vscode.window.showInformationMessage("Do you want to move/rename " + testFileName + "?", "Yes", "No");
              if (selectedItem === "Yes") {

                var newTestFilePath = fileOperations.getPathOfTestFile(fileChange.newUri.path);

                //Verzeichnisse die nicht existieren erstellen
                fs.mkdir(path.dirname(newTestFilePath), { recursive: true }, async (err) => {


                  //XXX: VSCode erkennt nicht, dass die Datei verschoben wurde wenn sie geöffnet ist, sie wird dann als "gelöscht" angezeigt
                  //-> Müssen nach aktive editors schauen und das modifizieren, scheint es keine API für zu geben :/
                  //-> Issue in Github setzen?
                  //-> window.onDidChangeActiveTextEditor nutzen und die aktiven editoren tracken

                  fs.renameSync(oldtestFilePath, newTestFilePath)

                  deleteEmptyFoldersRecursively(path.dirname(oldtestFilePath));

                  //Change Path to sourcefile in test file (path to package)
                  var relativePathOld = fileOperations.getRelativePathInLibFolder(fileChange.oldUri.path);
                  var relativePathNew = fileOperations.getRelativePathInLibFolder(fileChange.newUri.path);

                  console.log("Change \n" + relativePathOld + "\n to \n" + relativePathNew + "\nin " + newTestFilePath);
                  var content = fs.readFileSync(newTestFilePath).toString();
                  var content = content.replace(relativePathOld, relativePathNew);
                  fs.writeFileSync(newTestFilePath, content);

                  vscode.window.showInformationMessage("Moved file to " + newTestFilePath);
                });
              }
            }
          }
        }
      } else {
        if (fileOperations.isPathInLibFolder((fileChange.oldUri.path).replace(/\//g, "\\"))) {
        	if(((fileChange.newUri.path).replace(/\//g, "\\")).startsWith("\\")) {
           newPath = (fileChange.newUri.path).substring(1);
          newPath = newPath.replace(/\//g, "\\");
          var isDirectory = fs.lstatSync(newPath).isDirectory();
        } else {
          newPath = newPath.replace(/\//g, "\\");
          var isDirectory = fs.lstatSync(newPath).isDirectory();
        }
        

          if (isDirectory == true) {
            renameFolder(fileChange.oldUri.path, fileChange.newUri.path);
          }
          else {
            var oldtestFilePath = fileOperations.getPathOfTestFile(fileChange.oldUri.path);

            var testFileName = fileOperations.getNameOfTestFile(fileChange.oldUri.path);

            if (fs.existsSync(oldtestFilePath)) {
              var selectedItem = await vscode.window.showInformationMessage("Do you want to move/rename " + testFileName + "?", "Yes", "No");
              if (selectedItem === "Yes") {

                var newTestFilePath = fileOperations.getPathOfTestFile(fileChange.newUri.path);
                //Verzeichnisse die nicht existieren erstellen
                fs.mkdir(path.dirname(newTestFilePath), { recursive: true }, async (err) => {


                  //XXX: VSCode erkennt nicht, dass die Datei verschoben wurde wenn sie geöffnet ist, sie wird dann als "gelöscht" angezeigt
                  //-> Müssen nach aktive editors schauen und das modifizieren, scheint es keine API für zu geben :/
                  //-> Issue in Github setzen?
                  //-> window.onDidChangeActiveTextEditor nutzen und die aktiven editoren tracken
       
                  fs.renameSync(oldtestFilePath, newTestFilePath);
                  deleteEmptyFoldersRecursively(path.dirname(oldtestFilePath));
                  //Change Path to sourcefile in test file (path to package);
  
                  var libPath = vscode.workspace.rootPath + "\\lib";
                  
                  var filePath =  (fileChange.oldUri.path).replace(/\//g, "\\");
            
                  if(filePath.startsWith("\\")) {
                     filePath = filePath.substr(1);
                  }
                  var relativePathOld = filePath.substr(libPath.length);
                  relativePathOld = relativePathOld.replace(/\\/g, "/");
                  var filePath2 =  (fileChange.newUri.path).replace(/\//g, "\\");
            
                  if(filePath2.startsWith("\\")) {
                     filePath2 = filePath2.substr(1);
                  }
                  var relativePathNew = filePath2.substr(libPath.length);
                  relativePathNew = relativePathNew.replace(/\\/g, "/");

                  var content = fs.readFileSync(newTestFilePath).toString();
        
                  var content = content.replace(relativePathOld, relativePathNew);
                  fs.writeFileSync(newTestFilePath, content);
                  vscode.window.showInformationMessage("Moved file to " + newTestFilePath);
                });
              }
            }
          }
        }
      }
     

    });
  });

}

///Goes bottom up from folderPath and deletes empty folders
function deleteEmptyFoldersRecursively(folderPath: string) {
  if (fileOperations.isDirectoryEmpty(folderPath)) {
    fs.rmdirSync(folderPath);
    deleteEmptyFoldersRecursively(path.dirname(folderPath));
  }
}


//XXX: Multiple files in folder handeln mit nested foldern

//Rekursiv durch alle Dateien durch gehen?
//1. Fall -> Name hat sich geändert, dann muss auch nur der Name des Ordners geändert werden
//2. Fall -> Verschoben, dann muss auch dort nur der Name verschoben werden

//Rekursiv muss allerdings der File-Path angepasst werden :/
async function renameFolder(oldPath: string, newPath: string) {
  if ((process.platform === 'darwin')) {
    var oldTestFolder = fileOperations.getPathOfTestFolder(oldPath);

    console.log(oldTestFolder);
  
    if (fs.existsSync(oldTestFolder)) {
  
      var selectedItem = await vscode.window.showInformationMessage("Do you want to move/rename " + path.basename(oldTestFolder) + " in /test and it's children ?", "Yes", "No");
      if (selectedItem === "Yes") {
  
        var newTestFolder = fileOperations.getPathOfTestFolder(newPath);
  
        //Verzeichnisse die nicht existieren erstellen
        fs.mkdir(path.dirname(newTestFolder), { recursive: true }, (err) => {
  
          fs.renameSync(oldTestFolder, newTestFolder)
  
          deleteEmptyFoldersRecursively(path.dirname(oldTestFolder))
  
          var relativePathOld = fileOperations.getRelativePathInLibFolder(oldPath);
          var relativePathNew = fileOperations.getRelativePathInLibFolder(newPath);
  
          //Besser wäre noch "package:testfolder/" davor zusetzen, ist sicherer
  
          console.log("Change \n" + relativePathOld + "\n to \n" + relativePathNew);
          //XXX: Path to package in allen nested files und foldern ändern...
  
          updatePathToPackageRecursively(newTestFolder, relativePathOld, relativePathNew);
  
        });
      }
    }
  } else {

    var oldTestFolder = fileOperations.getPathOfTestFolder(oldPath);

    console.log(oldTestFolder);
  
    if (fs.existsSync(oldTestFolder)) {
  
      var selectedItem = await vscode.window.showInformationMessage("Do you want to move/rename " + path.basename(oldTestFolder) + " in /test and it's children ?", "Yes", "No");
      if (selectedItem === "Yes") {
  
        var newTestFolder = fileOperations.getPathOfTestFolder(newPath);
  
        //Verzeichnisse die nicht existieren erstellen
        fs.mkdir(path.dirname(newTestFolder), { recursive: true }, (err) => {
  
          fs.renameSync(oldTestFolder, newTestFolder)
  
          deleteEmptyFoldersRecursively(path.dirname(oldTestFolder));
          
          var relativePathOld = fileOperations.getRelativePathInLibFolder(oldPath);
      
          var relativePathNew = fileOperations.getRelativePathInLibFolder(newPath);
  
          console.log("Change \n" + relativePathOld + "\n to \n" + relativePathNew);
          //XXX: Path to package in allen nested files und foldern ändern...
  
          updatePathToPackageRecursively(newTestFolder, relativePathOld, relativePathNew);
  
        });
      }
    }
  }

}

function updatePathToPackageRecursively(parentFolderPath: string, searchText: string, replaceText: string): void {

  for (let filePath of fileOperations.walkSync(parentFolderPath)) {
    var content = fs.readFileSync(filePath).toString();

    if ((process.platform !== 'darwin')) {
      searchText = searchText.replace(/\\/g, "/");
      replaceText = replaceText.replace(/\\/g, "/");
    }

    //XXX: Scheinbar wird nur das erste vorkommen replaced :/
    content = content.replace(searchText, replaceText);
    fs.writeFileSync(filePath, content);
  }
}

