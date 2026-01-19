import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    IDataObject,
    IBinaryKeyData,
} from 'n8n-workflow';

import { QiniuAI, generateTextWithGraph, APIError, MemoryCheckpointer, KodoCheckpointer, Checkpointer, CensorScene } from '@bowenqt/qiniu-ai-sdk';

import { chatOperations, chatFields } from './descriptions/ChatDescription';
import { imageOperations, imageFields } from './descriptions/ImageDescription';
import { videoOperations, videoFields } from './descriptions/VideoDescription';
import { agentOperations, agentFields } from './descriptions/AgentDescription';
import { audioOperations, audioFields } from './descriptions/AudioDescription';
import { toolsOperations, toolsFields } from './descriptions/ToolsDescription';

export class QiniuAi implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Qiniu AI',
        name: 'qiniuAi',
        icon: 'file:qiniu.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with Qiniu AI services - Chat, Image, Video, Agent and more',
        defaults: {
            name: 'Qiniu AI',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'qiniuAiApi',
                required: true,
            },
        ],
        properties: [
            // Resource
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Chat',
                        value: 'chat',
                        description: 'Generate chat completions',
                    },
                    {
                        name: 'Image',
                        value: 'image',
                        description: 'Generate or edit images',
                    },
                    {
                        name: 'Video',
                        value: 'video',
                        description: 'Generate videos',
                    },
                    {
                        name: 'Agent',
                        value: 'agent',
                        description: 'Run AI agent with tools and memory',
                    },
                    {
                        name: 'Audio',
                        value: 'audio',
                        description: 'Text-to-Speech and Speech-to-Text',
                    },
                    {
                        name: 'Tools',
                        value: 'tools',
                        description: 'Web Search, OCR and more',
                    },
                ],
                default: 'chat',
            },
            // Operations and fields
            ...chatOperations,
            ...chatFields,
            ...imageOperations,
            ...imageFields,
            ...videoOperations,
            ...videoFields,
            ...agentOperations,
            ...agentFields,
            ...audioOperations,
            ...audioFields,
            ...toolsOperations,
            ...toolsFields,
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        // Get credentials
        const credentials = await this.getCredentials('qiniuAiApi');
        const apiKey = credentials.apiKey as string;
        const baseUrl = (credentials.baseUrl as string) || 'https://api.qnaigc.com/v1';

        // Initialize client
        const client = new QiniuAI({ apiKey, baseUrl });

        const resource = this.getNodeParameter('resource', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                let result: IDataObject;

                // Route to appropriate handler
                if (resource === 'chat') {
                    result = await handleChat(this, client, i);
                } else if (resource === 'image') {
                    // Image needs special handling for binary output
                    const imageResult = await handleImage(this, client, i);
                    returnData.push({
                        json: imageResult.json,
                        binary: imageResult.binary,
                        pairedItem: { item: i },
                    });
                    continue;
                } else if (resource === 'video') {
                    result = await handleVideo(this, client, i);
                } else if (resource === 'agent') {
                    result = await handleAgent(this, client, i);
                } else if (resource === 'audio') {
                    result = await handleAudio(this, client, i);
                } else if (resource === 'tools') {
                    result = await handleTools(this, client, i);
                } else {
                    throw new NodeOperationError(
                        this.getNode(),
                        `Unknown resource: ${resource}`,
                        { itemIndex: i }
                    );
                }

                returnData.push({
                    json: result,
                    pairedItem: { item: i },
                });
            } catch (error) {
                if (error instanceof APIError) {
                    throw new NodeOperationError(
                        this.getNode(),
                        `Qiniu AI API Error: ${error.message}`,
                        {
                            itemIndex: i,
                            description: `Status: ${error.status}, Code: ${(error as any).code || 'unknown'}`,
                        }
                    );
                }
                throw error;
            }
        }

        return [returnData];
    }
}

