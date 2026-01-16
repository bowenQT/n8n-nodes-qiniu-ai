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
        ],
    },
];
