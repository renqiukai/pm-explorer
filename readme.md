# PM Explorer

一个面向项目文档管理的 VS Code 插件。

它的目标不是替代系统文件管理器，而是在 VS Code 里提供一套更贴近项目管理场景的文档视图，让用户可以按“项目 / 分类 / 最近更新”来查看和打开资料，而不是只能按物理目录硬看文件夹。

## 需求理解

从当前草稿来看，这个插件要解决的是下面几个实际问题：

1. 项目资料很多，目录层级深，普通资源管理器不适合快速定位文档。
2. 不同层级的内容需要不同排序方式，不能只按统一规则展示。
3. 不同文件类型应该有不同打开策略，例如 Markdown 在 VS Code 内打开，Office 文件走外部程序。
4. 需要一个“最近更新”视图，帮助用户快速看到最新修改过的文档。
5. 配置应该绑定到当前 workspace，而不是影响全局。

换句话说，这个插件的核心诉求是：

在 VS Code 中提供一个适合 PM / 项目协作场景的文档导航面板。

## 核心功能

### 1. 文档树导航

在侧边栏展示一棵自定义文档树，而不是简单映射本地文件系统。

示例：

```text
Project Alpha
├── Overview
├── Plans
├── Documents
├── Meetings
└── Recent Updates
```

这个树可以基于约定目录、配置规则或扫描结果生成，重点是让“项目内容结构”更清晰，而不是只展示原始路径。

### 2. 分层排序

不同层级使用不同排序规则。

建议规则：

- Level 1：项目，按名称排序
- Level 2：文档分类，按名称排序
- Level 3：具体文件，按修改时间倒序排序

这样可以同时满足结构稳定和内容追新两个目标。

### 3. 文档打开策略

根据文件类型选择不同打开方式。

建议策略：

| 文件类型 | 打开方式 |
| --- | --- |
| `.md` | 在 VS Code 内打开 |
| `.pdf` | 支持 VS Code 内打开，必要时走外部程序 |
| `.doc` / `.docx` | 外部程序打开 |
| `.ppt` / `.pptx` | 外部程序打开 |

实现上可以区分：

- `vscode.window.showTextDocument`
- `vscode.commands.executeCommand('vscode.open', uri)`
- `vscode.env.openExternal(uri)`

### 4. 最近更新文档

提供一个自动聚合节点，例如 `Recent Updates`，集中展示最近修改过的文件。

示例：

```text
Recent Updates
├── proposal_v3.pptx
├── meeting_notes.md
└── requirement.docx
```

这个能力对日常工作价值很高，因为用户通常更关心“刚刚改过什么”，而不是“这个文件原来放在哪个目录”。

### 5. 工作区级配置

所有规则只对当前 workspace 生效。

适合配置的内容包括：

- 项目根目录
- 需要展示的分类
- 排序规则
- 最近更新数量
- 文件类型与打开方式映射
- 是否隐藏某些目录或文件

这意味着插件应该优先使用 workspace configuration，而不是全局 configuration。

## 产品边界

这个项目更像“文档导航增强器”，不是完整的知识库系统，所以建议先把范围收紧到 MVP：

- 展示自定义文档树
- 支持分层排序
- 支持不同文件类型的打开策略
- 支持最近更新聚合
- 支持 workspace 级配置

先不要一开始就做：

- 在线协同
- 文档内容检索
- 云端同步
- 权限系统
- 富编辑器能力

## 技术方案

### 基础框架

使用 VS Code Extension API。

核心能力主要来自：

- `TreeDataProvider`
- `TreeItem`
- `window.createTreeView`
- `commands.registerCommand`
- `workspace.getConfiguration`

### 开发语言

TypeScript。

原因很直接：

- VS Code 扩展开发主流方案就是 TypeScript
- API 类型提示完整
- 维护成本低

### Node API

需要用到的基础能力：

- `fs`
- `path`

主要用途：

- 扫描目录结构
- 判断文件类型
- 获取文件修改时间
- 生成树节点数据

### VS Code 打开能力

不同文件类型对应不同命令：

- 文本类文件：直接在 VS Code 中打开
- 二进制或 Office 文件：通过 `vscode.env.openExternal` 调起系统默认程序

## 推荐目录结构

如果按一个标准 VS Code 扩展来实现，建议结构如下：

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
├── package.json
├── tsconfig.json
└── readme.md
```

这样拆分的好处是：

- `provider` 负责树展示
- `service` 负责扫描、排序、打开逻辑
- `config` 负责配置读取
- `model` 负责统一节点数据结构

## 一个合理的 MVP 实现顺序

1. 搭建基础扩展框架，注册侧边栏视图。
2. 实现目录扫描和树节点渲染。
3. 加入分层排序规则。
4. 实现按文件类型打开。
5. 增加 `Recent Updates` 聚合节点。
6. 接入 workspace 配置。

这个顺序比较稳，能尽快跑出第一个可用版本。

## 总结

你的需求本质上很清晰：做一个面向项目文档管理的 VS Code 插件，让用户在一个更符合工作流的视图里浏览、排序和打开文档。

如果继续往下开发，这份 README 已经可以作为产品定义和第一版技术设计说明使用。下一步最自然的动作，就是基于这里的结构开始初始化扩展工程，并把 MVP 跑起来。
