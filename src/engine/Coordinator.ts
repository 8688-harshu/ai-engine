import { Navigator } from '../crawler/Navigator';
import { FunctionalAnalyzer } from '../analyzers/FunctionalAnalyzer';
import { NetworkAnalyzer } from '../analyzers/NetworkAnalyzer';
import { UiUxAnalyzer } from '../analyzers/UiUxAnalyzer';
import { SemanticAnalyzer } from '../analyzers/SemanticAnalyzer';
import { Scoring } from './Scoring';
import { ScanConfig, FinalReport, Issue, PageResult } from '../types';
import chalk from 'chalk';

export class Coordinator {
    private navigator: Navigator;
    private funcAnalyzer: FunctionalAnalyzer;
    private netAnalyzer: NetworkAnalyzer;
    private uiUxAnalyzer: UiUxAnalyzer;
    private semanticAnalyzer: SemanticAnalyzer;
    private issues: Issue[] = [];
    private config: ScanConfig;

    constructor(config: ScanConfig) {
        this.config = config;
        this.navigator = new Navigator(config);
        this.funcAnalyzer = new FunctionalAnalyzer();
        this.netAnalyzer = new NetworkAnalyzer();
        this.uiUxAnalyzer = new UiUxAnalyzer();
        this.semanticAnalyzer = new SemanticAnalyzer();
    }

    async run(): Promise<FinalReport> {
        await this.navigator.init();
        const page = this.navigator.getPage();

        if (!page) throw new Error('Failed to initialize page');

        // Attach Network Listeners
        page.on('response', (response) => {
            const netIssues = this.netAnalyzer.analyzeResponse(response);
            this.issues.push(...netIssues);
        });

        page.on('console', (msg) => {
            this.funcAnalyzer.handleConsoleError(msg, page.url());
        });

        try {
            // Visit the start URL
            // TODO: Implement crawler queue for multiple pages. dealing with 1 page for now as MVP.
            await this.navigator.visit(this.navigator['config'].startUrl);

            console.log(chalk.yellow('Running Analyzers...'));

            // Analyze the page content
            const [pageIssues, uiIssues, semanticIssues] = await Promise.all([
                this.funcAnalyzer.analyze(page),
                this.uiUxAnalyzer.analyze(page),
                this.semanticAnalyzer.analyze(page, this.config.startUrl)
            ]);

            this.issues.push(...pageIssues);
            this.issues.push(...uiIssues);
            this.issues.push(...semanticIssues);

        } catch (e) {
            console.error('Scan failed:', e);
        } finally {
            await this.navigator.close();
        }

        // Deduplicate issues (basic)
        const uniqueIssues = this.issues.filter((issue, index, self) =>
            index === self.findIndex((t) => (
                t.description === issue.description && t.url === issue.url
            ))
        );

        const score = Scoring.calculate(uniqueIssues);

        // Generate simple report struct
        return {
            score,
            trustSummary: score.total > 80 ? 'High Trust' : score.total > 50 ? 'Moderate Trust' : 'Low Trust',
            pagesScanned: 1, // MVP
            issues: uniqueIssues,
            criticalIssues: uniqueIssues.filter(i => i.severity === 'High'),
            recommendations: {
                immediate: uniqueIssues.filter(i => i.severity === 'High').map(i => i.remediation),
                shortTerm: uniqueIssues.filter(i => i.severity === 'Medium').map(i => i.remediation),
                longTerm: uniqueIssues.filter(i => i.severity === 'Low').map(i => i.remediation),
            },
            closingInsight: score.total < 50 ? 'Critical trust issues detected, immediate remediation required.' : 'Site is generally trustworthy.'
        };
    }
}
