import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as fileOperations from './file_operations';

export function createTestFile(originalFilePath: string, className: string | undefined, testType: string) {

	// Get relative file path to /lib folder.
	if (fileOperations.isPathInLibFolder(originalFilePath)) {
		let pathOfTestFile = fileOperations.getPathOfTestFile(originalFilePath);
		fs.mkdir(path.dirname(pathOfTestFile), { recursive: true }, (err) => {
			if (err) throw err;

			let nameOfOriginalFile = path.basename(pathOfTestFile, path.extname(pathOfTestFile));

			let testGroupName: string;

			if (className === undefined) {
				let classNames = extractPublicClassNames(originalFilePath);

				if (classNames.length > 0) {
					// If multiple classNames are found take the first one. Usually there is only one className.
					testGroupName = classNames[0];
				}
				else {
					testGroupName = nameOfOriginalFile;
				}

			}
			else {
				testGroupName = className;
			}



			let testFileContent = getTestFileContent(getPackagePath(originalFilePath), testGroupName, testType);
			// TODO: Check whether the file already exists to prevent overwriting!
			fs.writeFile(pathOfTestFile, testFileContent, (err) => {
				if (err) throw err;

				vscode.window.showInformationMessage("Success: Test File Created!");
				fileOperations.openDocumentInEditor(pathOfTestFile);

			});
		});

		// Create a file at the same relative file path to /test folder with "_test.dart" suffix in name.
	}
	else {
		vscode.window.showErrorMessage("File must be inside of /lib folder of your workspace folder");
	}
}

function getPackagePath(originalFilePath: string): string {
	let relativePath = fileOperations.getRelativePathInLibFolder(originalFilePath);

	return relativePath;
}

// Tries to extract the class name in the given filepath.
// Returns the first match.
function extractPublicClassNames(originalFilePath: string): string[] {
	let sourceCode = fs.readFileSync(originalFilePath).toString();

	// Matches public classes like "class exampleClass<S> {"	
	// Private classes are ignored, because we can't create instances in the test file anyway.
	let classNameRegex = /class\s*([a-zA-Z0-9]*)(<\w*>)?\s*\{/;

	const sourceCodeArr = sourceCode.split('\n');

	let classNames: string[] = [];

	for (let line = 0; line < sourceCodeArr.length; line++) {
		let result = sourceCodeArr[line].match(classNameRegex);

		if (result !== null && result.length > 0) {
			classNames.push(result[1]);
		}
	}

	return classNames;
}


function getTestFileContent(pathToPackage: string, className: string, testType: string): string {
	if (testType === 'Create unit test') {
		let packageName = fileOperations.getPackageName();
		return `import 'package:flutter_test/flutter_test.dart'; 
import 'package:${packageName.replace(/\\/g, "/")}${pathToPackage.replace(/\\/g, "/")}';

void main() {
	test(
		'Should ',
		() async {
		},
	);
}
`;
	} else if (testType === 'Create test group') {
		let packageName = fileOperations.getPackageName();
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
}
`;
	} else {
		let packageName = fileOperations.getPackageName();
		return `import 'package:flutter_test/flutter_test.dart'; 
import 'package:${packageName.replace(/\\/g, "/")}${pathToPackage.replace(/\\/g, "/")}';

void main() {
	testWidgets('Should ', (tester) async {
	});
}
`;
	}
}