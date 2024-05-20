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
		//-> Man muss aufpassen, weil args letiieren kann, je nachdem von wo das commando aufgerufen wurde
		let className: string | undefined;
		if (typeof (args[0]) === "string") {
			className = args[0];
		}

		let path = vscode.window.activeTextEditor?.document.uri.path;

		if (process.platform === 'darwin') {
			if (path !== undefined) {
				if (fileOperations.isPathInLibFolder(path)) {
					// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
					// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)
					let searchResultPath = fileOperations.searchTestFilePath(fileOperations.getNameOfTestFile(path));

					if (searchResultPath !== null) {
						//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?

						fileOperations.openDocumentInEditor(searchResultPath);
					}
					else {
						//if test file doesn't exist, we recomment to create one :)
						let selection = await vscode.window.showQuickPick(["Yes", "No"], { "placeHolder": "Could not find file '" + fileOperations.getNameOfTestFile(path) + "' in 'test/'. Do you want to create it?" });
						if (selection === "Yes") {
							let selectionSecondStep = await vscode.window.showQuickPick(["Create unit test", "Create test group", "Create widget test"], { "placeHolder": "Choose initial test type:" });

							if (selectionSecondStep === "Create unit test") {
								testFileCreator.createTestFile(path, className, selectionSecondStep);
							}
							else if (selectionSecondStep === "Create test group") {
								testFileCreator.createTestFile(path, className, selectionSecondStep);
							}
							else {
								testFileCreator.createTestFile(path, className, 'Create widget test');
							}

						}
					}
				}
				else if (fileOperations.isTestFile(path)) {
					// Do nothing, because we are already in the test file
				}
				else {
					vscode.window.showErrorMessage(path + " is 1 not in the /lib path of this directory");
				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		} else {
			if (path !== undefined) {
				let result = path


				if (process.platform === 'linux') {
					result = path.substr(1);
				} else {
					result = path.substr(1).replace(/\//g, "\\");
				}


				if (fileOperations.isPathInLibFolder(result)) {
					let searchResultPath = fileOperations.searchTestFilePath(fileOperations.getNameOfTestFile(result));
					if (searchResultPath !== null) {
						fileOperations.openDocumentInEditor(searchResultPath);
					}
					else {
						// If test file doesn't exist, we recommend creating a new one
						let selection = await vscode.window.showQuickPick(["Yes", "No"], { "placeHolder": "Could not find file '" + fileOperations.getNameOfTestFile(result) + "' in 'test/'. Do you want to create it?" });
						if (selection === "Yes") {
							let selectionSecondStep = await vscode.window.showQuickPick(["Create unit test", "Create test group", "Create widget test"], { "placeHolder": "Choose initial widget type -- unit or widget." });

							if (selectionSecondStep === "Create unit test") {
								testFileCreator.createTestFile(result, className, selectionSecondStep);
							} else if (selectionSecondStep === "Create test group") {
								testFileCreator.createTestFile(result, className, selectionSecondStep);
							}

							else {

								testFileCreator.createTestFile(result, className, 'Create widget test');
							}
						}
					}
				}
				else if (fileOperations.isTestFile(result)) {
					// Do nothing, because we are already in the test file
				}
				else {
					vscode.window.showErrorMessage(result + " is not in the /lib path of this directory");
				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		}


	});

	context.subscriptions.push(disposable);
}