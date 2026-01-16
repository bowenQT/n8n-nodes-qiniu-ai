import { INodeProperties } from 'n8n-workflow';

export const audioOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['audio'],
            },
        },
        options: [
            {
                name: 'Text to Speech',
                value: 'textToSpeech',
                description: 'Convert text to speech audio',
                action: 'Text to speech',
            },
            {
                name: 'Speech to Text',
                value: 'speechToText',
                description: 'Transcribe audio to text',
                action: 'Speech to text',
            },
        ],
        default: 'textToSpeech',
    },
];

export const audioFields: INodeProperties[] = [
    // TTS: Text
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['audio'],
                operation: ['textToSpeech'],
            },
        },
        default: '',
        description: 'The text to convert to speech',
    },
    // TTS: Voice
    {
        displayName: 'Voice',
        name: 'voice',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['audio'],
                operation: ['textToSpeech'],
            },
        },
        default: 'qiniu_zh_female_tmjxxy',
        description: 'Voice ID to use for synthesis',
    },
    // TTS Options
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
            show: {
                resource: ['audio'],
                operation: ['textToSpeech'],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Encoding',
                name: 'encoding',
                type: 'options',
                options: [
                    { name: 'MP3', value: 'mp3' },
                    { name: 'WAV', value: 'wav' },
                    { name: 'PCM', value: 'pcm' },
                ],
                default: 'mp3',
                description: 'Audio output format',
            },
            {
                displayName: 'Speed Ratio',
                name: 'speedRatio',
                type: 'number',
                typeOptions: {
                    minValue: 0.5,
                    maxValue: 2.0,
                    numberPrecision: 1,
                },
                default: 1.0,
                description: 'Speech speed (0.5 - 2.0)',
            },
            {
                displayName: 'Volume',
                name: 'volume',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1,
                    numberPrecision: 1,
                },
                default: 1.0,
                description: 'Volume level (0.0 - 1.0)',
            },
        ],
    },
    // ASR: Binary Property
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['audio'],
                operation: ['speechToText'],
            },
        },
        default: 'data',
        description: 'Name of the binary property containing the audio file',
    },
    // ASR: Audio Format
    {
        displayName: 'Audio Format',
        name: 'audioFormat',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['audio'],
                operation: ['speechToText'],
            },
        },
        options: [
            { name: 'WAV', value: 'wav' },
            { name: 'MP3', value: 'mp3' },
            { name: 'PCM', value: 'pcm' },
            { name: 'M4A', value: 'm4a' },
        ],
        default: 'wav',
        description: 'Format of the input audio',
    },
];
