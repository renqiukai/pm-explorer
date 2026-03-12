# PM Explorer Usage Guide

本文档说明如何安装、运行、配置和使用 `PM Explorer`。

## 1. 插件作用

`PM Explorer` 是一个 VS Code 插件，用来在侧边栏里按项目文档视角浏览和管理文件，而不是只按物理目录查看资源。

当前版本支持：

- 按项目根目录展示文档树
- 按分类目录组织文档
- 聚合最近更新文件
- 配置文件打开方式
- 配置文件排序方式
- 新建文件时使用默认命名模板
- 在树节点右键执行常见文件操作

## 2. 开发态运行

如果你在开发这个插件，推荐先用开发态运行。

### 安装依赖

```bash
npm install
```

### 编译项目

```bash
npm run compile
```

### 启动扩展调试

1. 用 VS Code 打开当前项目。
2. 按 `F5`。
3. VS Code 会打开一个新的 `Extension Development Host` 窗口。
4. 在新窗口左侧 Activity Bar 中找到 `PM Explorer`。

如果视图正常显示，说明插件已经加载成功。

## 3. 打包和安装

### 手动打包

```bash
npx @vscode/vsce package
```

执行后会在项目根目录生成 `.vsix` 文件，例如：

```text
pm-explorer-0.0.10.vsix
```

### 手动安装

```bash
code --install-extension pm-explorer-0.0.10.vsix --force
```

### 自动升版本并安装

项目里已经提供了脚本：

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

这些脚本会自动完成：

1. 升级版本号
2. 打包 `.vsix`
3. 安装到本机 VS Code

如果你只想安装当前版本对应的 `.vsix`，可以执行：

```bash
npm run install:vsix
```

## 4. 基本配置

插件通过当前 workspace 的 `.vscode/settings.json` 控制行为。

示例：

```json
{
  "pmExplorer.rootPaths": ["docs"],
  "pmExplorer.categories": ["Overview", "Plans", "Documents", "Meetings"],
  "pmExplorer.recentUpdatesLimit": 10,
  "pmExplorer.excludePatterns": [".git", "node_modules"],
  "pmExplorer.externalOpenExtensions": [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"],
  "pmExplorer.fileSort": "modifiedTimeDesc",
  "pmExplorer.newFileNameTemplate": "meeting_YYYYMMDD.md"
}
```

## 5. 配置项说明

### `pmExplorer.rootPaths`

要扫描的根目录列表。

- 类型：`string[]`
- 默认值：`[]`
- 说明：如果为空，插件会回退到当前 workspace 根目录

示例：

```json
{
  "pmExplorer.rootPaths": ["docs", "projects/project-alpha"]
}
```

### `pmExplorer.categories`

分类名称及显示顺序。

- 类型：`string[]`
- 默认值：`["Overview", "Plans", "Documents", "Meetings"]`

它的作用是控制分类节点排序，不是筛选规则。配置里没出现的目录不会消失，只会排在后面。

### `pmExplorer.recentUpdatesLimit`

最近更新文件的展示数量。

- 类型：`number`
- 默认值：`10`

### `pmExplorer.excludePatterns`

扫描时忽略的目录名。

- 类型：`string[]`
- 默认值：`[".git", "node_modules"]`

### `pmExplorer.externalOpenExtensions`

哪些文件类型需要调用系统默认程序打开。

- 类型：`string[]`
- 默认值：`[".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"]`

支持带点或不带点写法，插件会自动规范化。

示例：

```json
{
  "pmExplorer.externalOpenExtensions": [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"]
}
```

### `pmExplorer.fileSort`

文件节点和 `Recent Updates` 的排序方式。

- 类型：`string`
- 默认值：`"modifiedTimeDesc"`

可选值：

- `modifiedTimeDesc`
- `modifiedTimeAsc`
- `nameAsc`
- `nameDesc`

示例：

```json
{
  "pmExplorer.fileSort": "nameAsc"
}
```

### `pmExplorer.newFileNameTemplate`

