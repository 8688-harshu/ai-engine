import { Page } from 'playwright';

export class ContentExtractor {
    static async extract(page: Page): Promise<string> {
        return await page.evaluate(() => {
            // Remove scripts, styles, and other noise
            const clones = document.body.cloneNode(true) as HTMLElement;
            const noise = clones.querySelectorAll('script, style, noscript, iframe, svg');
            noise.forEach(el => el.remove());

            // Get text content with some structure
            let text = clones.innerText || '';

            // Limit to first 10000 characters to fit in context window and focus on critical content
            return text.slice(0, 15000).trim();
        });
    }
}
