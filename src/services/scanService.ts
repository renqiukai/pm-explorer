import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { WorkspaceConfig } from "../config/workspaceConfig";
import { FileNode } from "../models/FileNode";
import { sortCategories, sortFiles, sortProjects } from "./sortService";

interface ScannedFile {
  label: string;
  fullPath: string;
  resourceUri: vscode.Uri;
  modifiedAt: number;
}

export async function buildTree(config: WorkspaceConfig): Promise<FileNode[]> {
  const projectNodes = await Promise.all(
    config.rootPaths.map((rootPath) => buildProjectNode(rootPath, config)),
  );

  const validProjects = projectNodes.filter((node): node is FileNode => node !== undefined);
  return sortProjects(validProjects);
}

async function buildProjectNode(rootPath: string, config: WorkspaceConfig): Promise<FileNode | undefined> {
  try {
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  const categoryNodes = await buildCategoryNodes(rootPath, config);
  const recentNode = await buildRecentUpdatesNode(rootPath, config);
  const children = sortCategories([...categoryNodes, recentNode], config.categories);

  return new FileNode({
    type: "project",
    label: path.basename(rootPath),
    fullPath: rootPath,
    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
    children,
    resourceUri: vscode.Uri.file(rootPath),
  });
}

async function buildCategoryNodes(rootPath: string, config: WorkspaceConfig): Promise<FileNode[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const visibleDirectories = entries.filter((entry) => entry.isDirectory() && !config.excludePatterns.includes(entry.name));

  const categoryNodes = await Promise.all(
    visibleDirectories.map(async (entry) => {
      const fullPath = path.join(rootPath, entry.name);
      const files = await scanFiles(fullPath, config.excludePatterns);
      const fileNodes = sortFiles(files, config.fileSort).map(
        (file) =>
          new FileNode({
            type: "file",
            label: file.label,
            fullPath: file.fullPath,
            resourceUri: file.resourceUri,
            description: toRelativePath(rootPath, file.fullPath),
          }),
      );

      return new FileNode({
        type: "category",
        label: entry.name,
        fullPath,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        children: fileNodes,
        resourceUri: vscode.Uri.file(fullPath),
      });
    }),
  );

  return categoryNodes;
}

async function buildRecentUpdatesNode(rootPath: string, config: WorkspaceConfig): Promise<FileNode> {
  const files = await scanFiles(rootPath, config.excludePatterns);
  const recentFiles = sortFiles(files, config.fileSort).slice(0, config.recentUpdatesLimit);

  return new FileNode({
    type: "recentRoot",
    label: "Recent Updates",
    fullPath: rootPath,
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    children: recentFiles.map(
      (file) =>
        new FileNode({
          type: "file",
          label: file.label,
          fullPath: file.fullPath,
          resourceUri: file.resourceUri,
          description: toRelativePath(rootPath, file.fullPath),
        }),
    ),
  });
}

async function scanFiles(rootPath: string, excludePatterns: string[]): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];
  await walkDirectory(rootPath, excludePatterns, results);
  return results;
}

async function walkDirectory(currentPath: string, excludePatterns: string[], results: ScannedFile[]): Promise<void> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      if (excludePatterns.includes(entry.name)) {
        return;
      }

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(fullPath, excludePatterns, results);
        return;
      }

      const stats = await fs.stat(fullPath);
      results.push({
        label: entry.name,
        fullPath,
        resourceUri: vscode.Uri.file(fullPath),
        modifiedAt: stats.mtimeMs,
      });
    }),
  );
}

function toRelativePath(rootPath: string, filePath: string): string {
  const relativePath = path.relative(rootPath, filePath);
  return relativePath.length > 0 ? relativePath : filePath;
}
