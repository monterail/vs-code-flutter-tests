// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as coverage_highlight from './coverage_highlight';

//Lcov explained
//https://github.com/mitchhentges/lcov-rs/wiki/File-format

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	var terminal : vscode.Terminal;

	//coverage_highlight.activate();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('better-tests.goToTestFile', async (args) => {
		//we have to search for the test file by adding _test.dart to the filename and search for it in the <workspace-folder>/test/ directory
			
		var path = vscode.window.activeTextEditor?.document.uri.path; //this works when triggered via keybinding. args.path does not

		if(path !== undefined) {
			// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
			// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)
			var searchResultPath = searchTestFilePath(getNameOfTestFile(path));
	
			if(searchResultPath !== null) {
				//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?
	
				openDocumentInEditor(searchResultPath);
			}
			else {
				//if test file doesn't exist, we recomment to create one :)
				var selection = await vscode.window.showQuickPick(["Yes", "No"], {"placeHolder": "Could not find test '" + getNameOfTestFile(path) + "' in 'test/'. Do you want to create it?"}); 
				if(selection === "Yes" ) {
					//Idee: Parsen der Datei und einen Selection Dialog anzeigen, für welche Methoden bereits tests angelegt werden könnten?
					createTestFile(path);
				}	
			}
		}
		else {
			vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
		}
	});

	let disposableGoToSource = vscode.commands.registerCommand('better-tests.goToSourceFile', async (args) => {
		// TODO: Erst schauen, ob die Test Datei am vorgesehen Ort existiert
		// Falls nicht kann immer noch danach gesucht werden die Datei zu verschieben (Info Dialog)

		var path = vscode.window.activeTextEditor?.document.uri.path;
		if(path !== undefined) {
			var searchResultPath = searchSourceFilePath(getNameOfSourceFile(path));
	
			if(searchResultPath !== null) {
				//Note: Maybe check, if the path is correct to the original file path? Otherwise recommend to move it to another path?
	
				openDocumentInEditor(searchResultPath);
			}
			else {
				vscode.window.showInformationMessage("Could not find test '" + getNameOfSourceFile(path) + "' in 'test/'. Do you want to create it?")
	
			}
		}
		else {
			vscode.window.showErrorMessage("Could not get path of currently open file in explorer");
		}
	});

	let disposableExecuteTests = vscode.commands.registerCommand('better-tests.executeTestsInTestFile', async (args) => {

		//if path contains _test.dart and is in folder <workspace-folder>/test/... we can execute the file directly
		//else -> we have to search for the test file by adding _test.dart to the filename and search for it in the <workspace-folder>/test/ directory
		//if test file doesn't exist, we recomment to create one :) 

		var path = vscode.window.activeTextEditor?.document.uri.path;
		if(path !== undefined) {
			var pathToExecute : string | undefined;
	
			if(isTestFile(path)) {
				var rootPath = vscode.workspace.rootPath || "";
				pathToExecute = path.substr(rootPath.length+1);
			}
			else if(isPathInLibFolder(path)) {
				var testFilePath = getPathOfTestFile(path);
				if(fs.existsSync(testFilePath)) {
					var rootPath = vscode.workspace.rootPath || "";
					pathToExecute = testFilePath.substr(rootPath.length+1);
				}
				else {
					var selection = await vscode.window.showQuickPick(["Yes", "No"], {"placeHolder": "Could not find test '" + getNameOfTestFile(path) + "' in 'test/'. Do you want to create it?"}); 
					if(selection === "Yes" ) {
						//Idee: Parsen der Datei und einen Selection Dialog anzeigen, für welche Methoden bereits tests angelegt werden könnten?
						createTestFile(path);
					}	
				}
			}
			
			if(pathToExecute !== undefined) {
				if(!terminal) {
					terminal = vscode.window.createTerminal("Flutter Tests");
				}
				terminal.show();
				terminal.sendText("flutter test --coverage " + pathToExecute);
			}
		}
	});

	context.subscriptions.push(disposableExecuteTests);
	context.subscriptions.push(disposableGoToSource);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function createTestFile(originalFilePath: string) {

	//Get relative file path to /lib folder 
	if(isPathInLibFolder(originalFilePath)) {
		
		var pathOfTestFile = getPathOfTestFile(originalFilePath);

		fs.mkdir(path.dirname(pathOfTestFile) , { recursive: true }, (err) => {
			if (err) throw err;
			//console.log("Folder " + folderOfTestFile + " created successfully");

			var nameOfOriginalFile = path.basename(pathOfTestFile,path.extname(pathOfTestFile));

			//TODO: statt dem Dateinamen den Klassennamen extrahieren
			var testFileContent = getTestFileContent(nameOfOriginalFile);
			//TODO: Checken, ob Datei bereits existiert, um Überschreiben zu verhindern!
			fs.writeFile(pathOfTestFile, testFileContent, (err) => {
				if (err) throw err;

				//console.log("Test File created");

				vscode.window.showInformationMessage("Success: Test File Created!");
				openDocumentInEditor(pathOfTestFile);

			});
		});

		//Create a file at the same relative file path to /test folder with "_test.dart" suffix in name
	}
	else {
		vscode.window.showErrorMessage("File must be inside of /lib folder of your workspace folder");
	}	
}

