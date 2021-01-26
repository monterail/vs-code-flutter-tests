import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as fileOperations from '../file_operations';
import * as testFileCreator from '../test_file_creator';

export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('better-tests.goToTestFile', async (...args) => {
		//we have to search for the test file by adding _test.dart to the filename and search for it in the <workspace-folder>/test/ directory
			
		console.log("GoToTestFile-Args:");
		console.log(args);
		//-> Man muss aufpassen, weil args variieren kann, je nachdem von wo das commando aufgerufen wurde
		var className: string | undefined;
		if(typeof(args[0]) === "string") {
			className = args[0];
		}

		var path = vscode.window.activeTextEditor?.document.uri.path;

		if(path !== undefined) {
			// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
			// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)
			var searchResultPath = fileOperations.searchTestFilePath(fileOperations.getNameOfTestFile(path));
	
			if(searchResultPath !== null) {
				//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?
	
				fileOperations.openDocumentInEditor(searchResultPath);
			}
			else {
				//if test file doesn't exist, we recomment to create one :)
				var selection = await vscode.window.showQuickPick(["Yes", "No"], {"placeHolder": "Could not find file '" + fileOperations.getNameOfTestFile(path) + "' in 'test/'. Do you want to create it?"}); 
				if(selection === "Yes" ) {
					//Idee: Parsen der Datei und einen Selection Dialog anzeigen, für welche Methoden bereits tests angelegt werden könnten?
					testFileCreator.createTestFile(path, className);
				}	
			}
		}
		else {
			vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
		}
    });
    
    context.subscriptions.push(disposable);
}