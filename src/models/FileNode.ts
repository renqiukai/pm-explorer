import * as vscode from "vscode";

export type FileNodeType = "project" | "category" | "file" | "recentRoot" | "info";

export interface FileNodeParams {
  type: FileNodeType;
  label: string;
  fullPath?: string;
  collapsibleState?: vscode.TreeItemCollapsibleState;
  children?: FileNode[];
  resourceUri?: vscode.Uri;
  description?: string;
}

export class FileNode extends vscode.TreeItem {
  public readonly type: FileNodeType;
  public readonly nodeLabel: string;
  public readonly fullPath?: string;
  public readonly children: FileNode[];

  constructor(params: FileNodeParams) {
    super(
      params.label,
      params.collapsibleState ?? vscode.TreeItemCollapsibleState.None,
    );

    this.type = params.type;
    this.nodeLabel = params.label;
    this.fullPath = params.fullPath;
    this.children = params.children ?? [];
    this.resourceUri = params.resourceUri;
    this.description = params.description;
    this.contextValue = params.type;

    if (params.type === "file" && params.resourceUri) {
      this.command = {
        command: "pmExplorer.openNode",
        title: "Open File",
        arguments: [this],
      };
    }
  }
}
