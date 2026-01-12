import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ScanConfig } from '../types';

export class Navigator {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private config: ScanConfig;

    constructor(config: ScanConfig) {
        this.config = config;
    }

    async init() {
        this.browser = await chromium.launch({ headless: this.config.headless });
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        });
        this.page = await this.context.newPage();
    }

    async visit(url: string) {
        if (!this.page) throw new Error('Navigator not initialized');
        console.log(`Navigating to: ${url}`);

        try {
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await this.simulateHumanBehavior();
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
            throw error;
        }

        return this.page;
    }

    private async simulateHumanBehavior() {
        if (!this.page) return;

        // Random scroll
        await this.page.evaluate(async () => {
            const distance = 100;
            const delay = 100;
            while (document.scrollingElement && document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                window.scrollBy(0, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
                if (Math.random() > 0.8) break; // Stop scrolling randomly
            }
        });

        // Random small delays
        await this.page.waitForTimeout(Math.random() * 1000 + 500);
    }

    async close() {
        await this.browser?.close();
    }

    getPage() {
        return this.page;
    }
}
