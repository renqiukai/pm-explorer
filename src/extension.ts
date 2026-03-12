import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { getWorkspaceConfig } from "./config/workspaceConfig";
import { DocTreeProvider } from "./providers/DocTreeProvider";
import { FileNode } from "./models/FileNode";
import { openNode } from "./services/openService";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const provider = new DocTreeProvider();
  await provider.initialize();

  const treeView = vscode.window.createTreeView("pmExplorerView", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    treeView,
    vscode.commands.registerCommand("pmExplorer.refresh", async () => {
      await provider.refresh();
    }),
    vscode.commands.registerCommand("pmExplorer.openNode", async (node?: FileNode) => {
      if (!node) {
        return;
      }

      await openNode(node);
    }),
    vscode.commands.registerCommand("pmExplorer.copyPath", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      await vscode.env.clipboard.writeText(node.fullPath);
      void vscode.window.showInformationMessage("Path copied");
    }),
    vscode.commands.registerCommand("pmExplorer.copyName", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      await vscode.env.clipboard.writeText(path.basename(node.fullPath));
      void vscode.window.showInformationMessage("Name copied");
    }),
    vscode.commands.registerCommand("pmExplorer.copyRelativePath", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      const relativePath = toWorkspaceRelativePath(node.fullPath);
      await vscode.env.clipboard.writeText(relativePath);
      void vscode.window.showInformationMessage("Relative path copied");
    }),
    vscode.commands.registerCommand("pmExplorer.copyMarkdownLink", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      const relativePath = toWorkspaceRelativePath(node.fullPath);
      const label = path.basename(node.fullPath);
      await vscode.env.clipboard.writeText(`[${label}](${relativePath})`);
      void vscode.window.showInformationMessage("Markdown link copied");
    }),
    vscode.commands.registerCommand("pmExplorer.renameNode", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      const currentName = path.basename(node.fullPath);
      const nextName = await vscode.window.showInputBox({
        prompt: "Rename item",
        value: currentName,
        validateInput: (value) => validateFileName(value, currentName),
      });

      if (!nextName || nextName === currentName) {
        return;
      }

      const nextPath = path.join(path.dirname(node.fullPath), nextName);
      await fs.rename(node.fullPath, nextPath);
      await provider.refresh();
      void vscode.window.showInformationMessage(`Renamed to ${nextName}`);
    }),
    vscode.commands.registerCommand("pmExplorer.duplicateNode", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      const duplicatePath = await buildDuplicatePath(node.fullPath);
      await fs.cp(node.fullPath, duplicatePath, { recursive: true, errorOnExist: true });
      await provider.refresh();
      void vscode.window.showInformationMessage(`Duplicated as ${path.basename(duplicatePath)}`);
    }),
    vscode.commands.registerCommand("pmExplorer.newFile", async (node?: FileNode) => {
      const targetDirectory = await resolveTargetDirectory(node);
      if (!targetDirectory) {
        return;
      }

      const defaultFileName = renderTemplate(getWorkspaceConfig().newFileNameTemplate);

      const fileName = await vscode.window.showInputBox({
        prompt: "New file name",
        value: defaultFileName,
        validateInput: (value) => validateFileName(value, ""),
      });

      if (!fileName) {
        return;
      }

      const targetPath = path.join(targetDirectory, fileName.trim());
      if (await pathExists(targetPath)) {
        void vscode.window.showErrorMessage("A file or folder with the same name already exists.");
        return;
      }

      await fs.writeFile(targetPath, "", "utf8");
      await provider.refresh();
      void vscode.window.showInformationMessage(`Created file ${fileName.trim()}`);
    }),
    vscode.commands.registerCommand("pmExplorer.newFolder", async (node?: FileNode) => {
      const targetDirectory = await resolveTargetDirectory(node);
      if (!targetDirectory) {
        return;
      }

      const folderName = await vscode.window.showInputBox({
        prompt: "New folder name",
        validateInput: (value) => validateFileName(value, ""),
      });

      if (!folderName) {
        return;
      }

      const targetPath = path.join(targetDirectory, folderName.trim());
      if (await pathExists(targetPath)) {
        void vscode.window.showErrorMessage("A file or folder with the same name already exists.");
        return;
      }

      await fs.mkdir(targetPath, { recursive: false });
      await provider.refresh();
      void vscode.window.showInformationMessage(`Created folder ${folderName.trim()}`);
    }),
    vscode.commands.registerCommand("pmExplorer.deleteNode", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      const itemType = await getItemType(node.fullPath);
      const choice = await vscode.window.showWarningMessage(
        `Delete ${itemType} "${path.basename(node.fullPath)}"?`,
        { modal: true },
        "Delete",
      );

      if (choice !== "Delete") {
        return;
      }

      await fs.rm(node.fullPath, { recursive: true, force: false });
      await provider.refresh();
      void vscode.window.showInformationMessage(`${itemType} deleted`);
    }),
    vscode.commands.registerCommand("pmExplorer.revealInFinder", async (node?: FileNode) => {
      if (!node?.fullPath) {
        return;
      }

      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(node.fullPath));
    }),
    vscode.commands.registerCommand("pmExplorer.openInTerminal", async (node?: FileNode) => {
      const targetDirectory = await resolveTargetDirectory(node);
      if (!targetDirectory) {
        return;
      }

      const terminal = vscode.window.createTerminal({
        name: "PM Explorer",
        cwd: targetDirectory,
      });
      terminal.show();
    }),
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration("pmExplorer")) {
        await provider.refresh();
      }
    }),
  );
}

