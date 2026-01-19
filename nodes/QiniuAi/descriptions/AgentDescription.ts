import { INodeProperties } from 'n8n-workflow';
import { CHAT_MODEL_OPTIONS } from '../constants';

export const agentOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        options: [
            {
                name: 'Run Graph',
                value: 'runGraph',
                description: 'Execute an AI agent with tools and memory',
                action: 'Run AI agent',
            },
        ],
        default: 'runGraph',
    },
];

export const agentFields: INodeProperties[] = [
    // Model
    {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        options: CHAT_MODEL_OPTIONS,
        default: 'qwen3-max',
        description: 'The model to use for the agent',
    },
    // Prompt
    {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        default: '',
        description: 'The user goal or query for the agent',
    },
    // System Message
    {
        displayName: 'System Message',
        name: 'systemMessage',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        default: '',
        description: 'Agent persona and instructions',
    },
    // Built-in Tools
    {
        displayName: 'Built-in Tools',
        name: 'builtinTools',
        type: 'multiOptions',
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        options: [
            {
                name: 'Web Search',
                value: 'webSearch',
                description: 'Search the web for information',
            },
            {
                name: 'OCR',
                value: 'ocr',
                description: 'Extract text from images',
            },
            {
                name: 'Image Generate',
                value: 'imageGenerate',
                description: 'Generate images from text prompts',
            },
            {
                name: 'Video Generate',
                value: 'videoGenerate',
                description: 'Generate videos from text prompts',
            },
        ],
        default: [],
        description: 'Built-in tools that the agent can use automatically',
    },
    // Auto Execute Tools
    {
        displayName: 'Auto Execute Tools',
        name: 'autoExecuteTools',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        default: true,
        description: 'Automatically execute tool calls and return results (ReAct loop)',
    },
    // Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['agent'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Max Context Tokens',
                name: 'maxContextTokens',
                type: 'number',
                typeOptions: {
                    minValue: 1000,
                },
                default: 32000,
                description: 'Maximum context tokens (SDK auto-compacts when exceeded)',
            },
            {
                displayName: 'Max Steps',
                name: 'maxSteps',
                type: 'number',
                typeOptions: {
                    minValue: 1,
                    maxValue: 50,
                },
                default: 10,
                description: 'Maximum number of agent steps (prevents infinite loops)',
            },
            {
                displayName: 'Thread ID',
                name: 'threadId',
                type: 'string',
                default: '',
                description: 'Session ID for memory continuity (leave empty for new session)',
            },
            {
                displayName: 'Tools (JSON)',
                name: 'tools',
                type: 'json',
                default: '[]',
                description: 'Array of tool definitions in OpenAI function format',
            },
            {
                displayName: 'Temperature',
                name: 'temperature',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 2,
                    numberPrecision: 1,
                },
                default: 0.7,
                description: 'Controls randomness',
            },
            {
                displayName: 'Image Model (for Built-in Tool)',
                name: 'imageModel',
                type: 'options',
                options: [
                    { name: 'Kling V2.1', value: 'kling-v2-1' },
                    { name: 'Kling V2', value: 'kling-v2' },
                    { name: 'Kling V1.5', value: 'kling-v1-5' },
                    { name: 'Gemini 3.0 Pro Image', value: 'gemini-3.0-pro-image-preview' },
                ],
                default: 'kling-v2-1',
                description: 'Model to use for the generate_image built-in tool',
            },
            {
                displayName: 'Video Model (for Built-in Tool)',
                name: 'videoModel',
                type: 'options',
                options: [
                    { name: 'Kling Video O1', value: 'kling-video-o1' },
                    { name: 'Kling V2.1', value: 'kling-v2-1' },
                    { name: 'Kling V2.5 Turbo', value: 'kling-v2-5-turbo' },
                    { name: 'Veo 2.0 Generate', value: 'veo-2.0-generate-001' },
                ],
                default: 'kling-video-o1',
                description: 'Model to use for the generate_video built-in tool',
            },
            {
                displayName: 'Checkpointer Type',
                name: 'checkpointerType',
                type: 'options',
                options: [
                    { name: 'None', value: 'none' },
                    { name: 'Memory', value: 'memory' },
                    { name: 'Kodo (Cloud)', value: 'kodo' },
                    { name: 'Redis', value: 'redis' },
                    { name: 'PostgreSQL', value: 'postgres' },
                ],
                default: 'none',
                description: 'Type of state persistence for multi-turn conversations',
            },
            {
                displayName: 'Checkpointer Connection String',
                name: 'checkpointerConnection',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        checkpointerType: ['redis', 'postgres'],
                    },
                },
                default: '',
                placeholder: 'redis://localhost:6379 or postgresql://user:pass@localhost:5432/db',
                description: 'Connection string for the checkpointer backend',
            },
            {
                displayName: 'Kodo Bucket',
                name: 'kodoBucket',
                type: 'string',
                displayOptions: {
                    show: {
                        checkpointerType: ['kodo'],
                    },
                },
                default: '',
                placeholder: 'my-ai-sessions',
                description: 'Qiniu Kodo bucket name for state storage',
            },
            {
                displayName: 'Kodo Access Key',
                name: 'kodoAccessKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        checkpointerType: ['kodo'],
                    },
                },
                default: '',
                description: 'Qiniu Access Key (AK)',
            },
            {
                displayName: 'Kodo Secret Key',
                name: 'kodoSecretKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        checkpointerType: ['kodo'],
                    },
                },
                default: '',
                description: 'Qiniu Secret Key (SK)',
            },
            {
                displayName: 'Kodo Prefix',
                name: 'kodoPrefix',
                type: 'string',
                displayOptions: {
                    show: {
                        checkpointerType: ['kodo'],
                    },
                },
                default: 'n8n-threads/',
                description: 'Object key prefix for session states',
            },
        ],
    },
];
