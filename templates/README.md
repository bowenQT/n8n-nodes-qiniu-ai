# n8n Workflow Templates for Qiniu AI

Ready-to-use workflow templates that showcase **Qiniu AI** capabilities in n8n.

## 📦 Available Templates

### 1. 🤖 AI Customer Support
**File:** `ai-customer-support.json`

An intelligent customer support chatbot with:
- Web search capability for answering questions
- Redis memory for conversation history
- Multi-turn conversation support

**Use Case:** Customer service automation, FAQ bots, support ticket handling

---

### 2. 🎨 Content Generation Pipeline
**File:** `content-generation-pipeline.json`

Generate images and videos in a seamless pipeline:
- AI image generation with Kling models
- Image-to-video with the generated image as first frame
- Batch processing ready

**Use Case:** Social media content, marketing materials, creative assets

---

### 3. 📄 Document Processing with OCR
**File:** `document-processing.json`

Extract and structure information from documents:
- OCR text extraction from images
- AI-powered analysis and structuring
- JSON output for easy integration

**Use Case:** Invoice processing, contract analysis, data entry automation

---

## 🚀 How to Use

### Import a Template

1. Copy the JSON content from the template file
2. In n8n, click **Workflows** > **Import from File** or **Import from URL**
3. Paste the JSON or upload the file
4. Update the **Qiniu AI API** credentials

### Configure Credentials

1. Go to **Credentials** > **New**
2. Search for **Qiniu AI API**
3. Enter your API Key from [Qiniu Cloud Console](https://portal.qiniu.com)
4. Update the credential references in the imported workflow

---

## 📝 Customization

These templates are starting points. Feel free to:
- Modify prompts for your specific use case
- Add additional nodes for your workflow
- Combine multiple templates together
- Adjust model selections based on your needs

---

## 🤝 Contributing

Have a great workflow using Qiniu AI? We'd love to include it!

1. Export your workflow as JSON
2. Remove any sensitive credentials
3. Submit a pull request to add it to the `templates/` folder

---

## 📄 License

MIT License - Same as the main package.
