import * as vscode from 'vscode';
import * as fs from 'fs';

const myCommandId = 'better-tests.executeTestsInTestFile'; //TODO: Globale Variable an 2 Stellen

let myStatusBarItem: vscode.StatusBarItem;

export function activate() {
    
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  updateStatusBarItem();

  vscode.window.onDidChangeActiveTextEditor(event => {
    updateStatusBarItem();
  });
    
  vscode.workspace.onWillSaveTextDocument(event => {    
    updateStatusBarItem();
  });
}



function updateStatusBarItem() {
  //TODO: 
  //Look for tests for or in the current file
  //Look for the coverage file and calculate coverage


  myStatusBarItem.text = `0 Tests / 95% $(thumbsdown) `;
  myStatusBarItem.command = myCommandId;
  myStatusBarItem.show();
}