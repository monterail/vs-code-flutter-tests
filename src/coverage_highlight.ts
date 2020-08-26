import * as vscode from 'vscode';
import * as fs from 'fs';

var coverageLines = {};


export function activate() {
    var lcovPath = vscode.workspace.rootPath + "/coverage/lcov.info";
    console.log(lcovPath);
    if(fs.existsSync(lcovPath) === true) {
      var content = fs.readFileSync(lcovPath).toString();
      var arr = content.split("\n");

      console.log(arr.length + " LCov Entries");
      
      var currentFile : String;

      arr.forEach(function(line) {
        if(line.startsWith("SF:")) {
          currentFile = line.substr(3);
          console.log("Current File: " + currentFile);

          coverageLines

        }
        else if(currentFile && line.startsWith("DA:")) {
          var data = line.substr(3);
          
        }
      });

    }

    console.log("activate coverage highlight");

    vscode.window.visibleTextEditors.forEach(function(editor) {
      decorate(editor);
    });

    vscode.workspace.onDidChangeTextDocument(event => {
      const openEditor = vscode.window.visibleTextEditors.filter(
        editor => editor.document.uri === event.document.uri
      )[0];
      decorate(openEditor);
    });

    vscode.workspace.onWillSaveTextDocument(event => {
      const openEditor = vscode.window.visibleTextEditors.filter(
        editor => editor.document.uri === event.document.uri
      )[0];
      decorate(openEditor);
    });
}

//https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions
const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255,0,0,0.3)',
    isWholeLine: true,
});


function decorate(editor: vscode.TextEditor) {

    console.log("decorate");

    


    

    let sourceCode = editor.document.getText();
    let regex = /(console\.log)/;
  
    let decorationsArray: vscode.DecorationOptions[] = [];
  
    const sourceCodeArr = sourceCode.split('\n');
  
    for (let line = 0; line < sourceCodeArr.length; line++) {
      let match = sourceCodeArr[line].match(regex);
  
      if (match !== null && match.index !== undefined) {
        let range = new vscode.Range(
          new vscode.Position(line, match.index),
          new vscode.Position(line, match.index + match[1].length)
        );
  
        let decoration = { range };
  
        decorationsArray.push(decoration);
      }
    }
  
    editor.setDecorations(decorationType, decorationsArray);
  }