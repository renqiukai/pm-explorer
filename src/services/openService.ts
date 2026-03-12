import * as path from "path";
import * as vscode from "vscode";
import { getWorkspaceConfig } from "../config/workspaceConfig";
import { FileNode } from "../models/FileNode";

export async function openNode(node: FileNode): Promise<void> {
  if (!node.resourceUri && !node.fullPath) {
    return;
  }

  const uri = node.resourceUri ?? vscode.Uri.file(node.fullPath!);
  const extension = path.extname(uri.fsPath).toLowerCase();
  const config = getWorkspaceConfig();
  const externalOpenExtensions = new Set(config.externalOpenExtensions);

  if (externalOpenExtensions.has(extension)) {
    await vscode.env.openExternal(uri);
    return;
  }

  await vscode.commands.executeCommand("vscode.open", uri);
}
