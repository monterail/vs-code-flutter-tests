import * as vscode from 'vscode';
import * as fs from 'fs';

import * as fileOperations from '../file_operations';

let terminal: vscode.Terminal;

export function activate(context: vscode.ExtensionContext) {
  let disposableExecuteTests = vscode.commands.registerCommand('flutter-tests-assistant.executeTestsInTestFile', async () => {

    //if path contains _test.dart and is in folder <workspace-folder>/test/... we can execute the file directly
    //else -> we have to search for the test file by adding _test.dart to the filename and search for it in the <workspace-folder>/test/ directory
    //if test file doesn't exist, we recommend to create one :) 

    let path = vscode.window.activeTextEditor?.document.uri.path;
    if (process.platform === 'darwin') {
      if (path !== undefined) {
        let pathToExecute: string | undefined;

        if (fileOperations.isTestFile(path)) {
          let rootPath = vscode.workspace.rootPath || "";
          pathToExecute = path.substr(rootPath.length + 1);
        }
        else if (fileOperations.isPathInLibFolder(path)) {
          let testFilePath = fileOperations.getPathOfTestFile(path);
          if (fs.existsSync(testFilePath)) {
            let rootPath = vscode.workspace.rootPath || "";
            pathToExecute = testFilePath.substr(rootPath.length + 1);
          }
          else {

          }
        }

        if (pathToExecute !== undefined) {
          if (!terminal) {
            terminal = vscode.window.createTerminal("Flutter Tests");
          }
          terminal.show();
          terminal.sendText("flutter test --coverage " + pathToExecute);
        }
      }
    } else {
      if (path !== undefined) {
        let pathToExecute: string | undefined;
        let result = path.substr(1).replace(/\//g, "\\");
        if (fileOperations.isTestFile(result)) {
          let rootPath = vscode.workspace.rootPath || "";

          pathToExecute = result.substr(rootPath.length + 1);
        }
        else if (fileOperations.isPathInLibFolder(result)) {

          let testFilePath = fileOperations.getPathOfTestFile(result);
          if (fs.existsSync(testFilePath)) {
            let rootPath = vscode.workspace.rootPath || "";
            pathToExecute = testFilePath.substr(rootPath.length + 1);
          }
          else {

          }
        }

        if (pathToExecute !== undefined) {
          if (!terminal) {
            terminal = vscode.window.createTerminal("Flutter Tests");
          }
          terminal.show();
          terminal.sendText("flutter test --coverage " + pathToExecute);
        }
      }
    }

  });

  context.subscriptions.push(disposableExecuteTests);
}
