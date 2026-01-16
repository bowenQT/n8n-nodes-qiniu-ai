import { INodeProperties } from 'n8n-workflow';

export const toolsOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['tools'],
            },
        },
        options: [
            {
                name: 'Web Search',
                value: 'webSearch',
                description: 'Search the web using AI',
                action: 'Web search',
            },
            {
                name: 'OCR',
                value: 'ocr',
                description: 'Extract text from images',
                action: 'OCR',
            },
        ],
        default: 'webSearch',
    },
];

export const toolsFields: INodeProperties[] = [
    // Web Search: Query
    {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['tools'],
                operation: ['webSearch'],
            },
        },
        default: '',
        description: 'The search query',
    },
    // Web Search Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['tools'],
                operation: ['webSearch'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Max Results',
                name: 'maxResults',
                type: 'number',
                typeOptions: {
                    minValue: 1,
                    maxValue: 20,
                },
                default: 5,
                description: 'Maximum number of results to return',
            },
            {
                displayName: 'Search Type',
                name: 'searchType',
                type: 'options',
                options: [
                    { name: 'Web', value: 'web' },
                    { name: 'News', value: 'news' },
                ],
                default: 'web',
                description: 'Type of search to perform',
            },
            {
                displayName: 'Time Filter',
                name: 'timeFilter',
                type: 'options',
                options: [
                    { name: 'Any Time', value: '' },
                    { name: 'Past Day', value: 'day' },
                    { name: 'Past Week', value: 'week' },
                    { name: 'Past Month', value: 'month' },
                    { name: 'Past Year', value: 'year' },
                ],
                default: '',
                description: 'Filter results by time period',
            },
            {
                displayName: 'Site Filter',
                name: 'siteFilter',
                type: 'string',
                default: '',
                placeholder: 'github.com, stackoverflow.com',
                description: 'Comma-separated list of sites to search within',
            },
        ],
    },
    // OCR: Image URL
    {
        displayName: 'Image URL',
        name: 'imageUrl',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['tools'],
                operation: ['ocr'],
            },
        },
        default: '',
        description: 'URL of the image to analyze',
    },
    // OCR: Binary Property
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['tools'],
                operation: ['ocr'],
            },
        },
        default: 'data',
        description: 'Name of the binary property containing the image',
    },
];