// Chat handler
async function handleChat(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
    const model = context.getNodeParameter('model', itemIndex) as string;
    const inputType = context.getNodeParameter('inputType', itemIndex) as string;
    const options = context.getNodeParameter('options', itemIndex, {}) as {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
        topP?: number;
    };

    // Build messages
    let messages: Array<{ role: string; content: string }> = [];

    if (inputType === 'simple') {
        const prompt = context.getNodeParameter('prompt', itemIndex) as string;
        const systemMessage = context.getNodeParameter('systemMessage', itemIndex, '') as string;

        if (systemMessage) {
            messages.push({ role: 'system', content: systemMessage });
        }
        messages.push({ role: 'user', content: prompt });
    } else {
        const messagesData = context.getNodeParameter('messages', itemIndex) as {
            messageValues?: Array<{ role: string; content: string }>;
        };
        messages = messagesData.messageValues || [];
    }

    // Call API
    const response = await client.chat.create({
        model,
        messages: messages as any,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    // Normalize output
    const choice = response.choices?.[0];
    return {
        content: choice?.message?.content || '',
        role: choice?.message?.role || 'assistant',
        finishReason: choice?.finish_reason || null,
        usage: response.usage
            ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
            }
            : null,
        _raw: response as unknown as IDataObject,
    };
}

// Image handler - returns { json, binary } for proper n8n binary data handling
async function handleImage(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<{ json: IDataObject; binary?: IBinaryKeyData }> {
    const operation = context.getNodeParameter('operation', itemIndex) as string;
    const model = context.getNodeParameter('model', itemIndex) as string;
    const prompt = context.getNodeParameter('prompt', itemIndex) as string;
    const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex, true) as boolean;
    const options = context.getNodeParameter('options', itemIndex, {}) as Record<string, unknown>;

    const params: any = {
        model,
        prompt,
        negative_prompt: options.negativePrompt,
        aspect_ratio: options.aspectRatio,
        n: options.n,
    };

    if (operation === 'edit') {
        const referenceUrl = context.getNodeParameter('referenceImageUrl', itemIndex, '') as string;
        if (referenceUrl) {
            params.image_url = referenceUrl;
        }
        if (options.mask) {
            params.mask = options.mask;
        }
        params.strength = options.strength;
        params.image_reference = options.imageReference;
    }

    // Handle image_config
    if (options.imageSize) {
        params.image_config = { image_size: options.imageSize };
    }

    // Advanced image references (generate only)
    if (operation === 'generate') {
        const subjectImageUrls = context.getNodeParameter('subjectImageUrls', itemIndex, '') as string;
        const sceneImageUrl = context.getNodeParameter('sceneImageUrl', itemIndex, '') as string;
        const styleImageUrl = context.getNodeParameter('styleImageUrl', itemIndex, '') as string;

        // Subject reference images
        if (subjectImageUrls) {
            const urls = subjectImageUrls.split(',').map(u => u.trim()).filter(u => u);
            if (urls.length > 0) {
                params.subject_image_list = urls.map(image => ({ image, image_type: 'subject' }));
            }
        }

        // Scene reference image
        if (sceneImageUrl) {
            params.scene_image = { image: sceneImageUrl };
        }

        // Style reference image
        if (styleImageUrl) {
            params.style_image = { image: styleImageUrl };
        }
    }

    let result: any;
    if (operation === 'generate') {
        const createResult = await client.image.generate(params);
        if (waitForCompletion) {
            result = await client.image.waitForResult(createResult);
        } else {
            result = createResult;
        }
    } else {
        result = await client.image.edit(params);
    }

    // Build binary data from base64 images
    const binary: IBinaryKeyData = {};
    const images: any[] = [];

    if (result.data && Array.isArray(result.data)) {
        for (let idx = 0; idx < result.data.length; idx++) {
            const img = result.data[idx];
            images.push({
                url: img.url || undefined,
                index: img.index,
            });

            // Convert base64 to binary data for downstream usage
            if (img.b64_json) {
                const buffer = Buffer.from(img.b64_json, 'base64');
                const binaryKey = idx === 0 ? 'data' : `data_${idx}`;
                binary[binaryKey] = await context.helpers.prepareBinaryData(
                    buffer,
                    `image_${idx}.${result.output_format || 'png'}`,
                    `image/${result.output_format || 'png'}`
                );
            }
        }
    }

    return {
        json: {
            images,
            status: result.status || 'unknown',
            taskId: result.task_id,
            isSync: result.isSync,
            imageCount: images.length,
            _raw: result,
        },
        binary: Object.keys(binary).length > 0 ? binary : undefined,
    };
}

// Video handler
async function handleVideo(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
    const operation = context.getNodeParameter('operation', itemIndex) as string;

    if (operation === 'getStatus') {
        const taskId = context.getNodeParameter('taskId', itemIndex) as string;
        const result = await client.video.get(taskId);
        return {
            id: result.id,
            status: result.status,
            videos: result.task_result?.videos || [],
            message: result.message,
            _raw: result as unknown as IDataObject,
        };
    }

    if (operation === 'remix') {
        const sourceVideoId = context.getNodeParameter('sourceVideoId', itemIndex) as string;
        const remixPrompt = context.getNodeParameter('remixPrompt', itemIndex, '') as string;
        const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex, true) as boolean;
        const remixOptions = context.getNodeParameter('remixOptions', itemIndex, {}) as Record<string, unknown>;

        const remixParams: any = {};
        if (remixPrompt) remixParams.prompt = remixPrompt;
        if (remixOptions.duration) remixParams.duration = remixOptions.duration;
        if (remixOptions.mode) remixParams.mode = remixOptions.mode;
        if (remixOptions.negativePrompt) remixParams.negative_prompt = remixOptions.negativePrompt;

        const task = await client.video.remix(sourceVideoId, remixParams);

        if (waitForCompletion) {
            const result = await client.video.waitForCompletion(task.id);
            return {
                id: result.id,
                status: result.status,
                videos: result.task_result?.videos || [],
                _raw: result as unknown as IDataObject,
            };
        }

        return {
            id: task.id,
            status: 'processing',
            _raw: task,
        };
    }

    // Generate
    const model = context.getNodeParameter('model', itemIndex) as string;
    const prompt = context.getNodeParameter('prompt', itemIndex) as string;
    const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex, true) as boolean;
    const firstFrameUrl = context.getNodeParameter('firstFrameUrl', itemIndex, '') as string;
    const firstFrameBinaryProperty = context.getNodeParameter('firstFrameBinaryProperty', itemIndex, '') as string;
    const lastFrameUrl = context.getNodeParameter('lastFrameUrl', itemIndex, '') as string;
    const lastFrameBinaryProperty = context.getNodeParameter('lastFrameBinaryProperty', itemIndex, '') as string;
    const aspectRatio = context.getNodeParameter('aspectRatio', itemIndex, '16:9') as string;
    const options = context.getNodeParameter('options', itemIndex, {}) as Record<string, unknown>;

    const params: any = {
        model,
        prompt,
        negative_prompt: options.negativePrompt,
        aspect_ratio: aspectRatio,
    };

    // Frame control - support both URL and Binary Data
    const frames: any = {};

    // First frame
    if (firstFrameUrl) {
        frames.first = { url: firstFrameUrl };
    } else if (firstFrameBinaryProperty) {
        try {
            const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, firstFrameBinaryProperty);
            frames.first = { base64: buffer.toString('base64') };
        } catch {
            // Binary data not found, skip
        }
    }

    // Last frame
    if (lastFrameUrl) {
        frames.last = { url: lastFrameUrl };
    } else if (lastFrameBinaryProperty) {
        try {
            const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, lastFrameBinaryProperty);
            frames.last = { base64: buffer.toString('base64') };
        } catch {
            // Binary data not found, skip
        }
    }

    if (Object.keys(frames).length > 0) {
        params.frames = frames;
    }

    // Video reference (video_list) for video-to-video generation
    const videoReferenceUrl = context.getNodeParameter('videoReferenceUrl', itemIndex, '') as string;
    const keepOriginalSound = context.getNodeParameter('keepOriginalSound', itemIndex, false) as boolean;
    if (videoReferenceUrl) {
        params.video_list = [{
            video_url: videoReferenceUrl,
            keep_original_sound: keepOriginalSound ? 'yes' : 'no',
        }];
    }

    // Model-specific options
    if (model.includes('kling')) {
        const klingOptions = context.getNodeParameter('klingOptions', itemIndex, {}) as Record<string, unknown>;
        // Duration is required for Kling - default to 5 seconds
        params.duration = klingOptions.duration || '5';
        if (klingOptions.mode) params.mode = klingOptions.mode;
        if (klingOptions.cfgScale) params.cfg_scale = klingOptions.cfgScale;

        // Use size from options, or derive from aspect_ratio (workaround for SDK bug)
        if (klingOptions.size) {
            params.size = klingOptions.size;
        } else {
            // Map aspect_ratio to default size for Kling API
            const sizeMap: Record<string, string> = {
                '16:9': '1920:1080',
                '9:16': '1080:1920',
                '1:1': '1080:1080',
            };
            params.size = sizeMap[aspectRatio] || '1920:1080';
        }
    }

    if (model.includes('veo')) {
        const veoOptions = context.getNodeParameter('veoOptions', itemIndex, {}) as Record<string, unknown>;
        // DurationSeconds is required for Veo - fixed at 8 seconds
        params.duration = veoOptions.duration || 8;
        if (veoOptions.generateAudio !== undefined) params.generate_audio = veoOptions.generateAudio;
        if (veoOptions.resolution) params.resolution = veoOptions.resolution;
        if (veoOptions.sampleCount) params.sample_count = veoOptions.sampleCount;
        if (veoOptions.personGeneration) params.person_generation = veoOptions.personGeneration;
        if (veoOptions.seed) params.seed = veoOptions.seed;
    }

    const task = await client.video.create(params);

    if (waitForCompletion) {
        const result = await client.video.waitForCompletion(task.id);
        return {
            id: result.id,
            status: result.status,
            videos: result.task_result?.videos || [],
            _raw: result as unknown as IDataObject,
        };
    }

    return {
        id: task.id,
        status: 'processing',
        _raw: task,
    };
}

