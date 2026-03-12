# PM Explorer

一个面向项目文档管理场景的 VS Code 插件。

它的目标不是替代系统文件管理器，而是在 VS Code 里提供一套更贴近 PM / 项目协作工作流的文档视图，让用户可以按“项目 / 分类 / 最近更新”来查看、打开和管理资料，而不是只能按物理目录浏览文件。

相关使用说明见 [USAGE.md](/Users/renqiukai/env/pm-explorer/USAGE.md)。

## 这个插件要解决什么问题

从需求上看，这个插件主要解决下面几类实际问题：

1. 项目资料很多，目录层级深，默认资源管理器不适合快速定位文档。
2. 不同层级的内容需要不同排序规则，不能只按统一规则展示。
3. 不同文件类型应该有不同打开策略，例如 Office 文件走系统默认程序。
4. 需要一个 `Recent Updates` 视图，帮助用户快速看到最近变更的文件。
5. 文档操作希望集中在树视图里完成，包括复制路径、重命名、新建和删除。
6. 配置应该绑定到当前 workspace，而不是影响全局。

一句话概括：

在 VS Code 里做一个适合项目文档管理和轻量文件操作的侧边栏视图。

## 当前能力

### 文档树导航

插件会在侧边栏提供一个 `PM Explorer` 视图，用自定义树结构展示项目文档。

典型结构如下：

```text
Project Alpha
├── Overview
├── Plans
├── Documents
├── Meetings
└── Recent Updates
```

### 分类排序

当前排序策略是：

- 项目节点：按名称排序
- 分类节点：优先按 `pmExplorer.categories` 指定顺序排序，不在配置里的分类排在后面
- 文件节点：按 `pmExplorer.fileSort` 排序
- `Recent Updates`：同样按 `pmExplorer.fileSort` 排序后截取前 N 条

### 文件打开策略

当前规则比较简单：

- `pmExplorer.externalOpenExtensions` 中声明的类型：调用系统默认程序打开
- 其他文件：默认交给 VS Code 打开

这意味着 `.docx`、`.pptx`、`.xlsx` 之类文件可以交给 Office / WPS，而 Markdown、文本、JSON 等继续由 VS Code 处理。

### 最近更新聚合

每个项目根目录下会自动生成一个 `Recent Updates` 节点，用来展示最近修改过的文件。

### 工作区级配置

插件所有行为都优先使用 workspace 配置控制，适合项目内定制，不会默认污染全局设置。

### 右键快捷操作

现在已经支持在树节点上直接做一些常见文件操作。

对文件和目录都支持：

- Copy Path
- Copy Name
- Copy Relative Path
- Copy Markdown Link
- Rename
- Duplicate
- Delete
- Reveal in Finder
- Open in Terminal

对目录节点额外支持：

- New File
- New Folder

## 当前配置项

当前支持这些核心配置：

- `pmExplorer.rootPaths`
- `pmExplorer.categories`
- `pmExplorer.recentUpdatesLimit`
- `pmExplorer.excludePatterns`
- `pmExplorer.externalOpenExtensions`
- `pmExplorer.fileSort`
- `pmExplorer.newFileNameTemplate`

其中 `pmExplorer.newFileNameTemplate` 支持日期占位符，例如：

```json
{
  "pmExplorer.newFileNameTemplate": "meeting_YYYYMMDD.md"
}
```

如果当前日期是 2026-03-12，默认文件名会展开成：

```text
meeting_20260312.md
```

## 技术实现

### 技术栈

- TypeScript
- VS Code Extension API
- Node.js `fs` / `path`

### 关键 API

- `TreeDataProvider`
- `TreeItem`
- `window.createTreeView`
- `commands.registerCommand`
- `workspace.getConfiguration`
- `vscode.env.openExternal`

### 目录结构

```text
pm-explorer/
├── src/
│   ├── extension.ts
│   ├── providers/
│   │   └── DocTreeProvider.ts
│   ├── models/
│   │   └── FileNode.ts
│   ├── services/
│   │   ├── scanService.ts
│   │   ├── sortService.ts
│   │   └── openService.ts
│   └── config/
│       └── workspaceConfig.ts
├── media/
├── package.json
├── tsconfig.json
├── readme.md
└── USAGE.md
```

职责划分：

- `providers`：树视图数据提供
- `services`：扫描、排序、打开等业务逻辑
- `config`：workspace 配置读取与规范化
- `models`：统一节点模型

## 当前边界

这个项目现在更像“文档导航增强器 + 轻量文件操作面板”，还不是完整的文档管理平台。

当前已经覆盖：

- 自定义文档树
- 最近更新视图
- 可配置排序
- 可配置外部打开类型
- 基础文件操作
- workspace 级配置

当前还没有做：

- 全文检索
- 标签系统
- 云端同步
- 权限系统
- 拖拽移动
- 回收站 / Trash 模式

## 开发状态

当前工程已经具备：

- 可编译的 VS Code 扩展骨架
- 可打包安装的 `.vsix`
- 自动升版本和安装脚本

常用命令见 [USAGE.md](/Users/renqiukai/env/pm-explorer/USAGE.md)。
