import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/// Looks, if the path is in /lib folder
export function isPathInLibFolder(path: string): boolean {

	if ((process.platform === 'darwin')) {
		var libPath = vscode.workspace.rootPath + "/lib";
		return path.indexOf(libPath) === 0;
	} else {
		var libPath = vscode.workspace.rootPath + "/lib";
		var libPathFull = libPath.replace(/\//g, "\\");
		return path.indexOf(libPathFull) === 0;
	}
	
}

export function isTestFile(filePath: string): boolean {
	if ((process.platform === 'darwin')) {
		var testPath = vscode.workspace.rootPath + "/test";

		return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
	} else {
		var testPath = vscode.workspace.rootPath + "\\test";
		return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
	}

}

export function getRelativePathInLibFolder(filePath: string): string {
	if (isPathInLibFolder(filePath)) {
	
		if ((process.platform === 'darwin')) {
			var libPath = vscode.workspace.rootPath + "/lib";
		
			return filePath.substr(libPath.length);
		} else {
			var libPath = vscode.workspace.rootPath + "\\lib";
			var notMacPath = filePath.substr(libPath.length).replace(/\//g, "\\");
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

///Takes a folderName!!!
export function getPathOfTestFolder(originalFolderPath: string): string {
	var relativPathToLibFolder = getRelativePathInLibFolder(originalFolderPath);
	var testFolder = "test" + relativPathToLibFolder; //path.dirname(relativPathToLibFolder);

	if (vscode.workspace.workspaceFolders !== undefined) {
		var rootPath = vscode.workspace.workspaceFolders[0].uri.path;

		if ((process.platform === 'darwin')) {
			return rootPath + "/" + testFolder;
		} else {
			var test = rootPath + "/" + testFolder;
			return test.replace(/\//g, "\\");
		}

	}
	else {
		throw "No open workspaceFolders";
	}


}

/// relativPathToLibFolder is
export function getPathOfTestFile(originalFilePath: string): string {

	var relativPathToLibFolder = getRelativePathInLibFolder(originalFilePath);
	var folderOfTestFile = "test" + path.dirname(relativPathToLibFolder);
	if (vscode.workspace.workspaceFolders !== undefined) {
		var rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		if ((process.platform === 'darwin')) {
			return rootPath + "/" + folderOfTestFile + "/" + getNameOfTestFile(originalFilePath);
		} else {
			return rootPath.substr(1).replace(/\//g, "\\") + "\\" + folderOfTestFile + "\\" + getNameOfTestFile(originalFilePath);
		}

	}
	else {
		throw "No open workspaceFolders";
	}
	//TODO: Exception werfen
}

export function getNameOfSourceFile(originalFilePath: string): string {
	var nameOfOriginalFile = path.basename(originalFilePath);

	var idx = nameOfOriginalFile.indexOf("_test.dart");

	if (idx === -1) {
		return "";
	}
	else {
		var nameOfSourceFile = nameOfOriginalFile.substr(0, idx) + path.extname(originalFilePath);
		return nameOfSourceFile;
	}
}

export function getNameOfTestFile(originalFilePath: string): string {
	var nameOfOriginalFile = path.basename(originalFilePath, path.extname(originalFilePath));
	var nameOfTestFile = nameOfOriginalFile + "_test" + path.extname(originalFilePath);
	return nameOfTestFile;
}


export function searchSourceFilePath(source_file_name: string): string | null {

	if ((process.platform === 'darwin')) {
		var pathOfSourceFolder = vscode.workspace.rootPath + "/lib";

		var result = findPathsWithFileName(pathOfSourceFolder, source_file_name, []);
	} else {
		var pathOfSourceFolder = vscode.workspace.rootPath + "/lib";
		var result = findPathsWithFileName(pathOfSourceFolder.replace(/\//g, "\\"), source_file_name, []);
	}


	if (result.length >= 1) {
		return result[0];
	}
	else {
		return null;
	}
}

export function searchTestFilePath(test_file_name: string): string | null {
	if ((process.platform === 'darwin')) {
		var pathOfTestFolder = vscode.workspace.rootPath + "/test";
		var result = findPathsWithFileName(pathOfTestFolder, test_file_name, []);

	} else {
		var pathOfTestFolder = vscode.workspace.rootPath + "/test";
		let resultPath = pathOfTestFolder.replace(/\//g, "\\");
		var result = findPathsWithFileName(resultPath, test_file_name, []);
	}

	if (result.length >= 1) {
		return result[0];
	}
	else {
		return null;
	}

}

/// Returns paths of files with 
export function findPathsWithFileName(baseFolder: string, fileName: string, result: string[]) {
	var files = fs.readdirSync(baseFolder);
	result = result || [];

	files.forEach(
		function (file: string) {
			var newBaseFolder = path.join(baseFolder, file);
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
	if ((process.platform === 'darwin')) {
		var openPath = vscode.Uri.parse("file://" + filePath);

		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	} else {
		var openPath = vscode.Uri.parse("file:\\\\" + filePath);

		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	}

}

//Returns the name of the package from pubspec.yaml
export function getPackageName() {
	var pubspecPath = vscode.workspace.rootPath + "/pubspec.yaml";

	var content = fs.readFileSync(pubspecPath).toString();

	//Search for the line "name: <package-name>" in pubspec.yaml
	var matches = content.match(/^name: (\w*)/);

	if (matches !== null && matches.length >= 2) {
		return matches[1];
	}
	else {
		throw "Could not find the package name in pubspec.yaml";
	}

}