function openDocumentInEditor(filePath: string) {

	//console.log("Open File: " + filePath);

	var openPath = vscode.Uri.parse("file://" + filePath);
	vscode.workspace.openTextDocument(openPath).then(doc => {

		//console.log("Opened " + openPath);
		

	  vscode.window.showTextDocument(doc);
	});
}

/// Looks, if the path is in /lib folder
function isPathInLibFolder(path: string) : boolean {
	var libPath = vscode.workspace.rootPath + "/lib";
	return path.indexOf(libPath) === 0;
}

function isTestFile(filePath: string) : boolean {
	var testPath = vscode.workspace.rootPath + "/test";

	return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
}

/// relativPathToLibFolder is
function getPathOfTestFile(originalFilePath: string) : string {
	var libPath = vscode.workspace.rootPath + "/lib";
	var relativPathToLibFolder = originalFilePath.substr(libPath.length);
	var folderOfTestFile = "test" + path.dirname(relativPathToLibFolder);
	return vscode.workspace.rootPath + "/" + folderOfTestFile + "/" + getNameOfTestFile(originalFilePath);
}

function getNameOfSourceFile(originalFilePath: string) : string {
	var nameOfOriginalFile = path.basename(originalFilePath);
	var idx = nameOfOriginalFile.indexOf("_test.dart");
	if(idx === -1 ) {
		//TODO: Throw Exception, its not a test file
		return "";
	}
	else {
		var nameOfSourceFile = nameOfOriginalFile.substr(0, idx) + path.extname(originalFilePath);
		return nameOfSourceFile;
	}
}

function getNameOfTestFile(originalFilePath: string) : string {
	var nameOfOriginalFile = path.basename(originalFilePath,path.extname(originalFilePath));
	var nameOfTestFile = nameOfOriginalFile + "_test" + path.extname(originalFilePath);

	return nameOfTestFile;
}


function searchSourceFilePath(source_file_name: string) : string | null {
	var pathOfSourceFolder = vscode.workspace.rootPath + "/lib";

	var result = findPathsWithFileName(pathOfSourceFolder, source_file_name, []);

	if(result.length >= 1) {
		return result[0];
	}
	else {
		return null;
	}
}

function searchTestFilePath(test_file_name: string) : string | null{
	
	var pathOfTestFolder = vscode.workspace.rootPath + "/test";

	var result = findPathsWithFileName(pathOfTestFolder, test_file_name, []);

	if(result.length >= 1) {
		return result[0];
	}
	else {
		return null;
	}

}

/// Returns paths of files with 
function findPathsWithFileName(baseFolder : string ,fileName : string, result: string[]) 
{
    var files = fs.readdirSync(baseFolder); 
    result = result || []; 

    files.forEach( 
        function (file: string) {
            var newBaseFolder = path.join(baseFolder,file);
            if ( fs.statSync(newBaseFolder).isDirectory() )
            {
                result = findPathsWithFileName(newBaseFolder,fileName,result);
            }
            else
            {
                if ( file === fileName )
                {
                    result.push(newBaseFolder);
                } 
            }
        }
    );
    return result;
}


//https://vscode.rocks/decorations/
// function highlightLine() {
// 	var activeEditor = vscode.window.activeTextEditor;
// 	activeEditor?.setDecorations();
// }


// function onSave() {
// 	vscode.workspace.onDidSaveTextDocument((document: TextDocument) => {
// 		if (document.languageId === "yourid" && document.uri.scheme === "file") {
// 			// do work
// 		}
// 	});
// }

//function automationShell() {
	//vscode.tasks.executeTask();
//}


function getTestFileContent(className: string): string {
	return `import 'package:test/test.dart'; 
// Path to package ergänzen
	
//Execute with context menü "Run tests in file"
	
void main() {
	group(
		'${className}', 
		() {
			//Write for ${className} tests here :) 
		},
	);
}`;
}
