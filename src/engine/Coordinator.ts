import { Navigator } from '../crawler/Navigator';
import { Crawler } from '../crawler/Crawler';
import { FunctionalAnalyzer } from '../analyzers/FunctionalAnalyzer';
import { NetworkAnalyzer } from '../analyzers/NetworkAnalyzer';
import { UiUxAnalyzer } from '../analyzers/UiUxAnalyzer';
import { SemanticAnalyzer } from '../analyzers/SemanticAnalyzer';
import { AccessibilityAnalyzer } from '../analyzers/AccessibilityAnalyzer';
import { Scoring } from './Scoring';
import { ScanConfig, FinalReport, Issue, PageResult, GraphNode } from '../types';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

export class Coordinator {
    private navigator: Navigator;
    private funcAnalyzer: FunctionalAnalyzer;
    private netAnalyzer: NetworkAnalyzer;
    private uiUxAnalyzer: UiUxAnalyzer;
    private semanticAnalyzer: SemanticAnalyzer;
    private a11yAnalyzer: AccessibilityAnalyzer;
    private issues: Issue[] = [];
    private config: ScanConfig;

    constructor(config: ScanConfig) {
        this.config = config;
        this.navigator = new Navigator(config);
        this.funcAnalyzer = new FunctionalAnalyzer();
        this.netAnalyzer = new NetworkAnalyzer();
        this.uiUxAnalyzer = new UiUxAnalyzer();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.a11yAnalyzer = new AccessibilityAnalyzer();
    }

    async run(): Promise<FinalReport> {
        await this.navigator.init();
        const page = this.navigator.getPage();

        if (!page) throw new Error('Failed to initialize page');

        // Attach Global Listeners (Network, Console)
        // These will persist across all pages visited by the single Page instance
        page.on('response', (response) => {
            const netIssues = this.netAnalyzer.analyzeResponse(response);
            this.issues.push(...netIssues);
        });

        page.on('console', (msg) => {
            this.funcAnalyzer.handleConsoleError(msg, page.url());
        });

        // Perform Basic Login if configured
        await this.navigator.performLogin(page);

        try {
            const crawler = new Crawler({
                config: this.config,
                navigator: this.navigator,
                processPage: async (pageInstance, url) => {
                    console.log(chalk.yellow(`Analyzing ${url}...`));

                    // Static Analysis per page
                    const [funcIssues, uiIssues, semanticIssues, a11yIssues] = await Promise.all([
                        this.funcAnalyzer.analyze(pageInstance, url),
                        this.uiUxAnalyzer.analyze(pageInstance),
                        this.semanticAnalyzer.analyze(pageInstance, url),
                        this.a11yAnalyzer.analyze(pageInstance)
                    ]);

                    return {
                        url,
                        scannedAt: new Date().toISOString(),
                        issues: [...funcIssues, ...uiIssues, ...semanticIssues, ...a11yIssues],
                        links: await this.navigator.extractLinks()
                    } as PageResult;
                }
            });

            console.log(chalk.green('Starting Autonomous Crawl...'));
            const pageResults = await crawler.crawl();

            // Collect all issues (Global + Page specific)
            let allIssues = [...this.issues];
            pageResults.forEach(pr => {
                allIssues.push(...pr.issues);
            });

            // Deduplicate issues
            const uniqueIssues = allIssues.filter((issue, index, self) =>
                index === self.findIndex((t) => (
                    t.description === issue.description && t.url === issue.url
                ))
            );

            const score = Scoring.calculate(uniqueIssues);

            // Build Knowledge Graph
            const graphNodes: GraphNode[] = [];

            // 1. Page Nodes
            pageResults.forEach(pr => {
                graphNodes.push({
                    id: pr.url,
                    type: 'Page',
                    label: new URL(pr.url).pathname,
                    properties: { issueCount: pr.issues.length },
                    edges: pr.links // Basic edges to found links
                });
            });

            // 2. Issue Nodes (Optional, maybe too noisy for now, just linking Pages is good for Phase 1)

            return {
                score,
                trustSummary: score.total > 80 ? 'High Trust' : score.total > 50 ? 'Moderate Trust' : 'Low Trust',
                pagesScanned: pageResults.length,
                issues: uniqueIssues,
                criticalIssues: uniqueIssues.filter(i => i.severity === 'High'),
                knowledgeGraph: graphNodes,
                recommendations: {
                    immediate: uniqueIssues.filter(i => i.severity === 'High').map(i => i.remediation),
                    shortTerm: uniqueIssues.filter(i => i.severity === 'Medium').map(i => i.remediation),
                    longTerm: uniqueIssues.filter(i => i.severity === 'Low').map(i => i.remediation),
                },
                closingInsight: score.total < 50 ? 'Critical trust issues detected, immediate remediation required.' : 'Site is generally trustworthy.'
            };

        } catch (e) {
            console.error('Scan failed:', e);
            throw e;
        } finally {
            await this.navigator.close();
        }
    }
}
