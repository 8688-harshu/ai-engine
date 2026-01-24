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
        // Optimization: Only run expensive AI analysis on "Key" pages (Home, About, Contact, Terms)
        // or up to a maximum number of random pages to save time/tokens.
        const urlObj = new URL(url);
        const path = urlObj.pathname.toLowerCase();

        const isKeyPage = path === '/' ||
            path.includes('about') ||
            path.includes('contact') ||
            path.includes('trust') ||
            path.includes('terms') ||
            path.includes('privacy');

        // Skip AI for other pages to drastically speed up crawl
        if (!isKeyPage && Math.random() > 0.1) { // 10% chance to scan random deep page
            return [];
        }

        const textContent = await ContentExtractor.extract(page);

        if (!textContent || textContent.length < 50) return []; // Skip empty pages

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
        - "exactQuote": The EXACT text substring from the page that triggers this issue. This is CRITICAL for highlighting. If it is a general issue, use null.
        
        If the website seems mostly fine, return an empty list.
        
        Example Output Format:
        {
            "issues": [
                {
                    "category": "Trust",
                    "severity": "High",
                    "description": "Detected 'Urgency' dark pattern",
                    "remediation": "Remove artificial countdown timers.",
                    "userImpact": "Creates false anxiety and pressure.",
                    "exactQuote": "Only 2 minutes left to buy!"
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

            const issuesWithLocs = await Promise.all(result.issues.map(async (i: any) => {
                let currentLoc = 'Page Body';

                if (i.exactQuote) {
                    // Try to find the selector for this text
                    try {
                        const selector = await page.evaluate((quote: string) => {
                            // Simple text search in DOM
                            const elements = Array.from(document.querySelectorAll('body *'));
                            // Filter for leaf nodes or nodes with specific text
                            const match = elements.find(el => el.childNodes.length > 0 && Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent?.includes(quote)));

                            if (!match) return null;

                            // Generate a simple path selector
                            const getPath = (el: Element): string => {
                                if (el.id) return '#' + el.id;
                                if (el === document.body) return 'body';
                                if (!el.parentElement) return el.tagName.toLowerCase();

                                const siblings = Array.from(el.parentElement.children);
                                const index = siblings.indexOf(el) + 1;
                                return getPath(el.parentElement) + ' > ' + el.tagName.toLowerCase() + ':nth-child(' + index + ')';
                            };

                            return getPath(match);
                        }, i.exactQuote);

                        if (selector) currentLoc = selector;
                    } catch (e) {
                        console.warn('Failed to locate element for quote:', i.exactQuote);
                    }
                }

                return {
                    id: uuidv4(),
                    url: url,
                    category: i.category || 'Semantic',
                    severity: i.severity || 'Medium',
                    description: i.description,
                    remediation: i.remediation,
                    userImpact: i.userImpact,
                    evidence: 'AI Analysis',
                    location: currentLoc,
                    snippet: i.exactQuote || undefined
                };
            }));

            return issuesWithLocs;

        } catch (e) {
            console.error('Failed to parse AI response:', e);
            console.debug('Raw AI Response:', responseText);
            return [];
        }
    }
}
