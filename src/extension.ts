import * as vscode from "vscode";
import * as http from "http";

export function activate(context: vscode.ExtensionContext) {
  console.log("Loaded Zotero for Typst");

  let disposable = vscode.commands.registerCommand(
    "zotero-for-typst.pickCitation",
    () => {
      let url =
        "http://127.0.0.1:23119/better-bibtex/cayw?format=playground" +
        `&citeprefix=${encodeURIComponent("#cite(")}` +
        `&citepostfix=${encodeURIComponent(")")}` +
        `&keyprefix=${encodeURIComponent('"')}` +
        `&keypostfix=${encodeURIComponent('"')}` +
        `&separator=${encodeURIComponent(", ")}`;
      console.log(url);
      http.get(url, (res) => {
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
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
