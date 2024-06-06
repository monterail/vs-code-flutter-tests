import * as vscode from 'vscode';

import commandIds from './ids';

let terminal: vscode.Terminal;

export function activate(context: vscode.ExtensionContext) {
  const disposableGenerateCoverage = vscode.commands.registerCommand(commandIds.generateCoverageCommandId, () => {
    if (!terminal) {
      terminal = vscode.window.createTerminal("Generate coverage");
    }
    terminal.show();
    terminal.sendText('flutter test --coverage');
  });

  context.subscriptions.push(disposableGenerateCoverage);
}
