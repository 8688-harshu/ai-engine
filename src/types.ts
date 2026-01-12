export type IssueCategory = 'Functional' | 'UI/UX' | 'Performance' | 'Network' | 'Content' | 'Trust' | 'Semantic';
export type Severity = 'Low' | 'Medium' | 'High';

export interface Issue {
    id: string;
    category: IssueCategory;
    severity: Severity;
    url: string;
    description: string;
    userImpact: string;
    remediation: string;
    evidence?: string; // URL to screenshot or code snippet
}

export interface PageResult {
    url: string;
    scannedAt: string;
    issues: Issue[];
    screenshotPath?: string;
    performanceMetrics?: {
        ttfb: number;
        fcp: number; // First Contentful Paint
        domLoad: number;
    };
}

export interface ScanConfig {
    startUrl: string;
    maxPages: number;
    auth?: {
        username?: string;
        password?: string;
        loginUrl?: string;
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
    };
}

export interface FinalReport {
    score: HygieneScore;
    trustSummary: string;
    pagesScanned: number;
    issues: Issue[];
    criticalIssues: Issue[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    closingInsight: string;
}
