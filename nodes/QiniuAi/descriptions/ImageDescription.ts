import { INodeProperties } from 'n8n-workflow';
import { IMAGE_MODEL_OPTIONS, ASPECT_RATIO_OPTIONS } from '../constants';

export const imageOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['image'],
            },
        },
        options: [
            {
                name: 'Generate',
                value: 'generate',
                description: 'Generate an image from text',
                action: 'Generate an image',
            },
            {
                name: 'Edit',
                value: 'edit',
                description: 'Edit or transform an image',
                action: 'Edit an image',
            },
        ],
        default: 'generate',
    },
];

export const imageFields: INodeProperties[] = [
    // Model
    {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['image'],
            },
        },
        options: IMAGE_MODEL_OPTIONS,
        default: 'kling-v2-1',
        description: 'The model to use for image generation',
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
                resource: ['image'],
            },
        },
        default: '',
        description: 'Description of the image to generate',
    },
    // Wait for Completion
    {
        displayName: 'Wait for Completion',
        name: 'waitForCompletion',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['image'],
            },
        },
        default: true,
        description: 'Whether to wait for the image to be fully generated before returning',
    },
    // Reference Image (for edit)
    {
        displayName: 'Reference Image URL',
        name: 'referenceImageUrl',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['image'],
                operation: ['edit'],
            },
        },
        default: '',
        description: 'URL of the image to edit',
    },
    // Binary Input (for edit)
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['image'],
                operation: ['edit'],
            },
        },
        default: 'data',
        description: 'Name of the binary property containing the image to edit',
    },
    // Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['image'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Aspect Ratio',
                name: 'aspectRatio',
                type: 'options',
                options: ASPECT_RATIO_OPTIONS,
                default: '1:1',
                description: 'Aspect ratio of the generated image',
            },
            {
                displayName: 'Negative Prompt',
                name: 'negativePrompt',
                type: 'string',
                typeOptions: {
                    rows: 2,
                },
                default: '',
                description: 'Things to avoid in the generated image',
            },
            {
                displayName: 'Count',
                name: 'n',
                type: 'number',
                typeOptions: {
                    minValue: 1,
                    maxValue: 4,
                },
                default: 1,
                description: 'Number of images to generate',
            },
            {
                displayName: 'Strength',
                name: 'strength',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1,
                    numberPrecision: 2,
                },
                default: 0.5,
                description: 'How much to transform the reference image (0 = keep original, 1 = ignore original)',
            },
            {
                displayName: 'Image Reference Type',
                name: 'imageReference',
                type: 'options',
                options: [
                    { name: 'Subject', value: 'subject' },
                    { name: 'Face', value: 'face' },
                ],
                default: 'subject',
                description: 'Type of reference to use from the input image',
            },
            {
                displayName: 'Image Size',
                name: 'imageSize',
                type: 'options',
                options: [
                    { name: '1K', value: '1K' },
                    { name: '2K', value: '2K' },
                    { name: '4K', value: '4K' },
                ],
                default: '1K',
                description: 'Output image resolution',
            },
            {
                displayName: 'Mask (Base64)',
                name: 'mask',
                type: 'string',
                default: '',
                description: 'Base64-encoded mask for inpainting (white = edit area)',
            },
        ],
    },
];
