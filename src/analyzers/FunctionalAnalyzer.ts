import { Page } from 'playwright';
import { Issue } from '../types';

export class FunctionalAnalyzer {
    private issues: Issue[] = [];

    constructor() { }

    async analyze(page: Page): Promise<Issue[]> {
        this.issues = [];
        const url = page.url();

        // 1. Listen for console errors (needs to be attached before nav, but we can catch current state issues too)
        // Note: In a real flow, we'd attach this listener in the Navigator and pass logs here.
        // For now, checks are post-load.

        // 2. Client-side Content & SEO Checks
        const issues = await page.evaluate(() => {
            const foundIssues: any[] = [];

            // Title Check
            if (document.title.length < 5) {
                foundIssues.push({
                    type: 'Content',
                    desc: 'Page title is too short or missing',
                    impact: 'Poor SEO and user context.',
                    remediation: 'Add a descriptive <title> tag.'
                });
            }

            // Meta Description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc || !metaDesc.getAttribute('content')) {
                foundIssues.push({
                    type: 'Content',
                    desc: 'Missing Meta Description',
                    impact: 'Search engines and social shares will look broken.',
                    remediation: 'Add a <meta name="description"> tag.'
                });
            }

            // H1 Check
            const h1s = document.querySelectorAll('h1');
            if (h1s.length === 0) {
                foundIssues.push({
                    type: 'Available Content',
                    desc: 'No <h1> heading found',
                    impact: 'Poor document structure and accessibility.',
                    remediation: 'Add exactly one <h1> heading per page.'
                });
            } else if (h1s.length > 1) {
                foundIssues.push({
                    type: 'Content',
                    desc: 'Multiple <h1> headings found',
                    impact: 'Confusing document structure.',
                    remediation: 'Use only one <h1> per page.'
                });
            }

            // Alt Text Check
            const images = document.querySelectorAll('img');
            let missingAltCount = 0;
            images.forEach(img => {
                if (!img.alt || img.alt.trim() === '') missingAltCount++;
            });
            if (missingAltCount > 0) {
                foundIssues.push({
                    type: 'Accessibility',
                    desc: `${missingAltCount} images missing alt text`,
                    impact: 'Screen readers cannot describe images to visually impaired users.',
                    remediation: 'Add descriptive "alt" attributes to all images.'
                });
            }

            return foundIssues;
        });

        for (const i of issues) {
            this.issues.push({
                id: `content-${Math.random()}`,
                category: i.type === 'Accessibility' ? 'UI/UX' : 'Content',
                severity: 'Medium',
                url,
                description: i.desc,
                userImpact: i.impact,
                remediation: i.remediation
            });
        }

        // Check for broken links on the current page (client-side validation)
        const links = await page.$$('a');
        for (const link of links) {
            const href = await link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                // Check local anchor existence
                const target = await page.$(href);
                if (!target) {
                    this.issues.push({
                        id: `broken-anchor-${Math.random()}`,
                        category: 'Functional',
                        severity: 'Low',
                        url,
                        description: `Broken internal anchor link to ${href}`,
                        userImpact: 'User clicks a link but nothing happens.',
                        remediation: `Ensure the element with id="${href.substring(1)}" exists on the page.`
                    });
                }
            }
        }

        return this.issues;
    }

    // Method to handle console message events passed from Navigator
    handleConsoleError(msg: any, url: string) {
        if (msg.type() === 'error') {
            this.issues.push({
                id: `js-error-${Math.random()}`,
                category: 'Functional',
                severity: 'Medium',
                url,
                description: `JavaScript Error: ${msg.text()}`,
                userImpact: 'Features may not work as expected.',
                remediation: 'Fix the JavaScript exception thrown in the console.'
            });
        }
    }
}
