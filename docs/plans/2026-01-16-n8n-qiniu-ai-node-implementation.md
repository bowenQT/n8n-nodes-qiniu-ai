# n8n Qiniu AI Node Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Implement a production-ready n8n custom node wrapping @bowenqt/qiniu-ai-sdk

**Architecture:** Single node with Resource/Operation pattern, TypeScript, npm package

**Tech Stack:** n8n custom node SDK, TypeScript 5.x, @bowenqt/qiniu-ai-sdk v0.13.0

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.eslintrc.js`
- Create: `gulpfile.js`

**Step 1: Create package.json**

```json
{
  "name": "n8n-nodes-qiniu-ai",
  "version": "0.1.0",
  "description": "n8n nodes for Qiniu AI SDK",
  "keywords": ["n8n-community-node-package"],
  "license": "MIT",
  "author": {
    "name": "Bowen"
  },
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "lint": "eslint nodes credentials --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "files": ["dist"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/QiniuAiApi.credentials.js"],
    "nodes": ["dist/nodes/QiniuAi/QiniuAi.node.js"]
  },
  "dependencies": {
    "@bowenqt/qiniu-ai-sdk": "^0.13.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "gulp": "^4.0.2",
    "n8n-workflow": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["nodes/**/*", "credentials/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
```

**Step 4: Create directory structure**

```bash
mkdir -p nodes/QiniuAi credentials
```

**Step 5: Install dependencies**

```bash
npm install
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(scaffold): init n8n node project structure"
```

---

## Task 2: Credentials

**Files:**
- Create: `credentials/QiniuAiApi.credentials.ts`

**Step 1: Create credentials file**

```typescript
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class QiniuAiApi implements ICredentialType {
  name = 'qiniuAiApi';
  displayName = 'Qiniu AI API';
  documentationUrl = 'https://github.com/bowenQT/qiniu-ai-sdk';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.qnaigc.com/v1',
    },
  ];
}
```

**Step 2: Build and verify**

```bash
npm run build
```
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(credentials): add Qiniu AI API credentials"
```

---

## Task 3: Node Shell with Resource/Operation

**Files:**
- Create: `nodes/QiniuAi/QiniuAi.node.ts`
- Create: `nodes/QiniuAi/QiniuAi.node.json`
- Create: `nodes/QiniuAi/qiniu.svg`

**Step 1: Create node JSON metadata**

```json
{
  "node": "n8n-nodes-base.qiniuAi",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["AI"],
  "resources": {
    "primaryDocumentation": [
      {
        "url": "https://github.com/bowenQT/qiniu-ai-sdk"
      }
    ]
  }
}
```

**Step 2: Create basic node shell**

Node with:
- Resource options: Chat, Image, Video, Audio, OCR, Tools, Agent
- Operation options per resource
- Placeholder execute() returning empty

**Step 3: Create SVG icon**

Simple Qiniu-style icon (can be placeholder)

**Step 4: Build and verify**

```bash
npm run build
```
Expected: No errors, dist/ contains compiled files

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(node): add QiniuAi node shell with resource/operation structure"
```

---

## Task 4: Chat Completion

**Files:**
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`
- Create: `nodes/QiniuAi/descriptions/ChatDescription.ts`

**Step 1: Create ChatDescription.ts**

Define Chat-specific parameters:
- model (options with CHAT_MODELS)
- inputType (simple/messages)
- prompt (string)
- messages (fixedCollection)
- systemMessage (string)
- temperature (number)
- maxTokens (number)
- jsonMode (boolean)

**Step 2: Implement Chat execution in node**

```typescript
case 'chat':
  if (operation === 'completion') {
    const client = new QiniuAI({ apiKey, baseUrl });
    const result = await client.chat.create({
      model,
      messages: buildMessages(inputType, prompt, systemMessage, messages),
      temperature,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });
    return normalizeOutput(result);
  }
```

**Step 3: Build and test**

```bash
npm run build
```
Expected: Compiles without errors

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(chat): implement chat completion with model selection"
```

---

## Task 5: Image Generation

**Files:**
- Create: `nodes/QiniuAi/descriptions/ImageDescription.ts`
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`

**Step 1: Create ImageDescription.ts**

Parameters:
- Basic: model, prompt, negativePrompt, aspectRatio, count
- Advanced: referenceImage, strength, imageReference, imageSize
- Edit mode: mask, subjectImageList, sceneImage, styleImage

**Step 2: Implement Image execution**

- generate operation with waitForResult
- edit operation

**Step 3: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat(image): implement image generate and edit with waitForResult"
```

---

## Task 6: Video Generation

**Files:**
- Create: `nodes/QiniuAi/descriptions/VideoDescription.ts`
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`

**Step 1: Create VideoDescription.ts**

Parameters with model-specific displayOptions:
- Basic: model, prompt, aspectRatio, frames
- Kling: duration, mode, size, cfgScale
- Veo: generateAudio, resolution, sampleCount, personGeneration, seed

**Step 2: Implement Video execution**

- generate with waitForCompletion
- getStatus operation

**Step 3: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat(video): implement video generation with model-specific params"
```

---

## Task 7: Agent Graph

**Files:**
- Create: `nodes/QiniuAi/descriptions/AgentDescription.ts`
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`

**Step 1: Create AgentDescription.ts**

Parameters:
- prompt, systemMessage
- maxContextTokens, maxSteps
- tools (json)
- threadId (for memory)

**Step 2: Implement Agent execution**

```typescript
case 'agent':
  const result = await generateTextWithGraph({
    client,
    model,
    prompt,
    system: systemMessage,
    maxContextTokens,
    maxSteps,
    tools: parseTools(toolsJson),
    threadId,
  });
  return normalizeAgentOutput(result);
```

**Step 3: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat(agent): implement generateTextWithGraph integration"
```

---

## Task 8: Audio (TTS + ASR)

**Files:**
- Create: `nodes/QiniuAi/descriptions/AudioDescription.ts`
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`

**Step 1: TTS execution with binary output**

**Step 2: ASR execution with binary input**

**Step 3: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat(audio): implement TTS and ASR with binary handling"
```

---

## Task 9: Tools (OCR + Web Search)

**Files:**
- Create: `nodes/QiniuAi/descriptions/ToolsDescription.ts`
- Create: `nodes/QiniuAi/descriptions/OcrDescription.ts`
- Modify: `nodes/QiniuAi/QiniuAi.node.ts`

**Step 1: OCR with binary input**

**Step 2: Web Search implementation**

**Step 3: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat(tools): implement OCR and Web Search"
```

---

## Task 10: Local Testing

**Step 1: Link to local n8n**

```bash
npm link
cd ~/.n8n/custom
npm link n8n-nodes-qiniu-ai
```

**Step 2: Start n8n and test each operation**

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: address issues from local testing"
```

---

## Task 11: Documentation & Release Prep

**Files:**
- Create: `README.md`
- Update: `package.json` version

**Step 1: Write README with usage examples**

**Step 2: Final build and test**

**Step 3: Commit**

```bash
git add -A
git commit -m "docs: add README and prepare for release"
```
