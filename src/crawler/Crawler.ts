import { Navigator } from './Navigator';
import { ScanConfig, PageResult } from '../types';
import { Page } from 'playwright';

export interface CrawlParams {
    config: ScanConfig;
    navigator: Navigator;
    processPage: (page: Page, url: string) => Promise<PageResult>;
}

export class Crawler {
    private visited: Set<string> = new Set();
    private queue: { url: string; depth: number }[] = [];
    private config: ScanConfig;
    private navigator: Navigator;
    private processPage: (page: Page, url: string) => Promise<PageResult>;

    constructor(params: CrawlParams) {
        this.config = params.config;
        this.navigator = params.navigator;
        this.processPage = params.processPage;
    }

    async crawl(): Promise<PageResult[]> {
        const results: PageResult[] = [];
        this.queue.push({ url: this.config.startUrl, depth: 0 });

        const CONCURRENCY = 5; // Process 5 pages at a time

        while (this.queue.length > 0 && this.visited.size < this.config.maxPages) {
            // Take a batch of URLs
            const batch = [];
            while (batch.length < CONCURRENCY && this.queue.length > 0) {
                const item = this.queue.shift();
                if (item) batch.push(item);
            }

            if (batch.length === 0) break;

            // Process batch in parallel
            await Promise.all(batch.map(async (current) => {
                // Double check limit inside the loop
                if (this.visited.size >= this.config.maxPages) return;

                const { url, depth } = current;
                const normUrl = url.endsWith('/') ? url.slice(0, -1) : url;

                if (this.visited.has(normUrl)) return;
                if (depth > this.config.maxDepth) return;

                this.visited.add(normUrl);

                let page: Page | null = null;
                try {
                    // Create a new page for this task
                    page = await this.navigator.createPage();
                    await this.navigator.visitPage(page, url);

                    // Run analysis callback
                    const result = await this.processPage(page, url);
                    results.push(result);

                    // If not at max depth, find more links
                    if (depth < this.config.maxDepth) {
                        const links = await this.navigator.extractLinks(page);
                        for (const link of links) {
                            if (link.startsWith(this.config.startUrl) || link.startsWith('/')) {
                                const absLink = link.startsWith('/')
                                    ? new URL(link, this.config.startUrl).toString()
                                    : link;

                                const absNorm = absLink.endsWith('/') ? absLink.slice(0, -1) : absLink;
                                if (!this.visited.has(absNorm)) {
                                    this.queue.push({ url: absLink, depth: depth + 1 });
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to crawl ${url}:`, e);
                } finally {
                    // Important: Close the page to free memory
                    if (page) await page.close().catch(() => { });
                }
            }));
        }

        return results;
    }
}
