# n8n-nodes-qiniu-ai

n8n community node for [Qiniu AI SDK](https://www.npmjs.com/package/@bowenqt/qiniu-ai-sdk) - Access 70+ AI models for Chat, Image, Video, Audio, OCR and Agents.

## Features

- **Chat Completion**: 70+ models including Qwen, Claude, Gemini, DeepSeek, GPT, Grok, Kimi and more
- **Image Generation**: Generate and edit images with Kling, Gemini, Doubao models
- **Video Generation**: Create videos with Kling, Sora, Veo models with model-specific options
- **AI Agent**: Run intelligent agents with tool calling and memory management
- **Audio**: Text-to-Speech and Speech-to-Text (coming soon)
- **OCR**: Optical character recognition (coming soon)

## Installation

### In n8n Desktop/Self-hosted

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-qiniu-ai` and click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-qiniu-ai
```

## Configuration

1. Get your API key from [Qiniu AI Console](https://portal.qiniu.com)
2. In n8n, go to **Credentials** → **New**
3. Search for "Qiniu AI API"
4. Enter your API key

## Usage Examples

### Chat Completion

```json
{
  "resource": "chat",
  "operation": "completion",
  "model": "qwen3-max",
  "inputType": "simple",
  "prompt": "Explain quantum computing in simple terms"
}
```

### Image Generation

```json
{
  "resource": "image",
  "operation": "generate",
  "model": "kling-v2-1",
  "prompt": "A futuristic city at sunset",
  "waitForCompletion": true
}
```

### Video Generation

```json
{
  "resource": "video",
  "operation": "generate",
  "model": "kling-video-o1",
  "prompt": "A cat playing with a ball",
  "klingOptions": {
    "duration": "5",
    "mode": "pro"
  }
}
```

### AI Agent

```json
{
  "resource": "agent",
  "operation": "runGraph",
  "model": "qwen3-max",
  "prompt": "Search for the latest AI news and summarize them",
  "options": {
    "maxContextTokens": 32000,
    "maxSteps": 10
  }
}
```

## Supported Models

### Chat Models
- Qwen: qwen3-235b-a22b, qwen3-max, qwen3-32b, qwen-turbo
- Claude: claude-4.5-sonnet, claude-4.5-opus, claude-4.0-sonnet
- Gemini: gemini-3.0-pro-preview, gemini-2.5-flash, gemini-2.5-pro
- DeepSeek: deepseek-r1, deepseek-v3, deepseek-v3.1
- GPT: openai/gpt-5, openai/gpt-5.2
- And 50+ more...

### Image Models
- Kling: kling-v2-1, kling-v2, kling-v1-5
- Gemini: gemini-3.0-pro-image-preview, gemini-2.5-flash-image
- Doubao: doubao-1.5-vision-pro

### Video Models
- Kling: kling-video-o1, kling-v2-1, kling-v2-5-turbo
- Sora: sora-2
- Veo: veo-3.1-generate-preview, veo-3.0-generate-preview

## License

MIT
