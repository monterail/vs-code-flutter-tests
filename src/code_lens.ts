import * as vscode from 'vscode';
import * as fs from 'fs';

import * as fileOperations from './file_operations';


export function activate(context: vscode.ExtensionContext) {

    console.log("Activate CodeLens");

    let docSelector = {
        language: 'dart',
        scheme: 'file',
    }

    let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
        docSelector,
        new MyCodeLensProvider()
    )


    let commandDisposable = vscode.commands.registerCommand(
        'extension.addConsoleLog',
        decorate
    )

    context.subscriptions.push(commandDisposable)
}

function decorate(...args: any[]) {
    let lineNumber = args[0];
    if (lineNumber !== undefined) {
        console.log("Add Line");

        let insertionLocation = new vscode.Range(args[0], 0, args[0], 0);
        let snippet = new vscode.SnippetString('console.log($1);\n');

        vscode.window.activeTextEditor?.insertSnippet(snippet, insertionLocation)

    }
    else {
        //TODO: Fehlermeldung zeigen: Keine Linenumber
    }


}


class MyCodeLensProvider implements vscode.CodeLensProvider {
    //This is executed on document open an on document changes
    async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        let sourceCode = document.getText();
        //let regex = /(console\.log)/;

        //TODO:
        //Es soll über der Klassendefinition eine CodeLens anzeigt werden mit den Optionen
        //"No Test file found" -> Bei Klick wird Testfile generiert
        //"<number-of-tests> found" -> Bei Klick werden die Tests ausgeführt
        //"Show Test-Coverage" -> Bei Klick werden die Tests ausgeführt und die Test-Coverage angezeigt
        //"Run Tests"

        let testFileExists = false;

        let path = document.uri.path;
        if (path !== undefined) {
            let searchResultPath = fileOperations.searchTestFilePath(fileOperations.getNameOfTestFile(path));
            if (searchResultPath !== null) {
                testFileExists = true;
            }
        }


        let classRegex = /class\s*([a-zA-Z0-9]*)(<\w*>)?\s*\{/; //Matches a public class definition in dart ("class name-of-class[<...>] {")

        const sourceCodeArr = sourceCode.split('\n');

        let codeLenses = [];

        for (let line = 0; line < sourceCodeArr.length; line++) {
            let match = sourceCodeArr[line].match(classRegex);

            if (match !== null && match.index !== undefined) {

                let lineOfClass = new vscode.Range(line, 0, line, 0)

                let goToTestFile: vscode.Command = {
                    command: 'better-tests.goToTestFile',
                    title: testFileExists ? 'Go To TestFile' : 'Create TestFile',
                    arguments: [match[1]], //Provide Class Name to command
                }

                let executeTests: vscode.Command = {
                    command: 'better-tests.executeTestsInTestFile',
                    title: 'Run Tests', //TODO: Schreiben wie viele Tests gefunden wurden :)  "Run 5 Tests"

                }

                let codeLens = new vscode.CodeLens(lineOfClass, goToTestFile)
                codeLenses.push(codeLens)

                if (testFileExists) {
                    let codeLens = new vscode.CodeLens(lineOfClass, executeTests)
                    codeLenses.push(codeLens)
                }


            }
        }

        return codeLenses
    }
}