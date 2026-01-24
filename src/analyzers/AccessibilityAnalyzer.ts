import { Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { Issue } from '../types';

export class AccessibilityAnalyzer {
    constructor() { }

    async analyze(page: Page): Promise<Issue[]> {
        // console.log('Running Accessibility Scan...');
        try {
            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            return results.violations.map((v: any) => ({
                id: `a11y-${v.id}-${Math.floor(Math.random() * 10000)}`,
                category: 'Accessibility',
                severity: v.impact === 'critical' || v.impact === 'serious' ? 'High' : 'Medium',
                url: page.url(),
                description: v.help,
                userImpact: v.description,
                remediation: `See: ${v.helpUrl}`,
                evidence: JSON.stringify(v.nodes.map((n: any) => n.html).slice(0, 3))
            }));
        } catch (e) {
            console.error('Axe accessibility scan failed:', e);
            return [];
        }
    }
}
