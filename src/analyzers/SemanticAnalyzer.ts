import { Page } from 'playwright'; // Although we extract text, we might want page for screenshots later
import { ContentExtractor } from '../crawler/ContentExtractor';
import { LLMService } from '../services/LLMService';
import { Issue } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SemanticAnalyzer {
    private llmService: LLMService;

    constructor() {
        this.llmService = new LLMService();
    }

    async analyze(page: Page, url: string): Promise<Issue[]> {
        const textContent = await ContentExtractor.extract(page);

        const prompt = `
        You are an expert website quality and trust auditor. Analyze the following website text content for issues related to:
        1. Trust & Legitimacy (scams, misleading claims, dark patterns)
        2. Professionalism (grammar, spelling, inconsistent tone)
        3. User Experience from a content perspective (confusing language, lack of clarity)
        
        Return a JSON object with a list of specific "issues".
        Each issue must have:
        - "category": one of ["Trust", "Content", "Semantic"]
        - "severity": "High", "Medium", or "Low"
        - "description": A concise description of the issue.
        - "remediation": Advice on how to fix it.
        - "userImpact": How this affects the user.

        If the website seems mostly fine, return an empty list.
        
        Example Output Format:
        {
            "issues": [
                {
                    "category": "Trust",
                    "severity": "High",
                    "description": "Detected 'Urgency' dark pattern: 'Only 2 minutes left to buy!'",
                    "remediation": "Remove artificial countdown timers.",
                    "userImpact": "Creates false anxiety and pressure."
                }
            ]
        }
        
        Do not include markdown formatting like \`\`\`json. Return raw JSON.
        `;

        const responseText = await this.llmService.analyzeContext(textContent, prompt);

        try {
            // Clean up if LLM adds markdown blocks despite instruction
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);

            if (!result.issues || !Array.isArray(result.issues)) return [];

            return result.issues.map((i: any) => ({
                id: uuidv4(),
                url: url,
                category: i.category || 'Semantic',
                severity: i.severity || 'Medium',
                description: i.description,
                remediation: i.remediation,
                userImpact: i.userImpact,
                evidence: 'AI Analysis'
            }));

        } catch (e) {
            console.error('Failed to parse AI response:', e);
            console.debug('Raw AI Response:', responseText);
            return [];
        }
    }
}