// Agent handler
async function handleAgent(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
    const model = context.getNodeParameter('model', itemIndex) as string;
    const prompt = context.getNodeParameter('prompt', itemIndex) as string;
    const systemMessage = context.getNodeParameter('systemMessage', itemIndex, '') as string;
    const builtinTools = context.getNodeParameter('builtinTools', itemIndex, []) as string[];
    const autoExecuteTools = context.getNodeParameter('autoExecuteTools', itemIndex, true) as boolean;
    const options = context.getNodeParameter('options', itemIndex, {}) as {
        maxContextTokens?: number;
        maxSteps?: number;
        threadId?: string;
        tools?: string;
        temperature?: number;
        imageModel?: string;
        videoModel?: string;
        checkpointerType?: 'none' | 'memory' | 'kodo' | 'redis' | 'postgres';
        checkpointerConnection?: string;
        kodoBucket?: string;
        kodoAccessKey?: string;
        kodoSecretKey?: string;
        kodoPrefix?: string;
        enableParallel?: boolean;
        maxConcurrency?: number;
    };

    // Build tools record
    const toolsRecord: Record<string, any> = {};

    // Register built-in tools
    if (builtinTools.includes('webSearch')) {
        toolsRecord['web_search'] = {
            description: 'Search the web for information. Use this to find current information.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'The search query' },
                },
                required: ['query'],
            },
            execute: async (args: { query: string }) => {
                const results = await client.sys.search({ query: args.query });
                return { results: results?.slice(0, 5) || [] };
            },
        };
    }

    if (builtinTools.includes('ocr')) {
        toolsRecord['ocr'] = {
            description: 'Extract text from an image URL using OCR.',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'The image URL to extract text from' },
                },
                required: ['url'],
            },
            execute: async (args: { url: string }) => {
                const result = await client.ocr.detect({ url: args.url });
                return result;
            },
        };
    }

    if (builtinTools.includes('imageGenerate')) {
        toolsRecord['generate_image'] = {
            description: 'Generate an image from a text prompt.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'Description of the image to generate' },
                },
                required: ['prompt'],
            },
            execute: async (args: { prompt: string }) => {
                const createResult = await client.image.generate({
                    model: options.imageModel || 'kling-v2-1',
                    prompt: args.prompt,
                });
                const result = await client.image.waitForResult(createResult);
                return {
                    images: result.data?.map((d: any) => d.url || d.b64_json?.substring(0, 100) + '...') || [],
                };
            },
        };
    }

    if (builtinTools.includes('videoGenerate')) {
        toolsRecord['generate_video'] = {
            description: 'Generate a video from a text prompt.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'Description of the video to generate' },
                },
                required: ['prompt'],
            },
            execute: async (args: { prompt: string }) => {
                const task = await client.video.create({
                    model: options.videoModel || 'kling-video-o1',
                    prompt: args.prompt,
                    duration: '5',
                    aspect_ratio: '16:9',
                });
                const result = await client.video.waitForCompletion(task.id);
                return {
                    id: result.id,
                    status: result.status,
                    videos: result.task_result?.videos || [],
                };
            },
        };
    }

    // Parse user-defined tools
    if (options.tools) {
        try {
            const toolsArray = JSON.parse(options.tools);
            if (Array.isArray(toolsArray) && toolsArray.length > 0) {
                for (const tool of toolsArray) {
                    if (tool.function?.name) {
                        toolsRecord[tool.function.name] = {
                            description: tool.function.description || '',
                            parameters: tool.function.parameters || {},
                            execute: async (_args: any) => {
                                // User-defined tools return placeholder for manual execution
                                return { result: 'Tool executed. Process the result in subsequent workflow steps.' };
                            },
                        };
                    }
                }
            }
        } catch {
            throw new NodeOperationError(
                context.getNode(),
                'Invalid tools JSON format',
                { itemIndex }
            );
        }
    }

    // Execute with AgentGraph if auto-execute is enabled and there are tools
    const hasTools = Object.keys(toolsRecord).length > 0;

    // Initialize Checkpointer if configured
    let checkpointer: Checkpointer | undefined;
    let checkpointerInfo: string | null = null;

    if (options.checkpointerType && options.checkpointerType !== 'none') {
        if (options.checkpointerType === 'memory') {
            // Use MemoryCheckpointer for in-memory state persistence
            checkpointer = new MemoryCheckpointer({ maxItems: 100 });
            checkpointerInfo = 'memory';
        } else if (options.checkpointerType === 'kodo') {
            // KodoCheckpointer for cloud-native state persistence
            const kodoBucket = options.kodoBucket as string;
            const kodoAccessKey = options.kodoAccessKey as string;
            const kodoSecretKey = options.kodoSecretKey as string;
            const kodoPrefix = (options.kodoPrefix as string) || 'n8n-threads/';

            if (!kodoBucket || !kodoAccessKey || !kodoSecretKey) {
                throw new NodeOperationError(
                    context.getNode(),
                    'Kodo bucket, access key, and secret key are required when using Kodo checkpointer',
                    { itemIndex }
                );
            }

            checkpointer = new KodoCheckpointer({
                bucket: kodoBucket,
                accessKey: kodoAccessKey,
                secretKey: kodoSecretKey,
                prefix: kodoPrefix,
            });
            checkpointerInfo = `kodo:${kodoBucket}/${kodoPrefix}`;
        } else if (options.checkpointerType === 'redis') {
            // Redis requires ioredis client - placeholder for future implementation
            // Users need to provide connection string
            checkpointerInfo = `redis:${options.checkpointerConnection || 'not-configured'}`;
            // TODO: Implement RedisCheckpointer when ioredis is available
        } else if (options.checkpointerType === 'postgres') {
            // PostgreSQL requires pg pool - placeholder for future implementation
            checkpointerInfo = `postgres:${options.checkpointerConnection || 'not-configured'}`;
            // TODO: Implement PostgresCheckpointer when pg is available
        }
    }

    // Parallel execution config (read for future use)
    const _enableParallel = options.enableParallel as boolean || false;
    const _maxConcurrency = options.maxConcurrency as number || 3;

    // Generate threadId if not provided but checkpointer is enabled
    const threadId = options.threadId || (checkpointer ? `thread-${Date.now()}` : undefined);

    const result = await generateTextWithGraph({
        client,
        model,
        prompt,
        system: systemMessage || undefined,
        maxContextTokens: options.maxContextTokens || 32000,
        maxSteps: options.maxSteps || 10,
        temperature: options.temperature,
        tools: hasTools && autoExecuteTools ? toolsRecord : undefined,
        // Checkpointer integration (SDK v0.14.0+)
        checkpointer,
        threadId,
        resumeFromCheckpoint: true,
    });

    return {
        content: result.text || '',
        reasoning: result.reasoning || '',
        steps: result.steps?.map((step: any) => ({
            type: step.type,
            toolName: step.toolName,
            toolArgs: step.toolArgs,
            toolResult: step.toolResult,
            text: step.text,
        })) || [],
        toolsExecuted: result.steps?.filter((s: any) => s.type === 'tool_call').length || 0,
        threadId: threadId || null,
        checkpointer: checkpointerInfo,
        usage: result.usage
            ? {
                promptTokens: result.usage.prompt_tokens,
                completionTokens: result.usage.completion_tokens,
                totalTokens: result.usage.total_tokens,
            }
            : null,
        _raw: result as unknown as IDataObject,
    };
}

