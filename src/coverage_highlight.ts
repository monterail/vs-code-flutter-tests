import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import commandIds from './commands/ids.js';

type CoverageInfo = {
  linesFound: number,
  linesExecuted: number,
  lineCoverage: { lineNumber: number, executions: number }[]
};

let coverage = new Map<String, CoverageInfo>();
const lcovPath = path.join(vscode.workspace.rootPath!, 'coverage', 'lcov.info');
let lcovWatcher: vscode.FileSystemWatcher;

const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
statusBarItem.tooltip = 'Test coverage';

let showHighlights = false;

export function activate() {
  coverage = readCoverageFile();
  attachCoverageInfoToEditor(vscode.window.activeTextEditor!);

  lcovWatcher = vscode.workspace.createFileSystemWatcher(lcovPath, false, false, true);
  // Reload file and redo decorations on each .lcov file content change
  lcovWatcher.onDidCreate((_) => {
    coverage = readCoverageFile();
    attachCoverageInfoToEditor(vscode.window.activeTextEditor!);
  })
  lcovWatcher.onDidChange((_) => {
    coverage = readCoverageFile();
    attachCoverageInfoToEditor(vscode.window.activeTextEditor!);
  })

  // Redo decorations for each tab change
  vscode.window.onDidChangeActiveTextEditor(() => {
    attachCoverageInfoToEditor(vscode.window.activeTextEditor!);
  });
}

//https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions
const coveredLineDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(0, 255, 0, 0.1)',
  isWholeLine: true,
});

const notCoveredLineDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(255, 0, 0, 0.1)',
  isWholeLine: true,
});

function attachCoverageInfoToEditor(editor: vscode.TextEditor) {
  statusBarItem.hide();
  if (!editor.document.uri.path.match(/dart$/)) {
    return;
  }

  const relativeSourceFilePath = editor.document.uri.toString()
    .replace(`file://${vscode.workspace.rootPath!}`, '')
    .substring(1)
    .replace(/_test.dart$/, '.dart')
    .replace(/^test/, 'lib');

  const coverageInfo = coverage.get(relativeSourceFilePath);
  displayCoveragePercentage(coverageInfo);

  const isTestFile = editor.document.uri.toString().includes('_test.dart');
  if (!isTestFile && coverageInfo && showHighlights) {
    decorateLines(editor, coverageInfo);
  } else if (!showHighlights) {
    clearLineDecorations(editor);
  }
}

function displayCoveragePercentage(coverageInfo?: CoverageInfo) {
  if (!coverageInfo) {
    statusBarItem.command = commandIds.generateCoverageCommandId;
    statusBarItem.text = 'Generate coverage';
  } else {
    const coveragePercentage = (coverageInfo?.linesExecuted || 0) / (coverageInfo?.linesFound || 1);
    statusBarItem.text = `${(coveragePercentage * 100).toFixed(1)}%`;
  }

  statusBarItem.show();
}

function decorateLines(editor: vscode.TextEditor, coverageInfo?: CoverageInfo) {
  const coveredDecorations: vscode.DecorationOptions[] = [];
  const notCoveredDecorations: vscode.DecorationOptions[] = [];
  for (const { lineNumber, executions } of coverageInfo!.lineCoverage) {
    const target = executions === 0 ? notCoveredDecorations : coveredDecorations;
    const range = new vscode.Range(
      new vscode.Position(lineNumber - 1, 0),
      new vscode.Position(lineNumber - 1, 0)
    );
    const decoration = { range };
    target.push(decoration);
  }
  editor.setDecorations(coveredLineDecoration, coveredDecorations);
  editor.setDecorations(notCoveredLineDecoration, notCoveredDecorations);
}

function clearLineDecorations(editor: vscode.TextEditor) {
  editor.setDecorations(coveredLineDecoration, []);
  editor.setDecorations(notCoveredLineDecoration, []);
}

function readCoverageFile(): Map<String, any> {
  if (!fs.existsSync(lcovPath)) {
    // No coverage file found, no-op.
    return new Map();
  }

  const coverage = new Map<String, any>();
  const content = fs.readFileSync(lcovPath).toString().split('end_of_record\n');
  for (const record of content) {
    if (!record.includes('SF:')) {
      continue;
    }

    const entries = record.split('\n');
    const fileName = entries.find((val) => val.startsWith('SF:'))!.substring(3)
    const fileCoverage = {
      linesFound: parseInt(entries.find((val) => val.startsWith('LF:'))?.substring(3) || '0', 10),
      linesExecuted: parseInt(entries.find((val) => val.startsWith('LH:'))?.substring(3) || '0', 10),
      lineCoverage: entries
        .filter((val) => val.startsWith('DA:'))
        .map((executionsForLine) => {
          const [lineNumber, executions] = executionsForLine.substring(3).split(',').map((string) => parseInt(string, 10));
          return { lineNumber, executions };
        })
    };
    coverage.set(fileName, fileCoverage);
  }
  return coverage;
}

export function activateToggleCommand(context: vscode.ExtensionContext) {
  const disposableToggleCoverageHighlight = vscode.commands.registerCommand(commandIds.toggleCoverageHighlight, () => {
    showHighlights = !showHighlights;
    coverage = readCoverageFile();
    attachCoverageInfoToEditor(vscode.window.activeTextEditor!);
  });

  context.subscriptions.push(disposableToggleCoverageHighlight);
}