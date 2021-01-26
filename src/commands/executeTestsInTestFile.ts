import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as fileOperations from '../file_operations';
import * as testFileCreator from '../test_file_creator';

var terminal: vscode.Terminal;

export function activate(context: vscode.ExtensionContext) {
    let disposableExecuteTests = vscode.commands.registerCommand('better-tests.executeTestsInTestFile', async (args) => {

        //if path contains _test.dart and is in folder <workspace-folder>/test/... we can execute the file directly
        //else -> we have to search for the test file by adding _test.dart to the filename and search for it in the <workspace-folder>/test/ directory
        //if test file doesn't exist, we recomment to create one :) 

        var path = vscode.window.activeTextEditor?.document.uri.path;
        if (path !== undefined) {
            var pathToExecute: string | undefined;

            if (fileOperations.isTestFile(path)) {
                var rootPath = vscode.workspace.rootPath || "";
                pathToExecute = path.substr(rootPath.length + 1);
            }
            else if (fileOperations.isPathInLibFolder(path)) {
                var testFilePath = fileOperations.getPathOfTestFile(path);
                if (fs.existsSync(testFilePath)) {
                    var rootPath = vscode.workspace.rootPath || "";
                    pathToExecute = testFilePath.substr(rootPath.length + 1);
                }
                else {
                    //TODO: Entweder Fehlermeldung anzeigen, oder an GoToTests weiterleiten

                    // var selection = await vscode.window.showQuickPick(["Yes", "No"], { "placeHolder": "Could not find test '" + fileOperations.getNameOfTestFile(path) + "' in 'test/'. Do you want to create it?" });
                    // if (selection === "Yes") {
                    //     //Idee: Parsen der Datei und einen Selection Dialog anzeigen, für welche Methoden bereits tests angelegt werden könnten?
                    //     testFileCreator.createTestFile(path);
                    // }
                }
            }

            if (pathToExecute !== undefined) {
                if (!terminal) {
                    terminal = vscode.window.createTerminal("Flutter Tests");
                }
                terminal.show();
                terminal.sendText("flutter test " + pathToExecute);
            }
        }
    });

    context.subscriptions.push(disposableExecuteTests);
}
