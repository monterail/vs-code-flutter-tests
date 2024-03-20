import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as fileOperations from './file_operations';

export function createTestFile(originalFilePath: string, className: string | undefined, testType: string ) {

	//Get relative file path to /lib folder 
	if (fileOperations.isPathInLibFolder(originalFilePath)) {
		var pathOfTestFile = fileOperations.getPathOfTestFile(originalFilePath);
		fs.mkdir(path.dirname(pathOfTestFile), { recursive: true }, (err) => {
			if (err) throw err;

			var nameOfOriginalFile = path.basename(pathOfTestFile, path.extname(pathOfTestFile));

			var testGroupName: string;

			if (className === undefined) {
				var classNames = extractPublicClassNames(originalFilePath);

				if (classNames.length > 0) {
					//If multiple classNames are found -> take the first one. Usually there is only one className
					testGroupName = classNames[0];
				}
				else {
					testGroupName = nameOfOriginalFile;
				}

			}
			else {
				testGroupName = className;
			}



			var testFileContent = getTestFileContent(getPackagePath(originalFilePath), testGroupName, testType);
			//TODO: Checken, ob Datei bereits existiert, um Überschreiben zu verhindern!
			fs.writeFile(pathOfTestFile, testFileContent, (err) => {
				if (err) throw err;

				vscode.window.showInformationMessage("Success: Test File Created!");
				fileOperations.openDocumentInEditor(pathOfTestFile);

			});
		});

		//Create a file at the same relative file path to /test folder with "_test.dart" suffix in name
	}
	else {
		vscode.window.showErrorMessage("File must be inside of /lib folder of your workspace folder");
	}
}

function getPackagePath(originalFilePath: string): string {
	var relativePath = fileOperations.getRelativePathInLibFolder(originalFilePath);

	return relativePath;
}

//Trys to extract the class name in the given filepath
//Returns the first match
function extractPublicClassNames(originalFilePath: string): string[] {
	var sourceCode = fs.readFileSync(originalFilePath).toString();

	//Matches public classes like class exampleClass<S> {
	//Private classes are ignored, because we can't create instances in the test file anyway
	var classNameRegex = /class\s*([a-zA-Z0-9]*)(<\w*>)?\s*\{/;

	const sourceCodeArr = sourceCode.split('\n');

	var classNames: string[] = [];

	for (let line = 0; line < sourceCodeArr.length; line++) {
		var result = sourceCodeArr[line].match(classNameRegex);

		if (result !== null && result.length > 0) {
			classNames.push(result[1]);
		}
	}

	return classNames;
}


function getTestFileContent(pathToPackage: string, className: string, testType: string): string {
	if(testType === 'testUnit') {
		var packageName = fileOperations.getPackageName();
		return `import 'package:flutter_test/flutter_test.dart'; 
	import 'package:${packageName.replace(/\\/g, "/")}${pathToPackage.replace(/\\/g, "/")}';
	
	void main() {
		test(
			'',
			() async {
			},
		);
	}`;
	} else if(testType === 'testGrupe') {
		var packageName = fileOperations.getPackageName();
		return `import 'package:flutter_test/flutter_test.dart'; 
	import 'package:${packageName.replace(/\\/g, "/")}${pathToPackage.replace(/\\/g, "/")}';
	
	void main() {
		group(
			'${className}', 
			() {
				test(
					'',
					() async {
					},
				);
			},
		);
	}`;
	} else {
		var packageName = fileOperations.getPackageName();
		return `import 'package:flutter_test/flutter_test.dart'; 
	import 'package:${packageName.replace(/\\/g, "/")}${pathToPackage.replace(/\\/g, "/")}';
	
	void main() {
		testWidgets('Widget description', (tester) async {
		});
}`;
}}