export function deactivate(): void {}

function validateFileName(value: string, currentName: string): string | undefined {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "File name cannot be empty.";
  }

  if (trimmed === currentName) {
    return undefined;
  }

  if (/[\\/:\*\?"<>\|]/.test(trimmed)) {
    return "File name contains invalid characters.";
  }

  return undefined;
}

async function resolveTargetDirectory(node?: FileNode): Promise<string | undefined> {
  if (!node?.fullPath) {
    return undefined;
  }

  const stats = await fs.stat(node.fullPath);
  return stats.isDirectory() ? node.fullPath : path.dirname(node.fullPath);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getItemType(targetPath: string): Promise<"file" | "folder"> {
  const stats = await fs.stat(targetPath);
  return stats.isDirectory() ? "folder" : "file";
}

async function buildDuplicatePath(sourcePath: string): Promise<string> {
  const directory = path.dirname(sourcePath);
  const parsed = path.parse(sourcePath);
  const baseName = parsed.ext ? parsed.name : parsed.base;
  const extension = parsed.ext;

  let counter = 1;
  while (true) {
    const suffix = counter === 1 ? " copy" : ` copy ${counter}`;
    const candidate = path.join(directory, `${baseName}${suffix}${extension}`);
    if (!(await pathExists(candidate))) {
      return candidate;
    }
    counter += 1;
  }
}

function toWorkspaceRelativePath(fullPath: string): string {
  const folders = vscode.workspace.workspaceFolders ?? [];
  for (const folder of folders) {
    const folderPath = folder.uri.fsPath;
    if (fullPath === folderPath || fullPath.startsWith(`${folderPath}${path.sep}`)) {
      return path.relative(folderPath, fullPath) || path.basename(fullPath);
    }
  }

  return fullPath;
}

function renderTemplate(template: string, now: Date = new Date()): string {
  const YYYY = String(now.getFullYear());
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return template
    .replaceAll("YYYYMMDD", `${YYYY}${MM}${DD}`)
    .replaceAll("YYYY", YYYY)
    .replaceAll("MM", MM)
    .replaceAll("DD", DD)
    .replaceAll("HH", HH)
    .replaceAll("mm", mm)
    .replaceAll("ss", ss);
}
