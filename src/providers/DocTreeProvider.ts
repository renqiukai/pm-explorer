import * as vscode from "vscode";
import { getWorkspaceConfig } from "../config/workspaceConfig";
import { FileNode } from "../models/FileNode";
import { buildTree } from "../services/scanService";

export class DocTreeProvider implements vscode.TreeDataProvider<FileNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<FileNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
  private rootNodes: FileNode[] = [];

  async initialize(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const config = getWorkspaceConfig();
    this.rootNodes = await buildTree(config);
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: FileNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileNode): vscode.ProviderResult<FileNode[]> {
    if (element) {
      return element.children;
    }

    if (this.rootNodes.length > 0) {
      return this.rootNodes;
    }

    return [
      new FileNode({
        type: "info",
        label: "No documents found",
        description: "Configure pmExplorer.rootPaths in this workspace",
      }),
    ];
  }
}
