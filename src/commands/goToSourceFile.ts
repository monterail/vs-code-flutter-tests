import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as fileOperations from '../file_operations';
import * as testFileCreator from '../test_file_creator';

export function activate(context: vscode.ExtensionContext) {
	let disposableGoToSource = vscode.commands.registerCommand('better-tests.goToSourceFile', async (args) => {
		// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
		// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)

		let path = vscode.window.activeTextEditor?.document.uri.path;

		if (process.platform === 'darwin') {
			if (path !== undefined) {
				let searchResultPath = fileOperations.searchSourceFilePath(fileOperations.getNameOfSourceFile(path));

				if (searchResultPath !== null) {
					//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?

					fileOperations.openDocumentInEditor(searchResultPath);
				}
				else {
					vscode.window.showInformationMessage("Could not find test '" + fileOperations.getNameOfSourceFile(path) + "' in 'test/'. Do you want to create it?")

				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		} else {
			if (path !== undefined) {
				let result = path.replace(/\//g, "\\");
				let searchResultPath = fileOperations.searchSourceFilePath(fileOperations.getNameOfSourceFile(result));

				if (searchResultPath !== null) {
					//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?

					fileOperations.openDocumentInEditor(searchResultPath);
				}
				else {
					vscode.window.showInformationMessage("Could not find test '" + fileOperations.getNameOfSourceFile(path) + "' in 'test\\'. Do you want to create it?")

				}
			}
			else {
				vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
			}
		}


	});

	context.subscriptions.push(disposableGoToSource);

}