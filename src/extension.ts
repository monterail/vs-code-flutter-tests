import * as vscode from 'vscode';
import * as coverageHighlight from './coverage_highlight';

import * as executeTestsInTestFileCommand from './commands/executeTestsInTestFile';
import * as goToTestFileCommand from './commands/goToTestFile';
import * as goToSourceFileCommand from './commands/goToSourceFile';
import * as generateCoverageCommand from './commands/generateCoverage';

import * as statusBarItem from './status_bar_item';
import * as renameWatcher from './rename_watcher';

//Lcov explained
//https://github.com/mitchhentges/lcov-rs/wiki/File-format

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//codeLens.activate(context);
	goToTestFileCommand.activate(context);
	goToSourceFileCommand.activate(context);
	executeTestsInTestFileCommand.activate(context);
	generateCoverageCommand.activate(context);
	statusBarItem.activate();
	coverageHighlight.activate();
	coverageHighlight.activateToggleCommand(context);

	renameWatcher.activate();
}

// this method is called when your extension is deactivated
export function deactivate() { }

