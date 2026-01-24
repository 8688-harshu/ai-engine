import { Page } from 'playwright';
import { Issue } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FunctionalAnalyzer {
    handleConsoleError(msg: any, url: string) {
        // Placeholder or simple logging for now
        if (msg.type() === 'error') {
            console.log(`[Console Error on ${url}]: ${msg.text()}`);
        }
    }

    async analyze(page: Page, url: string): Promise<Issue[]> {
        const issues: Issue[] = [];

        // Analyze Buttons and Interactive Elements
        const buttonIssues = await page.evaluate(() => {
            const results: any[] = [];
            const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"], div[role="button"]');

            buttons.forEach((btn) => {
                const el = btn as HTMLElement;
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                // 1. Visibility Check
                const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                if (!isVisible) {
                    // Ignore hidden elements if they are truly intended to be hidden (e.g., mobile menus on desktop)
                    // But if it's display:block but size 0, that's fishy.
                    return;
                }

                // 2. Obstruction Check (Basic)
                // Identify if something is covering the center of the button
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                try {
                    const topEl = document.elementFromPoint(cx, cy);
                    if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
                        // Check if topEl is just a transparent overlay or actual obstruction?
                        // For now, flag it if it receives pointer events
                        const topStyle = window.getComputedStyle(topEl);
                        if (topStyle.pointerEvents !== 'none') {
                            results.push({
                                type: 'Obstruction',
                                description: `Interactive element covered by another element <${topEl.tagName.toLowerCase()}>`,
                                selector: getPath(el),
                                text: el.innerText.substring(0, 20)
                            });
                        }
                    }
                } catch (e) { }

                // 3. Accessibility / Label Check
                const text = el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || (el as HTMLInputElement).value;
                if (!text || text.trim().length === 0) {
                    results.push({
                        type: 'Accessibility',
                        description: 'Interactive element has no visible text or label',
                        selector: getPath(el),
                        text: '[NO TEXT]'
                    });
                }
            });

            // Helper to generate path
            function getPath(el: Element): string {
                if (el.id) return '#' + el.id;
                if (el === document.body) return 'body';
                if (!el.parentElement) return el.tagName.toLowerCase();
                const siblings = Array.from(el.parentElement.children);
                const index = siblings.indexOf(el) + 1;
                return getPath(el.parentElement) + ' > ' + el.tagName.toLowerCase() + ':nth-child(' + index + ')';
            };

            return results;
        });

        issues.push(...buttonIssues.map(i => ({
            id: uuidv4(),
            url: url,
            category: i.type === 'Accessibility' ? 'Accessibility' : 'UI/UX',
            severity: 'Medium',
            description: i.description,
            remediation: i.type === 'Accessibility' ? 'Add clear text or aria-label to the button.' : 'Ensure button is not covered by other elements (z-index issue?).',
            userImpact: i.type === 'Accessibility' ? 'Screen readers cannot describe the action, and users may be confused.' : 'User cannot click the element.',
            location: i.selector,
            snippet: i.text
        } as Issue)));

        return issues;
    }
}
