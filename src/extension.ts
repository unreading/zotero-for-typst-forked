import * as vscode from "vscode";
import * as http from "http";

function insertCitation(range?: vscode.Range) {
  let config = vscode.workspace.getConfiguration("zoteroForTypst");
  let host = config.get("host");
  let port = config.get("port");
  let format = "pandoc";
  if (config.get("useCiteCommand")) {
    format = "typst";
  }
  let url = `http://${host}:${port}/better-bibtex/cayw?format=${format}`;
  console.log(url);
  http
    .get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let editor = vscode.window.activeTextEditor;
        if (range) {
          editor.edit((edit) => edit.replace(range, data));
        } else {
          editor.edit((edit) =>
            editor.selections.forEach((selection) =>
              edit.replace(selection, data)
            )
          );
        }
      });

      res.on("error", (error) =>
        vscode.window.showErrorMessage(
          `Could not fetch citations: ${error.message}`
        )
      );
    })
    .on("error", (error) =>
      vscode.window.showErrorMessage(
        `Could not fetch citations: ${error.message}`
      )
    );
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Loaded Zotero for Typst");

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "zoteroForTypst.pickCitation",
      insertCitation
    )
  );

  let config = vscode.workspace.getConfiguration("zoteroForTypst");
  if (config.get("textCompletion")) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        let editor = vscode.window.activeTextEditor;
        let document = editor.document;
        let lang = document.languageId;
        if (lang !== "typst") {
          return;
        }
        console.log(event);

        event.contentChanges.forEach((change) => {
          let len = change.text.length;
          // TODO find better solution than len !== 1 to filter out undos and copies
          if (change.rangeLength !== 0 || len !== 1) {
            return;
          }
          console.log(change);
          let start = document.positionAt(change.rangeOffset - 3 + len);
          let end = document.positionAt(change.rangeOffset + len);
          let range = new vscode.Range(start, end);
          let text = editor.document.getText(range);
          if (text === "ZCT") {
            editor.edit((edit) => {
              insertCitation(range);
            });
          }
        });
      })
    );
  }
}

export function deactivate() {}
