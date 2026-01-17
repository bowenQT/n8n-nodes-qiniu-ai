# n8n-nodes-qiniu-ai

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## 🇺🇸 English

[![npm version](https://img.shields.io/npm/v/n8n-nodes-qiniu-ai.svg)](https://www.npmjs.com/package/n8n-nodes-qiniu-ai)
[![n8n](https://img.shields.io/badge/n8n-community%20node-brightgreen)](https://n8n.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> n8n community node for [Qiniu Cloud AI SDK](https://github.com/bowenQT/qiniu-ai-sdk) - Integrate full-modal AI capabilities into your n8n workflows.

### ✨ Features

| Resource | Operations | Description |
|----------|-----------|-------------|
| **Chat** | Complete | Multi-model chat completion (Qwen, Claude, Gemini, GPT, DeepSeek, etc.) |
| **Image** | Generate, Edit | AI image generation and editing with multiple models |
| **Video** | Generate, Remix, Get Status | Video generation with Kling, Veo, Sora models |
| **Audio** | Text-to-Speech, Speech-to-Text | TTS and ASR capabilities |
| **Agent** | Execute | AI agent with built-in tools (Web Search, OCR, Image/Video Generation) and ReAct loop |
| **Tools** | Web Search, OCR | Utility tools with advanced filters (site, time, type) |

### 📦 Installation

#### Community Node (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-qiniu-ai` and click **Install**

#### Manual Installation

```bash
# In your n8n custom nodes directory
npm install n8n-nodes-qiniu-ai
```

### 🔧 Configuration

1. Create credentials in n8n:
   - Go to **Credentials** > **New**
   - Search for **Qiniu AI API**
   - Enter your API Key (obtain from [Qiniu Cloud Console](https://portal.qiniu.com))

2. (Optional) Custom Base URL for self-hosted deployments

### 📖 Usage Examples

#### Chat Completion

```
Resource: Chat
Operation: Complete
Model: claude-4.5-sonnet
Messages: [{"role": "user", "content": "Hello!"}]
```

#### Image Generation

```
Resource: Image
Operation: Generate
Model: kling-v2-1
Prompt: "A beautiful sunset over mountains"
Wait for Completion: true
```

#### Video Generation

```
Resource: Video
Operation: Generate
Model: kling-video-o1
Prompt: "A cat playing with a ball"
Aspect Ratio: 16:9
```

#### Image → Video Workflow

1. **Image Node**: Generate an image
2. **Video Node**: 
   - Set `First Frame Binary Property` to `data`
   - The image from the previous node will be used as the first frame

### 🎯 Supported Models

<details>
<summary><b>Chat Models</b></summary>

- Qwen: qwen3-235b-a22b, qwen3-max, qwen3-32b, qwen-turbo
- Claude: claude-4.5-sonnet, claude-4.5-opus, claude-4.0-sonnet, claude-3.7-sonnet
- Gemini: gemini-3.0-pro-preview, gemini-2.5-flash, gemini-2.5-pro
- DeepSeek: deepseek-r1, deepseek-v3, deepseek-v3.1
- GPT: openai/gpt-5, openai/gpt-5.2
- Others: doubao-seed-1.6, glm-4.5, kimi-k2, minimax-m2
</details>

<details>
<summary><b>Image Models</b></summary>

- Kling: kling-v2-1, kling-v2, kling-v1-5
- Gemini: gemini-3.0-pro-image-preview, gemini-2.5-flash-image
- Others: doubao-1.5-vision-pro, qwen2.5-vl-72b-instruct
</details>

<details>
<summary><b>Video Models</b></summary>

- Kling: kling-video-o1, kling-v2-1, kling-v2-5-turbo
- Veo: veo-3.1-generate-preview, veo-3.0-generate-preview, veo-2.0-generate-001
- Others: sora-2, minimax-m2, mimo-v2-flash
</details>

### 💾 Persistent Memory (Multi-turn Conversations)

For conversation memory that persists across workflow executions, use n8n's built-in Memory nodes:

```
┌─────────────────────┐     ┌──────────────────┐
│ Redis/Postgres      │────▶│ Qiniu AI Agent   │
│ Chat Memory Node    │     │ (threadId link)  │
└─────────────────────┘     └──────────────────┘
```

**Setup:**
1. Add **Redis Chat Memory** or **Postgres Chat Memory** node before the Agent
2. Configure the Memory node with your database credentials
3. In the Qiniu AI Agent node, set the `Thread ID` to match the Memory node's `Session ID`
4. The agent will automatically resume from previous conversation context

> **Note**: The built-in `Memory` checkpointer works within a single execution. For cross-execution persistence, use n8n's native Memory nodes.

### 🔗 Resources

- [📚 Workflow Templates](./templates/) - Ready-to-use workflow examples
- [Qiniu AI SDK Documentation](https://github.com/bowenQT/qiniu-ai-sdk)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)
- [Qiniu Cloud AI Portal](https://portal.qiniu.com)

### 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<a name="中文"></a>
## 🇨🇳 中文

[![npm version](https://img.shields.io/npm/v/n8n-nodes-qiniu-ai.svg)](https://www.npmjs.com/package/n8n-nodes-qiniu-ai)
[![n8n](https://img.shields.io/badge/n8n-社区节点-brightgreen)](https://n8n.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> n8n 社区节点 - 集成 [七牛云 AI SDK](https://github.com/bowenQT/qiniu-ai-sdk) 的全模态 AI 能力到 n8n 工作流中。

### ✨ 功能特性

| 资源 | 操作 | 描述 |
|------|-----|------|
| **Chat（聊天）** | 文本生成 | 多模型聊天补全（通义千问、Claude、Gemini、GPT、DeepSeek 等） |
| **Image（图像）** | 生成、编辑 | AI 图像生成和编辑 |
| **Video（视频）** | 生成、混剪、查询状态 | 视频生成（可灵、Veo、Sora） |
| **Audio（音频）** | 文本转语音、语音转文本 | TTS 和 ASR 能力 |
| **Agent（智能体）** | 执行 | 支持内置工具（搜索、OCR、图像/视频生成）和 ReAct 循环的 AI 智能体 |
| **Tools（工具）** | 网络搜索、OCR | 支持高级过滤器（站点、时间、类型）的工具 |

### 📦 安装

#### 社区节点安装（推荐）

1. 进入 **设置** > **社区节点**
2. 点击 **安装**
3. 输入 `n8n-nodes-qiniu-ai` 并点击 **安装**

#### 手动安装

```bash
# 在 n8n 自定义节点目录
npm install n8n-nodes-qiniu-ai
```

### 🔧 配置

1. 在 n8n 中创建凭证：
   - 进入 **凭证** > **新建**
   - 搜索 **Qiniu AI API**
   - 输入 API Key（从[七牛云控制台](https://portal.qiniu.com)获取）

2. （可选）自定义 Base URL 用于私有化部署

### 📖 使用示例

#### 聊天补全

```
资源: Chat
操作: Complete
模型: claude-4.5-sonnet
消息: [{"role": "user", "content": "你好！"}]
```

#### 图像生成

```
资源: Image
操作: Generate
模型: kling-v2-1
提示词: "山间美丽的日落"
等待完成: true
```

#### 视频生成

```
资源: Video
操作: Generate
模型: kling-video-o1
提示词: "一只猫在玩球"
宽高比: 16:9
```

#### 图像 → 视频工作流

1. **图像节点**：生成图像
2. **视频节点**：
   - 设置 `首帧图片二进制属性` 为 `data`
   - 上一节点生成的图像将作为视频首帧

### 🎯 支持的模型

<details>
<summary><b>聊天模型</b></summary>

- 通义千问: qwen3-235b-a22b, qwen3-max, qwen3-32b, qwen-turbo
- Claude: claude-4.5-sonnet, claude-4.5-opus, claude-4.0-sonnet, claude-3.7-sonnet
- Gemini: gemini-3.0-pro-preview, gemini-2.5-flash, gemini-2.5-pro
- DeepSeek: deepseek-r1, deepseek-v3, deepseek-v3.1
- GPT: openai/gpt-5, openai/gpt-5.2
- 其他: doubao-seed-1.6, glm-4.5, kimi-k2, minimax-m2
</details>

<details>
<summary><b>图像模型</b></summary>

- 可灵: kling-v2-1, kling-v2, kling-v1-5
- Gemini: gemini-3.0-pro-image-preview, gemini-2.5-flash-image
- 其他: doubao-1.5-vision-pro, qwen2.5-vl-72b-instruct
</details>

<details>
<summary><b>视频模型</b></summary>

- 可灵: kling-video-o1, kling-v2-1, kling-v2-5-turbo
- Veo: veo-3.1-generate-preview, veo-3.0-generate-preview, veo-2.0-generate-001
- 其他: sora-2, minimax-m2, mimo-v2-flash
</details>

### 💾 持久化对话历史（多轮对话）

如需跨工作流执行保持对话记忆，请使用 n8n 内置的 Memory 节点：

```
┌─────────────────────┐     ┌──────────────────┐
│ Redis/Postgres      │────▶│ Qiniu AI Agent   │
│ Chat Memory 节点    │     │ (threadId 关联)  │
└─────────────────────┘     └──────────────────┘
```

**配置步骤:**
1. 在 Agent 节点前添加 **Redis Chat Memory** 或 **Postgres Chat Memory** 节点
2. 配置 Memory 节点的数据库连接
3. 在 Qiniu AI Agent 节点中，将 `Thread ID` 设置为与 Memory 节点的 `Session ID` 一致
4. Agent 将自动接续之前的对话上下文

> **注意**: 内置的 `Memory` checkpointer 仅在单次执行内有效。跨执行的持久化请使用 n8n 原生 Memory 节点。

### 🔗 相关链接

- [七牛 AI SDK 文档](https://github.com/bowenQT/qiniu-ai-sdk)
- [n8n 社区节点指南](https://docs.n8n.io/integrations/community-nodes/)
- [七牛云 AI 控制台](https://portal.qiniu.com)

### 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)。

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/bowenQT/n8n-nodes-qiniu-ai/issues)
- Email: Contact the maintainer

---

Made with ❤️ by [bowenQT](https://github.com/bowenQT)
