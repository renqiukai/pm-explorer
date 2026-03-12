# PM Explorer Usage Guide

本文档说明如何在本地运行、安装和使用 `PM Explorer`。

## 1. 插件作用

`PM Explorer` 是一个 VS Code 插件，用来在侧边栏里按项目管理视角浏览文档，而不是只按物理目录查看文件。

当前版本支持：

- 按项目根目录展示文档树
- 按分类目录展示文件
- 聚合最近更新文件
- 根据文件类型选择打开方式
- 使用 workspace 级配置控制行为

## 2. 开发态运行

如果你正在开发这个插件，推荐先用开发态运行。

### 安装依赖

在项目根目录执行：

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
4. 在这个新窗口左侧 Activity Bar 中找到 `PM Explorer`。

如果视图正常显示，说明插件已经被成功加载。

## 3. 本地安装到正式环境

如果你想在自己的 VS Code 里长期使用，而不是每次都通过 `F5` 调试，可以安装 `.vsix` 包。

### 生成安装包

项目根目录执行：

```bash
npx @vscode/vsce package
```

执行完成后，根目录会生成类似下面的文件：

```text
pm-explorer-0.0.1.vsix
```

### 安装 `.vsix`

在 VS Code 中：

1. 打开 Extensions 面板
2. 点击右上角 `...`
3. 选择 `Install from VSIX...`
4. 选择生成的 `.vsix` 文件

安装完成后重新加载 VS Code。

## 4. 基本配置

插件通过当前 workspace 的设置控制行为。

你可以在工作区的 `.vscode/settings.json` 中写入：

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

### 配置项说明

#### `pmExplorer.rootPaths`

要扫描的根目录列表。

- 类型：`string[]`
- 默认值：`[]`
- 说明：如果为空，插件会回退到当前 workspace 文件夹

示例：

```json
{
  "pmExplorer.rootPaths": ["docs", "projects/project-alpha"]
}
```

#### `pmExplorer.categories`

分类名称及显示顺序。

- 类型：`string[]`
- 默认值：`["Overview", "Plans", "Documents", "Meetings"]`

示例：

```json
{
  "pmExplorer.categories": ["Overview", "PRD", "Meetings", "Reports"]
}
```

#### `pmExplorer.recentUpdatesLimit`

最近更新文件的显示数量。

- 类型：`number`
- 默认值：`10`

示例：

```json
{
  "pmExplorer.recentUpdatesLimit": 20
}
```

#### `pmExplorer.excludePatterns`

扫描时需要忽略的目录名。

- 类型：`string[]`
- 默认值：`[".git", "node_modules"]`

示例：

```json
{
  "pmExplorer.excludePatterns": [".git", "node_modules", "dist", "tmp"]
}
```

#### `pmExplorer.externalOpenExtensions`

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

#### `pmExplorer.fileSort`

文件节点和 `Recent Updates` 的排序方式。

- 类型：`string`
- 默认值：`"modifiedTimeDesc"`

可选值：

- `modifiedTimeDesc`：按修改时间倒序
- `modifiedTimeAsc`：按修改时间正序
- `nameAsc`：按文件名升序
- `nameDesc`：按文件名降序

示例：

```json
{
  "pmExplorer.fileSort": "nameAsc"
}
```

#### `pmExplorer.newFileNameTemplate`

新建文件时输入框里的默认文件名模板。

- 类型：`string`
- 默认值：`"note_YYYYMMDD.md"`

支持的占位符：

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

如果当前日期是 2026 年 3 月 12 日，那么默认值会展开成：

```text
meeting_20260312.md
```

## 5. 推荐目录示例

建议你的文档目录尽量接近下面这种结构：

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

在这个结构下，插件会更容易生成稳定清晰的树。

## 6. 当前打开行为

当前版本按文件扩展名决定打开方式：

- `pmExplorer.externalOpenExtensions` 中声明的类型：调用系统外部程序打开
- 其他文件：默认在 VS Code 中打开

文件排序则由 `pmExplorer.fileSort` 控制。

这意味着：

- 常规文本和可预览文件默认交给 VS Code
- Office 文件适合交给系统默认应用处理

## 7. 使用步骤

一个最小可用流程如下：

1. 在 workspace 中准备文档目录，例如 `docs/`。
2. 在 `.vscode/settings.json` 中设置 `pmExplorer.rootPaths`。
3. 打开 VS Code 左侧的 `PM Explorer`。
4. 展开项目节点和分类节点。
5. 点击文件节点打开文件。
6. 如有目录或配置变化，执行 `PM Explorer: Refresh` 刷新视图。

### 右键快捷菜单

在文件节点上点击右键，可以使用这些快捷功能：

- `Copy Path`：复制文件完整路径
- `Rename`：直接重命名文件
- `Reveal in Finder`：在系统文件管理器中显示文件

其中 `Reveal in Finder` 在 macOS 上会显示为 Finder 行为，在其他系统上会调用对应平台的文件管理器。

## 8. 常见问题

### 视图没有显示

排查顺序：

1. 确认插件已安装或已通过 `F5` 启动
2. 确认左侧 Activity Bar 中存在 `PM Explorer`
3. 确认当前窗口打开的是一个 workspace

### 显示 `No documents found`

说明插件没有扫描到可展示内容。

检查：

1. `pmExplorer.rootPaths` 是否正确
2. 路径是否相对于当前 workspace
3. 对应目录是否真实存在
4. 目录是否被 `excludePatterns` 排除了

### 点击文件没有反应

检查：

1. 文件是否真实存在
2. 系统是否安装了对应文件类型的默认打开程序
3. 是否有权限访问该文件

### 修改配置后没有更新

可以手动执行命令：

```text
PM Explorer: Refresh
```

如果还是不更新，重新加载窗口再试一次。

## 9. 当前版本说明

当前项目已经具备基础工程结构和最小可运行能力，但仍然属于 MVP 阶段。

现阶段重点是：

- 验证文档树展示
- 验证配置是否生效
- 验证最近更新聚合
- 验证不同文件类型的打开策略

后续可以继续增强：

- 更严格的分类映射规则
- 更灵活的排序策略
- 自定义分组视图
- 更丰富的上下文菜单
