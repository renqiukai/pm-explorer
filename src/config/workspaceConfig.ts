import * as path from "path";
import * as vscode from "vscode";

export type FileSortMode = "modifiedTimeDesc" | "modifiedTimeAsc" | "nameAsc" | "nameDesc";

export interface WorkspaceConfig {
  rootPaths: string[];
  categories: string[];
  excludePatterns: string[];
  externalOpenExtensions: string[];
  fileSort: FileSortMode;
  newFileNameTemplate: string;
}

const CONFIG_SECTION = "pmExplorer";

export function getWorkspaceConfig(): WorkspaceConfig {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const folders = vscode.workspace.workspaceFolders ?? [];

  const configuredRoots = config.get<string[]>("rootPaths", []);
  const rootPaths = configuredRoots.length > 0
    ? configuredRoots
    : folders.map((folder) => folder.uri.fsPath);

  return {
    rootPaths: rootPaths.map((rootPath) => normalizeWorkspacePath(rootPath)),
    categories: config.get<string[]>("categories", ["Overview", "Plans", "Documents", "Meetings"]),
    excludePatterns: config.get<string[]>("excludePatterns", [".git", "node_modules"]),
    externalOpenExtensions: normalizeExtensions(
      config.get<string[]>("externalOpenExtensions", [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"]),
    ),
    fileSort: normalizeFileSort(config.get<string>("fileSort", "modifiedTimeDesc")),
    newFileNameTemplate: config.get<string>("newFileNameTemplate", "note_YYYYMMDD.md"),
  };
}

function normalizeWorkspacePath(inputPath: string): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return inputPath;
  }

  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(folder.uri.fsPath, inputPath);
}

function normalizeExtensions(extensions: string[]): string[] {
  return extensions.map((extension) => {
    const normalized = extension.trim().toLowerCase();
    if (normalized.length === 0) {
      return normalized;
    }

    return normalized.startsWith(".") ? normalized : `.${normalized}`;
  }).filter((extension) => extension.length > 1);
}

function normalizeFileSort(fileSort: string): FileSortMode {
  const supported: FileSortMode[] = [
    "modifiedTimeDesc",
    "modifiedTimeAsc",
    "nameAsc",
    "nameDesc",
  ];

  return supported.includes(fileSort as FileSortMode)
    ? (fileSort as FileSortMode)
    : "modifiedTimeDesc";
}
