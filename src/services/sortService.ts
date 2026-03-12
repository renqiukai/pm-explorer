import { FileSortMode } from "../config/workspaceConfig";
import { FileNode } from "../models/FileNode";

export function sortProjects(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel));
}

export function sortCategories(nodes: FileNode[], preferredOrder: string[]): FileNode[] {
  const orderIndex = new Map(preferredOrder.map((name, index) => [name.toLowerCase(), index]));

  return [...nodes].sort((a, b) => {
    const aIndex = orderIndex.get(a.nodeLabel.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderIndex.get(b.nodeLabel.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return a.nodeLabel.localeCompare(b.nodeLabel);
  });
}

export function sortFiles<T extends { modifiedAt?: number; label: string }>(
  items: T[],
  mode: FileSortMode,
): T[] {
  return [...items].sort((a, b) => {
    switch (mode) {
      case "modifiedTimeAsc": {
        const delta = (a.modifiedAt ?? 0) - (b.modifiedAt ?? 0);
        return delta !== 0 ? delta : a.label.localeCompare(b.label);
      }
      case "nameAsc":
        return a.label.localeCompare(b.label);
      case "nameDesc":
        return b.label.localeCompare(a.label);
      case "modifiedTimeDesc":
      default: {
        const delta = (b.modifiedAt ?? 0) - (a.modifiedAt ?? 0);
        return delta !== 0 ? delta : a.label.localeCompare(b.label);
      }
    }
  });
}
