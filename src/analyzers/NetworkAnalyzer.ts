import { Response } from 'playwright';
import { Issue } from '../types';

export class NetworkAnalyzer {
    private issues: Issue[] = [];

    constructor() { }

    analyzeResponse(response: Response): Issue[] {
        const issues: Issue[] = [];
        const url = response.url();
        const status = response.status();
        const timing = response.request().timing();

        // Check for Status Errors
        if (status >= 400) {
            issues.push({
                id: `net-error-${status}-${Math.random()}`,
                category: 'Functional', // HTTP errors affect functionality
                severity: status >= 500 ? 'High' : 'Medium',
                url,
                description: `HTTP Error ${status} for resource`,
                userImpact: 'Content failed to load, potentially leaving broken UI or functionality.',
                remediation: 'Check server logs or file paths.'
            });
        }

        // Check for Slow TTFB (Time To First Byte)
        const ttfb = timing.responseStart - timing.startTime;
        if (ttfb > 1000) {
            issues.push({
                id: `perf-ttfb-${Math.random()}`,
                category: 'Performance',
                severity: ttfb > 3000 ? 'High' : 'Medium',
                url,
                description: `Slow Server Response (TTFB: ${Math.round(ttfb)}ms)`,
                userImpact: 'User has to wait a long time before seeing any content.',
                remediation: 'Optimize server-side processing or database queries.'
            });
        }

        return issues;
    }
}
