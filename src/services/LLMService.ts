import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import chalk from 'chalk';

export class LLMService {
    private model: any;

    constructor() {
        if (!config.geminiApiKey) {
            console.warn('Gemini API Key is missing. AI features will be disabled.');
            return;
        }
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }

    async analyzeContext(context: string, prompt: string): Promise<string> {
        if (!this.model) return 'AI Analysis Disabled: No API Key provided.';

        try {
            const result = await this.model.generateContent([prompt, context]);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            const msg = error.message || '';
            if (msg.includes('404') || msg.includes('not found')) {
                console.error(chalk.red('AI Error: Model not found. Please enable "Generative Language API" in Google Cloud Console.'));
                return 'AI Analysis Unavailable: API Not Enabled.';
            }
            console.error('LLM Analysis Failed:', msg);
            return 'AI Analysis Failed due to an error.';
        }
    }
}
