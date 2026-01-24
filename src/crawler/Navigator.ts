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

        // Initialize authentication state if provided
        await this.authenticate();

        // Default page using factory
        this.page = await this.createPage();
    }

    private async authenticate() {
        if (!this.config.auth || !this.context) return;
        const { auth } = this.config;

        console.log(`Initializing authentication: ${auth.type}`);

        if (auth.type === 'cookies' && auth.cookies) {
            try {
                // Filter cookies to ensure they have valid properties for Playwright
                const validCookies = auth.cookies.map(c => ({
                    name: c.name,
                    value: c.value,
                    domain: c.domain,
                    path: c.path || '/',
                }));
                await this.context.addCookies(validCookies);
                console.log(`Added ${validCookies.length} session cookies.`);
            } catch (e) {
                console.error('Failed to add cookies:', e);
            }
        }
    }

    async createPage(): Promise<Page> {
        if (!this.context) throw new Error('Context not initialized');
        const page = await this.context.newPage();

        // Optimizations: Block heavy resources
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'media', 'font', 'other'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Apply LocalStorage if needed (must be done per page)
        if (this.config.auth?.type === 'cookies' && this.config.auth.localStorage) {
            const storage = this.config.auth.localStorage;
            await page.addInitScript((storageData) => {
                for (const [key, value] of Object.entries(storageData)) {
                    window.localStorage.setItem(key, value);
                }
            }, storage);
        }

        return page;
    }

    async visit(url: string) {
        if (!this.page) throw new Error('Navigator not initialized');

        // Handle Basic Auth Login if needed (only once per session usually, but we check if we need to do it)
        // Note: For basic form auth, we usually do it at the start.
        if (this.config.auth?.type === 'basic' && this.config.auth.loginUrl && this.config.auth.username && this.config.auth.password) {
            // We only do this if we are not already at a logged-in state.
            // Since this is a simple crawler, we might just assume we run this first.
            // For now, let's keep it simple: The Crawler class might handle the flow, or we do it here effectively.
            // Actually, best place is likely here or a dedicated method called by Crawler.
            // However, since `visit` is called for every page, we shouldn't login every time.
            // We will add a specialized method `performLogin` and call it from `Crawler.ts` init phase if needed.
        }

        await this.visitPage(this.page, url);
        return this.page;
    }

    async performLogin(page: Page) {
        if (this.config.auth?.type !== 'basic') return;
        const { loginUrl, username, password } = this.config.auth;

        if (!loginUrl || !username || !password) return;

        console.log(`Attempting basic login at ${loginUrl}`);
        try {
            await page.goto(loginUrl, { waitUntil: 'networkidle' });

            // Heuristic to find fields
            const userField = await page.waitForSelector('input[type="email"], input[type="text"], input[name*="user"], input[name*="login"]', { timeout: 5000 }).catch(() => null);
            const passField = await page.waitForSelector('input[type="password"]', { timeout: 5000 }).catch(() => null);
            const submitBtn = await page.waitForSelector('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")', { timeout: 5000 }).catch(() => null);

            if (userField && passField) {
                await userField.fill(username);
                await passField.fill(password);

                if (submitBtn) {
                    await Promise.all([
                        page.waitForNavigation({ timeout: 10000 }).catch(() => console.log('Navigation timeout after login submit (might be SPA)')),
                        submitBtn.click()
                    ]);
                    console.log('Login form submitted.');
                } else {
                    await passField.press('Enter');
                    console.log('Pressed Enter to login.');
                    await page.waitForTimeout(3000);
                }
            } else {
                console.warn('Could not find login fields.');
            }

        } catch (e) {
            console.error('Basic login failed:', e);
        }
    }

    async visitPage(page: Page, url: string) {
        console.log(`Navigating to: ${url}`);

        try {
            // Try networkidle first for best quality, but fall back to domcontentloaded
            try {
                // Reduced timeout to 3s for speed. Most static sites load fast enough.
                await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 }); // Increased slightly to 5s for auth pages
            } catch (e) {
                // console.log(`Network idle timed out for ${url}, falling back...`); // Reduced noise
                // Ensure we are at least loaded enough to scrape
                await page.waitForLoadState('domcontentloaded');
            }

            await this.simulateHumanBehavior(page);
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
        }

        return page;
    }

    private async simulateHumanBehavior(page: Page) {
        if (page.isClosed()) return;

        try {
            // Random scroll
            await page.evaluate(async () => {
                const distance = 100;
                const delay = 50; // Faster
                while (document.scrollingElement && document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                    window.scrollBy(0, distance);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    if (Math.random() > 0.9) break; // Stop scrolling sooner
                }
            });

            // Random small delays
            await page.waitForTimeout(Math.random() * 500 + 200);
        } catch (e) {
            console.log('Human behavior simulation interrupted (page closed or changed?), ignoring.');
        }
    }

    async close() {
        await this.browser?.close();
    }

    getPage() {
        return this.page;
    }

    async extractLinks(page?: Page): Promise<string[]> {
        const targetPage = page || this.page;
        if (!targetPage) return [];
        try {
            const hrefs = await targetPage.$$eval('a', (anchors) =>
                anchors.map((a) => a.getAttribute('href')).filter((href): href is string => !!href)
            );
            return [...new Set(hrefs)]; // Deduplicate
        } catch (e) {
            console.error('Failed to extract links:', e);
            return [];
        }
    }
}
