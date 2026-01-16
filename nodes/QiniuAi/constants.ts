import { INodePropertyOptions } from 'n8n-workflow';

// Chat models from SDK
export const CHAT_MODEL_OPTIONS: INodePropertyOptions[] = [
    // Qwen
    { name: 'Qwen3 235B A22B', value: 'qwen3-235b-a22b' },
    { name: 'Qwen3 Max', value: 'qwen3-max' },
    { name: 'Qwen3 32B', value: 'qwen3-32b' },
    { name: 'Qwen Turbo', value: 'qwen-turbo' },
    // Claude
    { name: 'Claude 4.5 Sonnet', value: 'claude-4.5-sonnet' },
    { name: 'Claude 4.5 Opus', value: 'claude-4.5-opus' },
    { name: 'Claude 4.0 Sonnet', value: 'claude-4.0-sonnet' },
    { name: 'Claude 3.7 Sonnet', value: 'claude-3.7-sonnet' },
    { name: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet' },
    // Gemini
    { name: 'Gemini 3.0 Pro Preview', value: 'gemini-3.0-pro-preview' },
    { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
    { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    // DeepSeek
    { name: 'DeepSeek R1', value: 'deepseek-r1' },
    { name: 'DeepSeek V3', value: 'deepseek-v3' },
    { name: 'DeepSeek V3.1', value: 'deepseek-v3.1' },
    // GPT
    { name: 'GPT-5', value: 'openai/gpt-5' },
    { name: 'GPT-5.2', value: 'openai/gpt-5.2' },
    // Doubao
    { name: 'Doubao Seed 1.6', value: 'doubao-seed-1.6' },
    { name: 'Doubao 1.5 Thinking Pro', value: 'doubao-1.5-thinking-pro' },
    // Others
    { name: 'GLM 4.5', value: 'glm-4.5' },
    { name: 'Grok 4 Fast', value: 'x-ai/grok-4-fast' },
    { name: 'Kimi K2', value: 'kimi-k2' },
    { name: 'MiniMax M2', value: 'minimax/minimax-m2' },
];

// Image models
export const IMAGE_MODEL_OPTIONS: INodePropertyOptions[] = [
    { name: 'Kling V2.1', value: 'kling-v2-1' },
    { name: 'Kling V2', value: 'kling-v2' },
    { name: 'Kling V1.5', value: 'kling-v1-5' },
    { name: 'Gemini 3.0 Pro Image Preview', value: 'gemini-3.0-pro-image-preview' },
    { name: 'Gemini 2.5 Flash Image', value: 'gemini-2.5-flash-image' },
    { name: 'Doubao 1.5 Vision Pro', value: 'doubao-1.5-vision-pro' },
    { name: 'Qwen2.5 VL 72B Instruct', value: 'qwen2.5-vl-72b-instruct' },
];

// Video models
export const VIDEO_MODEL_OPTIONS: INodePropertyOptions[] = [
    // Kling
    { name: 'Kling Video O1', value: 'kling-video-o1' },
    { name: 'Kling V2.1', value: 'kling-v2-1' },
    { name: 'Kling V2.5 Turbo', value: 'kling-v2-5-turbo' },
    // Sora
    { name: 'Sora 2', value: 'sora-2' },
    // Veo
    { name: 'Veo 3.1 Generate Preview', value: 'veo-3.1-generate-preview' },
    { name: 'Veo 3.0 Generate Preview', value: 'veo-3.0-generate-preview' },
    { name: 'Veo 3.0 Fast Generate Preview', value: 'veo-3.0-fast-generate-preview' },
    { name: 'Veo 2.0 Generate', value: 'veo-2.0-generate-001' },
    // Others
    { name: 'MiniMax M2 Video', value: 'minimax/minimax-m2' },
    { name: 'Mimo V2 Flash Video', value: 'mimo-v2-flash' },
];

// Aspect ratios
export const ASPECT_RATIO_OPTIONS: INodePropertyOptions[] = [
    { name: '16:9 (Landscape)', value: '16:9' },
    { name: '9:16 (Portrait)', value: '9:16' },
    { name: '1:1 (Square)', value: '1:1' },
    { name: '4:3', value: '4:3' },
    { name: '3:4', value: '3:4' },
    { name: '3:2', value: '3:2' },
    { name: '2:3', value: '2:3' },
    { name: '21:9 (Ultra-wide)', value: '21:9' },
];

export const VIDEO_ASPECT_RATIO_OPTIONS: INodePropertyOptions[] = [
    { name: '16:9 (Landscape)', value: '16:9' },
    { name: '9:16 (Portrait)', value: '9:16' },
    { name: '1:1 (Square)', value: '1:1' },
];

// Helper to check if model is Kling
export function isKlingModel(model: string): boolean {
    return model.toLowerCase().includes('kling');
}

// Helper to check if model is Veo
export function isVeoModel(model: string): boolean {
    return model.toLowerCase().includes('veo');
}
