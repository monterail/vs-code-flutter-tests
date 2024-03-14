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

		if ((process.platform === 'darwin')) {
			if(path !== undefined) {
				if(fileOperations.isPathInLibFolder(path)) {
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
				else if(fileOperations.isTestFile(path)) {
					//Do nothing, because we are already in the test file
				}
				else {
					vscode.window.showErrorMessage(path+" is not in the /lib path of this directory");
				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		} else {
			if(path !== undefined) {
			
				var result = path.substr(1).replace(/\//g, "\\");
			
				// c:\Users\PC\Desktop\flutter\flutter_application_1\lib\src\sample_feature\sample_item.dart
				if(fileOperations.isPathInLibFolder(result)) {
					// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
					// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)
					// vscode.window.showInformationMessage(result);
					var searchResultPath = fileOperations.searchTestFilePath(fileOperations.getNameOfTestFile(result));
				
					if(searchResultPath !== null) {
						vscode.window.showInformationMessage(searchResultPath);
						//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?
			
						fileOperations.openDocumentInEditor(searchResultPath);
					}
					else {
						//if test file doesn't exist, we recomment to create one :)
						var selection = await vscode.window.showQuickPick(["Yes", "No"], {"placeHolder": "Could not find file '" + fileOperations.getNameOfTestFile(result) + "' in 'test/'. Do you want to create it?"}); 
						if(selection === "Yes" ) {
					
							//Idee: Parsen der Datei und einen Selection Dialog anzeigen, für welche Methoden bereits tests angelegt werden könnten?
							testFileCreator.createTestFile(result, className);
						}	
					}
				}
				else if(fileOperations.isTestFile(result)) {
					//Do nothing, because we are already in the test file
				}
				else {
					vscode.window.showErrorMessage(result+" is not in the /lib path of this directory");
				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		}


    });
    
    context.subscriptions.push(disposable);
}