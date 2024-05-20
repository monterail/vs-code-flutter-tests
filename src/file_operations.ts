import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/// Looks, if the path is in /lib folder
export function isPathInLibFolder(path: string): boolean {

	if (process.platform === 'darwin') {
		let libPath = vscode.workspace.rootPath + "/lib";
		return path.indexOf(libPath) === 0;
	} else if (process.platform === 'linux') {

		if (path.startsWith("\\") || path.startsWith("/")) {

			let newPath = path.substring(1);
			newPath = newPath.replace(/\//g, "\\");
			let libPath = vscode.workspace.rootPath + "/lib";

			let libPathFull = libPath.substring(1);
			return newPath.indexOf(libPathFull) === 0;
		} else {

			let libPath = vscode.workspace.rootPath + "/lib";
			let libPathFull = libPath.substring(1);
			return path.indexOf(libPathFull) === 0;
		}
	}


	else {

		if (path.startsWith("\\") || path.startsWith("/")) {

			let newPath = path.substring(1);
			newPath = newPath.replace(/\//g, "\\");
			let libPath = vscode.workspace.rootPath + "\\lib";

			let libPathFull = libPath.replace(/\//g, "\\");
			return newPath.indexOf(libPathFull) === 0;
		} else {

			let libPath = vscode.workspace.rootPath + "\\lib";
			let libPathFull = libPath.replace(/\//g, "\\");
			return path.indexOf(libPathFull) === 0;
		}

	}

}

export function isTestFile(filePath: string): boolean {
	if (process.platform === 'darwin') {
		let testPath = vscode.workspace.rootPath + "/test";

		return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
	} else {

		let testPath = vscode.workspace.rootPath + "\\test";


		return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
	}

}

export function getRelativePathInLibFolder(filePath: string): string {

	if (isPathInLibFolder(filePath)) {


		if (process.platform === 'darwin') {
			let libPath = vscode.workspace.rootPath + "/lib";

			return filePath.substr(libPath.length);
		} else {

			let libPath = vscode.workspace.rootPath + "\\lib";


			let filePath2 = filePath.replace(/\//g, "\\");

			if (filePath2.startsWith("\\")) {
				filePath2 = filePath2.substr(1);
			}

			let notMacPath = filePath2.substr(libPath.length);
			return notMacPath;

		}

	}
	else {
		throw `${filePath} is not inside of /lib`;
	}
}

///returns all paths of files in nested folders.
///can be used so: for (let filePath of walkSync(parentFolderPath)) {...
export function* walkSync(dir: string): Generator<string, any, undefined> {
	const files = fs.readdirSync(dir, { withFileTypes: true });
	for (let i = 0; i < files.length; i++) {
		if (files[i].isDirectory()) {
			yield* walkSync(path.join(dir, files[i].name));
		} else {
			yield path.join(dir, files[i].name);
		}
	}
}

export function isDirectoryEmpty(folderPath: string) {
	return fs.readdirSync(folderPath).length === 0;
}

export function getPathOfTestFolder(originalFolderPath: string): string {
	let relativePathToLibFolder = getRelativePathInLibFolder(originalFolderPath);

	let testFolder = "test" + relativePathToLibFolder;

	if (vscode.workspace.workspaceFolders !== undefined) {
		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;

		// rootPath
		// /c:/Users/PC/Desktop/flutter/flutter_application_1
		if (process.platform === 'darwin') {
			return rootPath + "/" + testFolder;
		} else {


			// newPath
			// c:/Users/PC/Desktop/flutter/flutter_application_1/lib/src/sample_feature

			rootPath = rootPath.replace(/\//g, "\\");
			if (rootPath.startsWith("\\") || rootPath.startsWith("/")) {
				rootPath = rootPath.substring(1);
			}

			let test = rootPath + "/" + testFolder;

			return test.replace(/\//g, "\\");
		}

	}
	else {
		throw "No open workspaceFolders";
	}


}

export function getPathOfTestFile(originalFilePath: string): string {
	let originalFilePath2 = '';
	let relativePathToLibFolder = '';
	if ((process.platform !== 'darwin')) {
		originalFilePath2 = originalFilePath.replace(/\//g, "\\");
		if (originalFilePath2.startsWith("\\")) {
			originalFilePath2 = originalFilePath2.substr(1)
			relativePathToLibFolder = getRelativePathInLibFolder(originalFilePath2);
		} else {
			relativePathToLibFolder = getRelativePathInLibFolder(originalFilePath2);
		}

	} else {
		relativePathToLibFolder = getRelativePathInLibFolder(originalFilePath);
	}

	let folderOfTestFile = "test" + path.dirname(relativePathToLibFolder);
	if (vscode.workspace.workspaceFolders !== undefined) {

		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		if (process.platform === 'darwin') {
			return rootPath + "/" + folderOfTestFile + "/" + getNameOfTestFile(originalFilePath);
		} else {
			rootPath = rootPath.replace(/\//g, "\\");
			if (rootPath.startsWith("\\")) {
				let test = rootPath.substr(1).replace(/\//g, "\\") + "\\" + folderOfTestFile + "\\" + getNameOfTestFile(originalFilePath2)

				return test;
			} else {

				let test2 = rootPath.replace(/\//g, "\\") + "\\" + folderOfTestFile + "\\" + getNameOfTestFile(originalFilePath2);

				return test2;
			}


		}

	}
	else {
		throw "No open workspaceFolders";
	}
	//TODO: Exception werfen
}

export function getNameOfSourceFile(originalFilePath: string): string {
	let nameOfOriginalFile = path.basename(originalFilePath);

	let idx = nameOfOriginalFile.indexOf("_test.dart");

	if (idx === -1) {
		return "";
	}
	else {
		let nameOfSourceFile = nameOfOriginalFile.substr(0, idx) + path.extname(originalFilePath);
		return nameOfSourceFile;
	}
}

export function getNameOfTestFile(originalFilePath: string): string {
	let nameOfOriginalFile = path.basename(originalFilePath, path.extname(originalFilePath));
	let nameOfTestFile = nameOfOriginalFile + "_test" + path.extname(originalFilePath);

	return nameOfTestFile;
}


export function searchSourceFilePath(source_file_name: string): string | null {
	let results = [];
	if (process.platform === 'darwin') {
		let pathOfSourceFolder = vscode.workspace.rootPath + "/lib";

		results = findPathsWithFileName(pathOfSourceFolder, source_file_name, []);
	} else {
		let pathOfSourceFolder = vscode.workspace.rootPath + "/lib";
		results = findPathsWithFileName(pathOfSourceFolder.replace(/\//g, "\\"), source_file_name, []);
	}


	if (results.length >= 1) {
		return results[0];
	}
	else {
		return null;
	}
}

export function searchTestFilePath(test_file_name: string): string | null {
	let results = [];
	if (process.platform === 'darwin') {
		let pathOfTestFolder = vscode.workspace.rootPath + "/test";
		results = findPathsWithFileName(pathOfTestFolder, test_file_name, []);

	} else {
		let pathOfTestFolder = vscode.workspace.rootPath + "/test";
		let resultPath = pathOfTestFolder.replace(/\//g, "\\");
		results = findPathsWithFileName(resultPath, test_file_name, []);
	}

	if (results.length >= 1) {
		return results[0];
	}
	else {
		return null;
	}

}

/// Returns paths of files with 
export function findPathsWithFileName(baseFolder: string, fileName: string, result: string[]) {
	let files = fs.readdirSync(baseFolder);
	result = result || [];

	files.forEach(
		function (file: string) {
			let newBaseFolder = path.join(baseFolder, file);
			if (fs.statSync(newBaseFolder).isDirectory()) {
				result = findPathsWithFileName(newBaseFolder, fileName, result);
			}
			else {
				if (file === fileName) {
					result.push(newBaseFolder);
				}
			}
		}
	);
	return result;
}

export function openDocumentInEditor(filePath: string) {
	if (process.platform === 'darwin') {
		let openPath = vscode.Uri.parse("file://" + filePath);

		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	} else {
		let openPath = vscode.Uri.parse("file:\\\\" + filePath);

		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	}

}

//Returns the name of the package from pubspec.yaml
export function getPackageName() {
	let pubspecPath = vscode.workspace.rootPath + "/pubspec.yaml";

	let content = fs.readFileSync(pubspecPath).toString();

	//Search for the line "name: <package-name>" in pubspec.yaml
	let matches = content.match(/^name: (\w*)/);

	if (matches !== null && matches.length >= 2) {
		return matches[1];
	}
	else {
		throw "Could not find the package name in pubspec.yaml";
	}

}