新建文件时输入框里的默认文件名模板。

- 类型：`string`
- 默认值：`"note_YYYYMMDD.md"`

支持这些占位符：

- `YYYY`
- `MM`
- `DD`
- `HH`
- `mm`
- `ss`
- `YYYYMMDD`

示例：

```json
{
  "pmExplorer.newFileNameTemplate": "meeting_YYYYMMDD.md"
}
```

如果当前日期是 2026-03-12，默认值会展开成：

```text
meeting_20260312.md
```

## 6. 推荐目录结构

推荐文档目录尽量接近下面这种形式：

```text
docs/
├── Overview/
│   └── intro.md
├── Plans/
│   └── roadmap.md
├── Documents/
│   ├── prd.md
│   └── proposal.pdf
└── Meetings/
    └── weekly-notes.md
```

这种结构最适合当前版本的分类扫描逻辑。

## 7. 打开和排序规则

### 打开规则

- `pmExplorer.externalOpenExtensions` 中声明的类型：调用系统默认程序打开
- 其他文件：默认在 VS Code 中打开

### 排序规则

当前版本默认行为：

- 项目：按名称排序
- 分类：优先按 `pmExplorer.categories` 指定顺序排序
- 文件：按 `pmExplorer.fileSort` 排序

注意：

`Recent Updates` 当前也使用 `pmExplorer.fileSort`。如果你把它改成 `nameAsc`，最近更新视图也会按名字排，而不是按时间排。

## 8. 日常使用流程

一个最小可用流程如下：

1. 在 workspace 中准备文档目录，例如 `docs/`。
2. 在 `.vscode/settings.json` 中设置 `pmExplorer.rootPaths`。
3. 打开左侧 `PM Explorer` 视图。
4. 展开项目节点和分类节点。
5. 点击文件节点打开文件。
6. 需要更新时执行 `PM Explorer: Refresh`。

## 9. 右键菜单

在 `PM Explorer` 视图中，对文件或目录点击右键，可以看到快捷菜单。

文件和目录都支持：

- `Copy Path`
- `Copy Name`
- `Copy Relative Path`
- `Copy Markdown Link`
- `Rename`
- `Duplicate`
- `Delete`
- `Reveal in Finder`
- `Open in Terminal`

目录额外支持：

- `New File`
- `New Folder`

行为说明：

- `Delete` 会弹二次确认
- `Duplicate` 会自动生成不冲突的新名称，例如 `report copy.md`
- `Open in Terminal` 会在当前目录打开 VS Code 终端
- `Reveal in Finder` 在 macOS 上对应 Finder，在其他系统上会调用对应文件管理器

## 10. 常见问题

### 视图没有显示

检查：

1. 插件是否已安装或已通过 `F5` 启动
2. 当前窗口是否打开了一个 workspace
3. 左侧 Activity Bar 是否有 `PM Explorer`

### 显示 `No documents found`

检查：

1. `pmExplorer.rootPaths` 是否正确
2. 这些路径是否真实存在
3. 路径是否相对于当前 workspace
4. 是否被 `excludePatterns` 排除了

### 点击 Office 文件没有用系统程序打开

检查：

1. 该扩展名是否写入 `pmExplorer.externalOpenExtensions`
2. 系统是否安装了该类型的默认打开程序

### 修改配置后没有更新

可以执行命令：

```text
PM Explorer: Refresh
```

如果还是不更新，重新加载窗口再试一次。

### 右键菜单看不到

检查：

1. 你右键的是 `PM Explorer` 视图里的节点，不是 VS Code 自带资源管理器
2. 当前安装的是不是最新版本插件
3. 是否已经重新加载窗口或重新安装 `.vsix`

## 11. 当前状态

当前项目已经具备可编译、可打包、可安装、可实际操作文件的 MVP 版本。

后续适合继续增强的方向：

- `Move`
- `Move to Trash`
- 更强的分类映射规则
- 更独立的 `Recent Updates` 排序配置
- 更丰富的上下文菜单
