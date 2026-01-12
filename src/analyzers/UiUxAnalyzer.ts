import { Page } from 'playwright';
import { Issue } from '../types';

export class UiUxAnalyzer {
    async analyze(page: Page): Promise<Issue[]> {
        const issues: Issue[] = [];
        const url = page.url();

        const evaluations = await page.evaluate(() => {
            const results = [];

            // Horizontal Scroll Check
            if (document.body.scrollWidth > window.innerWidth) {
                results.push({
                    desc: 'Horizontal Scroll detected (Content overflow)',
                    impact: 'Page is wider than the screen, breaking mobile layout.',
                    remediation: 'Fix CSS width constraints or overflow properties.'
                });
            }

            // Viewport Meta Check
            if (!document.querySelector('meta[name="viewport"]')) {
                results.push({
                    desc: 'Missing Viewport Meta Tag',
                    impact: 'Page will not scale correctly on mobile devices.',
                    remediation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
                });
            }

            // Small Font Check (Heuristic)
            // Check a few paragraphs
            const p = document.querySelector('p');
            if (p) {
                const size = window.getComputedStyle(p).fontSize;
                if (parseFloat(size) < 12) {
                    results.push({
                        desc: 'Font size is too small (< 12px)',
                        impact: 'Hard to read for many users.',
                        remediation: 'Increase base font size.'
                    });
                }
            }

            return results;
        });

        for (const e of evaluations) {
            issues.push({
                id: `uiux-${Math.random()}`,
                category: 'UI/UX',
                severity: 'High',
                url,
                description: e.desc,
                userImpact: e.impact,
                remediation: e.remediation
            });
        }

        return issues;
    }
}
