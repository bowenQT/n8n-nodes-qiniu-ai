import { INodeProperties } from 'n8n-workflow';
import { CHAT_MODEL_OPTIONS } from '../constants';

export const chatOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['chat'],
            },
        },
        options: [
            {
                name: 'Completion',
                value: 'completion',
                description: 'Generate a chat completion',
                action: 'Generate a chat completion',
            },
        ],
        default: 'completion',
    },
];

export const chatFields: INodeProperties[] = [
    // Model
    {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['completion'],
            },
        },
        options: CHAT_MODEL_OPTIONS,
        default: 'qwen3-max',
        description: 'The model to use for chat completion',
    },
    // Input Type
    {
        displayName: 'Input Type',
        name: 'inputType',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['completion'],
            },
        },
        options: [
            {
                name: 'Simple Prompt',
                value: 'simple',
                description: 'Single text prompt',
            },
            {
                name: 'Message Array',
                value: 'messages',
                description: 'Full conversation history',
            },
        ],
        default: 'simple',
    },
    // Prompt (simple mode)
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
                resource: ['chat'],
                operation: ['completion'],
                inputType: ['simple'],
            },
        },
        default: '',
        description: 'The prompt to send to the model',
    },
    // Messages (advanced mode)
    {
        displayName: 'Messages',
        name: 'messages',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['completion'],
                inputType: ['messages'],
            },
        },
        default: {},
        options: [
            {
                name: 'messageValues',
                displayName: 'Message',
                values: [
                    {
                        displayName: 'Role',
                        name: 'role',
                        type: 'options',
                        options: [
                            { name: 'System', value: 'system' },
                            { name: 'User', value: 'user' },
                            { name: 'Assistant', value: 'assistant' },
                        ],
                        default: 'user',
                    },
                    {
                        displayName: 'Content',
                        name: 'content',
                        type: 'string',
                        typeOptions: {
                            rows: 3,
                        },
                        default: '',
                    },
                ],
            },
        ],
    },
    // System Message
    {
        displayName: 'System Message',
        name: 'systemMessage',
        type: 'string',
        typeOptions: {
            rows: 3,
        },
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['completion'],
                inputType: ['simple'],
            },
        },
        default: '',
        description: 'Optional system message to set context',
    },
    // Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['completion'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Temperature',
                name: 'temperature',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 2,
                    numberPrecision: 1,
                },
                default: 1,
                description: 'Controls randomness (0 = deterministic, 2 = very random)',
            },
            {
                displayName: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                typeOptions: {
                    minValue: 1,
                },
                default: 4096,
                description: 'Maximum number of tokens to generate',
            },
            {
                displayName: 'JSON Mode',
                name: 'jsonMode',
                type: 'boolean',
                default: false,
                description: 'Whether to output valid JSON',
            },
            {
                displayName: 'Top P',
                name: 'topP',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1,
                    numberPrecision: 2,
                },
                default: 1,
                description: 'Nucleus sampling parameter',
            },
        ],
    },
];
