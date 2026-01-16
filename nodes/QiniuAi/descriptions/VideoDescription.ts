import { INodeProperties } from 'n8n-workflow';
import { VIDEO_MODEL_OPTIONS, VIDEO_ASPECT_RATIO_OPTIONS } from '../constants';

export const videoOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['video'],
            },
        },
        options: [
            {
                name: 'Generate',
                value: 'generate',
                description: 'Generate a video from text or image',
                action: 'Generate a video',
            },
            {
                name: 'Remix',
                value: 'remix',
                description: 'Remix an existing video with new prompt or parameters',
                action: 'Remix a video',
            },
            {
                name: 'Get Status',
                value: 'getStatus',
                description: 'Get the status of a video generation task',
                action: 'Get video status',
            },
        ],
        default: 'generate',
    },
];

export const videoFields: INodeProperties[] = [
    // Model
    {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        options: VIDEO_MODEL_OPTIONS,
        default: 'kling-video-o1',
        description: 'The model to use for video generation',
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
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        description: 'Description of the video to generate',
    },
    // Task ID (for getStatus)
    {
        displayName: 'Task ID',
        name: 'taskId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['getStatus'],
            },
        },
        default: '',
        description: 'The ID of the video generation task',
    },
    // Wait for Completion
    {
        displayName: 'Wait for Completion',
        name: 'waitForCompletion',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: true,
        description: 'Whether to wait for the video to be fully generated before returning',
    },
    // Frame Control
    {
        displayName: 'First Frame Image URL',
        name: 'firstFrameUrl',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        description: 'URL of the first frame image. Leave empty to use binary data from previous node.',
    },
    {
        displayName: 'First Frame Binary Property',
        name: 'firstFrameBinaryProperty',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        placeholder: 'data',
        description: 'Binary property name containing the first frame image (from Image node output)',
    },
    {
        displayName: 'Last Frame Image URL',
        name: 'lastFrameUrl',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        description: 'URL of the last frame image. Leave empty to use binary data from previous node.',
    },
    {
        displayName: 'Last Frame Binary Property',
        name: 'lastFrameBinaryProperty',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        placeholder: 'data_1',
        description: 'Binary property name containing the last frame image (from Image node output)',
    },
    // Aspect Ratio (required when no first frame)
    {
        displayName: 'Aspect Ratio',
        name: 'aspectRatio',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        options: VIDEO_ASPECT_RATIO_OPTIONS,
        default: '16:9',
        description: 'Aspect ratio of the generated video (required when no first frame image)',
    },
    // Common Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Negative Prompt',
                name: 'negativePrompt',
                type: 'string',
                typeOptions: {
                    rows: 2,
                },
                default: '',
                description: 'Things to avoid in the generated video',
            },
        ],
    },
    // Kling-specific options
    {
        displayName: 'Kling Options',
        name: 'klingOptions',
        type: 'collection',
        placeholder: 'Add Kling Option',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
                model: ['kling-video-o1', 'kling-v2-1', 'kling-v2-5-turbo'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Duration',
                name: 'duration',
                type: 'options',
                options: [
                    { name: '5 seconds', value: '5' },
                    { name: '10 seconds', value: '10' },
                ],
                default: '5',
                description: 'Video duration in seconds',
            },
            {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                    { name: 'Standard', value: 'std' },
                    { name: 'Professional', value: 'pro' },
                ],
                default: 'std',
                description: 'Generation mode',
            },
            {
                displayName: 'CFG Scale',
                name: 'cfgScale',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 20,
                    numberPrecision: 1,
                },
                default: 7,
                description: 'CFG guidance scale',
            },
            {
                displayName: 'Size',
                name: 'size',
                type: 'string',
                default: '',
                placeholder: '1920x1080',
                description: 'Video resolution (e.g., 1920x1080)',
            },
        ],
    },
    // Veo-specific options
    {
        displayName: 'Veo Options',
        name: 'veoOptions',
        type: 'collection',
        placeholder: 'Add Veo Option',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
                model: [
                    'veo-2.0-generate-001',
                    'veo-3.0-generate-preview',
                    'veo-3.0-fast-generate-preview',
                    'veo-3.1-generate-preview',
                    'veo-3.1-fast-generate-preview',
                ],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Duration (seconds)',
                name: 'duration',
                type: 'options',
                options: [
                    { name: '8 seconds', value: 8 },
                ],
                default: 8,
                description: 'Video duration in seconds (Veo only supports 8 seconds)',
            },
            {
                displayName: 'Generate Audio',
                name: 'generateAudio',
                type: 'boolean',
                default: false,
                description: 'Whether to generate audio for the video',
            },
            {
                displayName: 'Resolution',
                name: 'resolution',
                type: 'options',
                options: [
                    { name: '720p', value: '720p' },
                    { name: '1080p', value: '1080p' },
                ],
                default: '720p',
                description: 'Output video resolution',
            },
            {
                displayName: 'Sample Count',
                name: 'sampleCount',
                type: 'number',
                typeOptions: {
                    minValue: 1,
                    maxValue: 4,
                },
                default: 1,
                description: 'Number of videos to generate',
            },
            {
                displayName: 'Person Generation',
                name: 'personGeneration',
                type: 'options',
                options: [
                    { name: 'Allow Adult', value: 'allow_adult' },
                    { name: "Don't Allow", value: 'dont_allow' },
                ],
                default: 'allow_adult',
                description: 'Control person generation in video',
            },
            {
                displayName: 'Seed',
                name: 'seed',
                type: 'number',
                default: 0,
                description: 'Random seed for reproducible results (0 = random)',
            },
        ],
    },
    // Video Reference (video_list) for video-to-video generation
    {
        displayName: 'Video Reference URL',
        name: 'videoReferenceUrl',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: '',
        placeholder: 'https://example.com/reference-video.mp4',
        description: 'URL of a reference video for video-to-video generation',
    },
    {
        displayName: 'Keep Original Sound',
        name: 'keepOriginalSound',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['generate'],
            },
        },
        default: false,
        description: 'Whether to keep the original sound from the reference video',
    },
    // Remix Operation Fields
    {
        displayName: 'Source Video ID',
        name: 'sourceVideoId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['remix'],
            },
        },
        default: '',
        description: 'The ID of the video to remix',
    },
    {
        displayName: 'New Prompt',
        name: 'remixPrompt',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['remix'],
            },
        },
        default: '',
        description: 'New prompt to guide the remix (optional)',
    },
    {
        displayName: 'Wait for Completion',
        name: 'waitForCompletion',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['remix'],
            },
        },
        default: true,
        description: 'Whether to wait for the remix to complete before returning',
    },
    {
        displayName: 'Remix Options',
        name: 'remixOptions',
        type: 'collection',
        placeholder: 'Add Remix Option',
        displayOptions: {
            show: {
                resource: ['video'],
                operation: ['remix'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Duration',
                name: 'duration',
                type: 'options',
                options: [
                    { name: '5 seconds', value: '5' },
                    { name: '10 seconds', value: '10' },
                ],
                default: '5',
                description: 'Duration of the remixed video',
            },
            {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                    { name: 'Standard', value: 'std' },
                    { name: 'Professional', value: 'pro' },
                ],
                default: 'std',
                description: 'Generation quality mode',
            },
            {
                displayName: 'Negative Prompt',
                name: 'negativePrompt',
                type: 'string',
                default: '',
                description: 'What to avoid in the video',
            },
        ],
    },
];
