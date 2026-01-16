import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    IDataObject,
} from 'n8n-workflow';

import { QiniuAI, generateTextWithGraph, APIError } from '@bowenqt/qiniu-ai-sdk';

import { chatOperations, chatFields } from './descriptions/ChatDescription';
import { imageOperations, imageFields } from './descriptions/ImageDescription';
import { videoOperations, videoFields } from './descriptions/VideoDescription';
import { agentOperations, agentFields } from './descriptions/AgentDescription';

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
                    result = await handleImage(this, client, i);
                } else if (resource === 'video') {
                    result = await handleVideo(this, client, i);
                } else if (resource === 'agent') {
                    result = await handleAgent(this, client, i);
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

// Image handler
async function handleImage(
    context: IExecuteFunctions,
    client: QiniuAI,
    itemIndex: number
): Promise<IDataObject> {
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

    // Normalize output
    return {
        images: result.data?.map((img: any) => ({
            url: img.url || undefined,
            b64_json: img.b64_json || undefined,
            index: img.index,
        })) || [],
        status: result.status || 'unknown',
        taskId: result.task_id,
        isSync: result.isSync,
        _raw: result,
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

    // Generate
    const model = context.getNodeParameter('model', itemIndex) as string;
    const prompt = context.getNodeParameter('prompt', itemIndex) as string;
    const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex, true) as boolean;
    const firstFrameUrl = context.getNodeParameter('firstFrameUrl', itemIndex, '') as string;
    const lastFrameUrl = context.getNodeParameter('lastFrameUrl', itemIndex, '') as string;
    const options = context.getNodeParameter('options', itemIndex, {}) as Record<string, unknown>;

    const params: any = {
        model,
        prompt,
        negative_prompt: options.negativePrompt,
        aspect_ratio: options.aspectRatio,
    };

    // Frame control
    if (firstFrameUrl || lastFrameUrl) {
        params.frames = {};
        if (firstFrameUrl) params.frames.first = { url: firstFrameUrl };
        if (lastFrameUrl) params.frames.last = { url: lastFrameUrl };
    }

    // Model-specific options
    if (model.includes('kling')) {
        const klingOptions = context.getNodeParameter('klingOptions', itemIndex, {}) as Record<string, unknown>;
        if (klingOptions.duration) params.duration = klingOptions.duration;
        if (klingOptions.mode) params.mode = klingOptions.mode;
        if (klingOptions.cfgScale) params.cfg_scale = klingOptions.cfgScale;
        if (klingOptions.size) params.size = klingOptions.size;
    }

    if (model.includes('veo')) {
        const veoOptions = context.getNodeParameter('veoOptions', itemIndex, {}) as Record<string, unknown>;
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
    const options = context.getNodeParameter('options', itemIndex, {}) as {
        maxContextTokens?: number;
        maxSteps?: number;
        threadId?: string;
        tools?: string;
        temperature?: number;
    };

    // Parse tools - convert array to Record<string, Tool>
    let toolsRecord: Record<string, any> | undefined;
    if (options.tools) {
        try {
            const toolsArray = JSON.parse(options.tools);
            if (Array.isArray(toolsArray) && toolsArray.length > 0) {
                toolsRecord = {};
                for (const tool of toolsArray) {
                    if (tool.function?.name) {
                        toolsRecord[tool.function.name] = {
                            description: tool.function.description || '',
                            parameters: tool.function.parameters || {},
                            execute: async (args: any) => {
                                // Tools executed by the agent - we return a placeholder
                                return { result: 'Tool execution not implemented in n8n node' };
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

    const result = await generateTextWithGraph({
        client,
        model,
        prompt,
        system: systemMessage || undefined,
        maxContextTokens: options.maxContextTokens || 32000,
        maxSteps: options.maxSteps || 10,
        temperature: options.temperature,
        tools: toolsRecord,
    });

    return {
        content: result.text || '',
        steps: result.steps?.map((step: any) => ({
            type: step.type,
            toolName: step.toolName,
            toolArgs: step.toolArgs,
            toolResult: step.toolResult,
            text: step.text,
        })) || [],
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
