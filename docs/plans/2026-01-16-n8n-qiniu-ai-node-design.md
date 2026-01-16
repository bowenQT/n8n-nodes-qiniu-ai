# n8n Qiniu AI Node Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Create a n8n custom node that wraps all Qiniu AI SDK capabilities into a low-code interface.

**Architecture:** Single multi-resource node with Resource/Operation pattern. Uses @bowenqt/qiniu-ai-sdk as the core engine.

**Tech Stack:** TypeScript, n8n-nodes-starter template, @bowenqt/qiniu-ai-sdk v0.13.0

---

## 1. Node Architecture

### 1.1 Node Metadata

```typescript
displayName: 'Qiniu AI'
name: 'qiniuAi'
icon: 'file:qiniu.svg'
group: ['transform']
version: 1
```

### 1.2 Resource → Operation Mapping

| Resource | Operation | SDK Method |
|----------|-----------|------------|
| **Chat** | `completion` | `chat.create()` |
| **Image** | `generate` | `image.generate()` |
| **Image** | `edit` | `image.edit()` |
| **Video** | `generate` | `video.create()` |
| **Video** | `getStatus` | `video.get()` |
| **Audio** | `textToSpeech` | `tts.synthesize()` |
| **Audio** | `speechToText` | `asr.recognize()` |
| **OCR** | `recognize` | `ocr.recognize()` |
| **Tools** | `webSearch` | `sys.webSearch()` |
| **Agent** | `runGraph` | `generateTextWithGraph()` |

---

## 2. Credentials

**File:** `QiniuAiApi.credentials.ts`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `apiKey` | string | ✅ | - | API Key |
| `baseUrl` | string | ❌ | `https://api.qnaigc.com/v1` | Base URL |

---

## 3. Parameter Definitions

### 3.1 Chat Parameters

| Parameter | n8n Type | SDK Mapping | Description |
|-----------|----------|-------------|-------------|
| `model` | options | `model` | Chat model selection |
| `inputType` | options | - | Simple prompt / Message array |
| `prompt` | string | wrapped as `[{role:'user', content}]` | Simple mode |
| `messages` | fixedCollection | `messages` | Advanced mode |
| `systemMessage` | string | prepend system message | System prompt |
| `temperature` | number | `temperature` | 0-2, default 1 |
| `maxTokens` | number | `max_tokens` | Max output length |
| `jsonMode` | boolean | `{type:'json_object'}` | JSON output mode |

### 3.2 Image Parameters

**Basic:**
| Parameter | n8n Type | SDK Mapping |
|-----------|----------|-------------|
| `prompt` | string | `prompt` |
| `negativePrompt` | string | `negative_prompt` |
| `aspectRatio` | options | `aspect_ratio` (16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9) |
| `count` | number | `n` |

**Advanced (Options Collection):**
| Parameter | n8n Type | SDK Mapping |
|-----------|----------|-------------|
| `referenceImage` | string | `image_url` / `image` |
| `strength` | number | `strength` (0-1) |
| `imageReference` | options | `image_reference` (subject/face) |
| `imageSize` | options | `image_config.image_size` (1K/2K/4K) |

**Edit Mode:**
| Parameter | n8n Type | SDK Mapping |
|-----------|----------|-------------|
| `mask` | string | `mask` |
| `subjectImageList` | json | `subject_image_list` |
| `sceneImage` | json | `scene_image` |
| `styleImage` | json | `style_image` |

### 3.3 Video Parameters

**Basic:**
| Parameter | n8n Type | SDK Mapping |
|-----------|----------|-------------|
| `prompt` | string | `prompt` |
| `negativePrompt` | string | `negative_prompt` |
| `aspectRatio` | options | `aspect_ratio` (16:9, 1:1, 9:16) |
| `firstFrameUrl` | string | `frames.first.url` |
| `lastFrameUrl` | string | `frames.last.url` |

**Kling-specific (displayOptions):**
| Parameter | n8n Type |
|-----------|----------|
| `duration` | options (5, 10) |
| `mode` | options (std, pro) |
| `size` | string |
| `cfgScale` | number |

**Veo-specific (displayOptions):**
| Parameter | n8n Type |
|-----------|----------|
| `generateAudio` | boolean |
| `resolution` | options (720p, 1080p) |
| `sampleCount` | number (1-4) |
| `personGeneration` | options |
| `seed` | number |

### 3.4 Agent Parameters (Key Feature)

| Parameter | n8n Type | Description |
|-----------|----------|-------------|
| `prompt` | string | User goal |
| `systemMessage` | string | Agent persona |
| `maxContextTokens` | number | Max context (SDK auto-compacts) |
| `maxSteps` | number | Max steps (prevent infinite loop) |
| `tools` | json | Tool definitions |
| `threadId` | string | Session ID (memory) |

---

## 4. Execution Logic

### 4.1 Async Task Handling

```typescript
// Image with waitForCompletion
const result = await client.image.generate(params);
if (!result.isSync && waitForCompletion) {
  return await client.image.waitForResult(result);
}
return result;

// Video with waitForCompletion  
const task = await client.video.create(params);
if (waitForCompletion) {
  return await client.video.waitForCompletion(task.id);
}
return { taskId: task.id };
```

### 4.2 Output Normalization

**Chat:**
```json
{
  "content": "AI response",
  "role": "assistant",
  "finishReason": "stop",
  "usage": { "promptTokens": 100, "completionTokens": 50 },
  "_raw": {}
}
```

**Image:**
```json
{
  "images": [{ "url": "https://...", "index": 0 }],
  "status": "succeed",
  "_raw": {}
}
```

**Video:**
```json
{
  "videos": [{ "url": "https://...", "duration": "5" }],
  "status": "completed", 
  "_raw": {}
}
```

**Agent:**
```json
{
  "content": "Final response",
  "steps": [{ "type": "tool_call", "name": "web_search", "result": "..." }],
  "usage": { "totalTokens": 5000 },
  "_raw": {}
}
```

### 4.3 Binary Data Handling

**OCR/Image Input:**
```typescript
const binaryData = this.helpers.getBinaryDataBuffer(i, 'data');
const base64 = binaryData.toString('base64');
```

**TTS Output:**
```typescript
const buffer = Buffer.from(result.audio, 'base64');
return {
  json: { duration: result.duration },
  binary: { data: await this.helpers.prepareBinaryData(buffer, 'audio.mp3') }
};
```

---

## 5. Project Structure

```
n8n-nodes-qiniu-ai-sdk/
├── package.json
├── tsconfig.json
├── credentials/
│   └── QiniuAiApi.credentials.ts
├── nodes/
│   └── QiniuAi/
│       ├── QiniuAi.node.ts
│       ├── QiniuAi.node.json
│       ├── qiniu.svg
│       └── descriptions/
│           ├── ChatDescription.ts
│           ├── ImageDescription.ts
│           ├── VideoDescription.ts
│           ├── AudioDescription.ts
│           ├── AgentDescription.ts
│           └── ...
└── dist/
```

---

## 6. Implementation Roadmap

| Phase | Scope | Priority |
|-------|-------|----------|
| **1. Scaffold** | Project setup, credentials, basic node structure | P0 |
| **2. Chat** | Chat completion with model selection | P0 |
| **3. Image** | Generate + Edit with waitForCompletion | P1 |
| **4. Video** | Generate with model-specific params | P1 |
| **5. Agent** | generateTextWithGraph integration | P1 |
| **6. Audio** | TTS + ASR | P2 |
| **7. Tools** | OCR, Web Search | P2 |
| **8. Test** | npm link + local n8n testing | P0 |
