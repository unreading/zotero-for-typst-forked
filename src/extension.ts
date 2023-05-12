import * as vscode from "vscode";
import * as http from "http";

export function activate(context: vscode.ExtensionContext) {
  console.log("Loaded Zotero for Typst");

  let disposable = vscode.commands.registerCommand(
    "zotero-for-typst.pickCitation",
    () => {
      let config = vscode.workspace.getConfiguration("zoteroForTypst");
      let host = config.get("host");
      let port = config.get("port");
      let url =
        `http://${host}:${port}/better-bibtex/cayw?format=playground` +
        `&citeprefix=${encodeURIComponent("#cite(")}` +
        `&citepostfix=${encodeURIComponent(")")}` +
        `&keyprefix=${encodeURIComponent('"')}` +
        `&keypostfix=${encodeURIComponent('"')}` +
        `&separator=${encodeURIComponent(", ")}`;
      console.log(url);
      http
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            let editor = vscode.window.activeTextEditor;
            editor.edit((edit) =>
              editor.selections.forEach((selection) =>
                edit.replace(selection, data)
              )
            );
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
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
