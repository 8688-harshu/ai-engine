export type IssueCategory = 'Functional' | 'UI/UX' | 'Performance' | 'Network' | 'Content' | 'Trust' | 'Semantic' | 'Accessibility';
export type Severity = 'Low' | 'Medium' | 'High';

export interface Issue {
    id: string;
    category: IssueCategory;
    severity: Severity;
    url: string;
    description: string;
    userImpact: string;
    remediation: string;
    evidence?: string;
    location?: string; // CSS Selector or "Global"
    snippet?: string;  // The specific text or element content causing the issue
}

export interface GraphNode {
    id: string;
    type: 'Page' | 'Element' | 'Issue';
    label: string;
    properties: Record<string, any>;
    edges: string[]; // IDs of connected nodes
}

export interface PageResult {
    url: string;
    scannedAt: string;
    issues: Issue[];
    links: string[]; // Outgoing links found
    screenshotPath?: string;
    performanceMetrics?: {
        ttfb: number;
        fcp: number;
        domLoad: number;
    };
}

export interface ScanConfig {
    startUrl: string;
    maxPages: number;
    maxDepth: number; // For recursive crawling
    auth?: {
        type: 'basic' | 'cookies';
        // Basic Auth
        username?: string;
        password?: string;
        loginUrl?: string;
        // Cookie Auth
        cookies?: Array<{ name: string; value: string; domain: string; path: string }>;
        localStorage?: Record<string, string>;
    };
    headless: boolean;
}

export interface HygieneScore {
    total: number;
    breakdown: {
        functionality: number;
        performance: number;
        uiUx: number;
        reliability: number;
        content: number;
        semantic: number;
        accessibility: number;
    };
}

export interface FinalReport {
    score: HygieneScore;
    trustSummary: string;
    pagesScanned: number;
    issues: Issue[];
    criticalIssues: Issue[];
    knowledgeGraph: GraphNode[]; // For visualization
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    closingInsight: string;
}