// Audio handler
async function handleAudio(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
    const operation = context.getNodeParameter('operation', itemIndex) as string;

    if (operation === 'textToSpeech') {
        const text = context.getNodeParameter('text', itemIndex) as string;
        const voice = context.getNodeParameter('voice', itemIndex) as string;
        const options = context.getNodeParameter('options', itemIndex, {}) as {
            encoding?: string;
            speedRatio?: number;
            volume?: number;
        };

        const result = await client.tts.synthesize({
            text,
            voice_type: voice,
            encoding: options.encoding as any,
            speed_ratio: options.speedRatio,
            volume: options.volume,
        });

        // Return audio as binary data
        return {
            audio: result.audio,
            duration: result.duration,
            _raw: result as unknown as IDataObject,
        };
    }

    if (operation === 'speechToText') {
        const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
        const audioFormat = context.getNodeParameter('audioFormat', itemIndex) as string;

        // Get binary data
        context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
        const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
        const base64Audio = buffer.toString('base64');

        const result = await client.asr.transcribe({
            audio: {
                format: audioFormat as any,
                data: base64Audio,
            },
        });

        return {
            text: result.text || '',
            words: result.words || [],
            _raw: result as unknown as IDataObject,
        };
    }

    throw new NodeOperationError(
        context.getNode(),
        `Unknown audio operation: ${operation}`,
        { itemIndex }
    );
}

