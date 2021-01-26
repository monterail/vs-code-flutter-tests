// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as coverage_highlight from './coverage_highlight';

import * as codeLens from './code_lens';

import * as fileOperations from './file_operations';

import * as executeTestsInTestFileCommand from './commands/executeTestsInTestFile';
import * as goToTestFileCommand from './commands/goToTestFile';
import * as goToSourceFileCommand from './commands/goToSourceFile';

import * as testFileCreator from './test_file_creator'

//Lcov explained
//https://github.com/mitchhentges/lcov-rs/wiki/File-format

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	codeLens.activate(context);
	goToTestFileCommand.activate(context);
	goToSourceFileCommand.activate(context);
	executeTestsInTestFileCommand.activate(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}

