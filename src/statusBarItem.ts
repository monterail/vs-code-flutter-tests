import * as vscode from 'vscode';
import * as fs from 'fs';

import * as fileAnalyse from './file_analyse.js'
import * as fileOperations from './file_operations.js'

const executeTestsCommandId = 'better-tests.executeTestsInTestFile'; //TODO: Globale Variable an 2 Stellen
const gotoTestsCommandId = 'better-tests.goToTestFile'; //TODO: Globale Variable an 2 Stellen

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
  try {

    if(vscode.window.activeTextEditor !== undefined) {

      var document = vscode.window.activeTextEditor.document;
      var path = document.uri.fsPath;
      
      console.log(path);
      
      //If we have a source file, get the test file
      if(fileOperations.isPathInLibFolder(path)) {
        path = fileOperations.getPathOfTestFile(path)
      }

      //XXX: Es gibt noch gar keine Testdatei...

      //vscode.window.showInformationMessage(path+ " " + fileOperations.isTestFile(path));

      //If path is not a testfile we cannot show any tests in statusbar
      if(!fileOperations.isTestFile(path)) {
        myStatusBarItem.hide();
        return;
      }
      
      var testNumber:number = 0;

      if(!fs.existsSync(path)) { //test file does not exists yet
        testNumber = 0;
      }
      else {
          var fileContent = fs.readFileSync(path).toString();
          testNumber = fileAnalyse.getNumberOfTests(fileContent);
      }

      var text: string;

      if(testNumber === 0) {
        text = `0 Tests`;
      }
      else if(testNumber === 1) {
        text = "1 Test $(checklist)";
      }
      else {
        text = `${testNumber} Tests $(checklist)`;
      }
      

      myStatusBarItem.text = text;

      if(testNumber === 0) {
        //Triggers creation or goto event to test file, if there are no tests present
        myStatusBarItem.command = gotoTestsCommandId;
      }
      else {
        //Executes the tests
        myStatusBarItem.command = executeTestsCommandId;
      }
      myStatusBarItem.show();
      
    }
    else {
      myStatusBarItem.hide();
    }
  }
  catch (e) {
    vscode.window.showErrorMessage(e);
  }
}