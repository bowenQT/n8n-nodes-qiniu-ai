import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class QiniuAiApi implements ICredentialType {
    name = 'qiniuAiApi';
    displayName = 'Qiniu AI API';
    documentationUrl = 'https://github.com/bowenQT/qiniu-ai-sdk';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
            description: 'Your Qiniu AI API key',
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.qnaigc.com/v1',
            description: 'API base URL (optional, for custom endpoints)',
        },
    ];
}