// Tools handler
async function handleTools(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
    const operation = context.getNodeParameter('operation', itemIndex) as string;

    if (operation === 'webSearch') {
        const query = context.getNodeParameter('query', itemIndex) as string;
        const options = context.getNodeParameter('options', itemIndex, {}) as Record<string, unknown>;

        const searchParams: {
            query: string;
            max_results?: number;
            search_type?: 'web' | 'news';
            time_filter?: 'day' | 'week' | 'month' | 'year';
            site_filter?: string[];
        } = { query };

        if (options.maxResults) searchParams.max_results = options.maxResults as number;
        if (options.searchType) searchParams.search_type = options.searchType as 'web' | 'news';
        if (options.timeFilter) searchParams.time_filter = options.timeFilter as 'day' | 'week' | 'month' | 'year';
        if (options.siteFilter) {
            const sites = (options.siteFilter as string).split(',').map(s => s.trim()).filter(s => s);
            if (sites.length > 0) searchParams.site_filter = sites;
        }

        const results = await client.sys.search(searchParams);

        return {
            results: results || [],
            query,
            _raw: results as unknown as IDataObject,
        };
    }

    if (operation === 'ocr') {
        const imageUrl = context.getNodeParameter('imageUrl', itemIndex, '') as string;
        const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;

        let ocrParams: { url?: string; image?: string };

        if (imageUrl) {
            // Use URL directly
            ocrParams = { url: imageUrl };
        } else {
            // Get from binary and create data URL
            const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
            const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
            const mimeType = binaryData.mimeType || 'image/png';
            const base64Data = buffer.toString('base64');
            // Format: data:image/png;base64,<base64_data>
            ocrParams = { image: `data:${mimeType};base64,${base64Data}` };
        }

        const result = await client.ocr.detect(ocrParams);

        return {
            text: result.text || '',
            blocks: result.blocks || [],
            _raw: result as unknown as IDataObject,
        };
    }

    if (operation === 'imageCensor') {
        const imageUrl = context.getNodeParameter('imageUrl', itemIndex) as string;
        const scenes = context.getNodeParameter('scenes', itemIndex) as string[];

        const result = await client.censor.image({
            uri: imageUrl,
            scenes: scenes as CensorScene[],
        });

        return {
            suggestion: result.suggestion,
            scenes: result.scenes,
            imageUrl,
            _raw: result as unknown as IDataObject,
        };
    }

    if (operation === 'videoCensor') {
        const videoUrl = context.getNodeParameter('videoUrl', itemIndex) as string;
        const scenes = context.getNodeParameter('censorScenes', itemIndex) as string[];
        const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex) as boolean;

        const job = await client.censor.video({
            uri: videoUrl,
            scenes: scenes as CensorScene[],
        });

        if (!waitForCompletion) {
            return {
                jobId: job.jobId,
                status: 'submitted',
                videoUrl,
            };
        }

        // Poll for completion
        let status = await client.censor.getVideoStatus(job.jobId);
        while (status.status === 'WAITING' || status.status === 'DOING') {
            await new Promise(resolve => setTimeout(resolve, 5000));
            status = await client.censor.getVideoStatus(job.jobId);
        }

        return {
            jobId: job.jobId,
            status: status.status,
            suggestion: status.suggestion,
            scenes: status.scenes,
            videoUrl,
            _raw: status as unknown as IDataObject,
        };
    }

    if (operation === 'vframe') {
        const videoUrl = context.getNodeParameter('videoUrl', itemIndex) as string;
        const frameCount = context.getNodeParameter('frameCount', itemIndex) as number;
        const videoDuration = context.getNodeParameter('videoDuration', itemIndex) as number;
        const outputWidth = context.getNodeParameter('outputWidth', itemIndex) as number;

        // Calculate uniform offsets
        const frames: Array<{ offset: number; url: string }> = [];
        if (videoDuration > 0 && frameCount > 0) {
            const step = videoDuration / (frameCount + 1);
            for (let i = 1; i <= frameCount; i++) {
                const offset = Math.round(step * i);
                // Build vframe URL: video?vframe/jpg/offset/{offset}/w/{width}
                const separator = videoUrl.includes('?') ? '|' : '?';
                const vframeUrl = `${videoUrl}${separator}vframe/jpg/offset/${offset}/w/${outputWidth}`;
                frames.push({ offset, url: vframeUrl });
            }
        }

        return {
            videoUrl,
            frameCount,
            videoDuration,
            frames,
        };
    }

    throw new NodeOperationError(
        context.getNode(),
        `Unknown tools operation: ${operation}`,
        { itemIndex }
    );
}
