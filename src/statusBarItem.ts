import * as vscode from 'vscode';
import * as fs from 'fs';

import * as fileAnalyse from './file_analyse.js'
import * as fileOperations from './file_operations.js'

const executeTestCommand = 'better-tests.executeTestsInTestFile'; //TODO: Globale Variable an 2 Stellen

let myStatusBarItem: vscode.StatusBarItem;

export function activate() {
    
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  updateStatusBarItem();

  vscode.window.onDidChangeActiveTextEditor(event => {
    updateStatusBarItem();
  });
    
  vscode.workspace.onDidSaveTextDocument(event => {    
    updateStatusBarItem();
  });
}

function updateStatusBarItem() {
  if(vscode.window.activeTextEditor !== undefined) {

    var document = vscode.window.activeTextEditor.document;
    var path = document.uri.fsPath;
    
    console.log(path);
    
    //If we have a source file, get the test file
    if(fileOperations.isPathInLibFolder(path)) {
       path = fileOperations.getPathOfTestFile(path)
    }

    //If path is not a testfile we cannot show any tests in statusbar
    if(!fileOperations.isTestFile(path)) {
      myStatusBarItem.hide();
      return;
    }

    var fileContent = fs.readFileSync(path).toString();
      
    console.log(fileContent);

    var testNumber = fileAnalyse.getNumberOfTests(fileContent);
    
    //XXX:
    //WENN keine Tests gefunden wurden oder die Testdatei nicht gefunden werden konnte, wird das "GoToTests" Kommando hinterlegt (was ist wenn man in einer Testdatei ist?)
    //WENN Tests gefunden wurden, wird das TestExecution Kommando hinterlegt


    console.log(testNumber);

    myStatusBarItem.text = `${testNumber} Tests $(thumbsdown) `;
    myStatusBarItem.command = executeTestCommand;
    myStatusBarItem.show();


    
    
  }
  else {
    myStatusBarItem.hide();
  }
}