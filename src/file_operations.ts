import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/// Looks, if the path is in /lib folder
export function isPathInLibFolder(path: string) : boolean {
	var libPath = vscode.workspace.rootPath + "/lib";
	return path.indexOf(libPath) === 0;
}

export function isTestFile(filePath: string) : boolean {
	var testPath = vscode.workspace.rootPath + "/test";

	return filePath.indexOf(testPath) === 0 && path.basename(filePath).indexOf("_test.dart") >= 0;
}

export function getRelativePathInLibFolder(filePath: string): string {
	if(isPathInLibFolder(filePath)) {
		var libPath = vscode.workspace.rootPath + "/lib";
		return filePath.substr(libPath.length);
	}
	else {
		throw `${filePath} is not inside of /lib`;
	}
}

/// relativPathToLibFolder is
export function getPathOfTestFile(originalFilePath: string) : string {
	var relativPathToLibFolder = getRelativePathInLibFolder(originalFilePath);
	var folderOfTestFile = "test" + path.dirname(relativPathToLibFolder);

	if(vscode.workspace.workspaceFolders !== undefined) {
		var rootPath = vscode.workspace.workspaceFolders[0].uri.path
	
		return rootPath + "/" + folderOfTestFile + "/" + getNameOfTestFile(originalFilePath);
	}
	else {
		throw "No open workspaceFolders";
	}
	//TODO: Exception werfen
}

export function getNameOfSourceFile(originalFilePath: string) : string {
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

export function getNameOfTestFile(originalFilePath: string) : string {
	var nameOfOriginalFile = path.basename(originalFilePath,path.extname(originalFilePath));
	var nameOfTestFile = nameOfOriginalFile + "_test" + path.extname(originalFilePath);

	return nameOfTestFile;
}


export function searchSourceFilePath(source_file_name: string) : string | null {
	var pathOfSourceFolder = vscode.workspace.rootPath + "/lib";

	var result = findPathsWithFileName(pathOfSourceFolder, source_file_name, []);

	if(result.length >= 1) {
		return result[0];
	}
	else {
		return null;
	}
}

export function searchTestFilePath(test_file_name: string) : string | null{
	
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
export function findPathsWithFileName(baseFolder : string ,fileName : string, result: string[]) 
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

export function openDocumentInEditor(filePath: string) {

	//console.log("Open File: " + filePath);

	var openPath = vscode.Uri.parse("file://" + filePath);
	vscode.workspace.openTextDocument(openPath).then(doc => {

		//console.log("Opened " + openPath);
		

	  vscode.window.showTextDocument(doc);
	});
}

//Returns the name of the package from pubspec.yaml
export function getPackageName() {
	var pubspecPath = vscode.workspace.rootPath + "/pubspec.yaml";

	var content = fs.readFileSync(pubspecPath).toString();
	
	//Search for the line "name: <package-name>" in pubspec.yaml
	var matches = content.match(/^name: (\w*)/);

	if(matches !== null && matches.length >= 2) {
		return matches[1];
	}
	else {
		throw "Could not find the package name in pubspec.yaml";
	}

}