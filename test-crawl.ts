import { Coordinator } from './src/engine/Coordinator';
import { ScanConfig } from './src/types';

async function test() {
    const config: ScanConfig = {
        startUrl: 'https://example.com',
        maxPages: 2,
        maxDepth: 1,
        headless: true
    };

    console.log('Starting Test Scan on example.com...');
    const coordinator = new Coordinator(config);
    try {
        const report = await coordinator.run();
        console.log('Scan Complete!');
        console.log('Pages Scanned:', report.pagesScanned);
        console.log('Score:', report.score);
        console.log('Issues Found:', report.issues.length);
        console.log('Knowledge Graph Nodes:', report.knowledgeGraph.length);

        const a11yIssues = report.issues.filter(i => i.category === 'Accessibility');
        console.log('Accessibility Issues:', a11yIssues.length);
        if (a11yIssues.length > 0) {
            console.log('Sample A11y Issue:', a11yIssues[0].description);
        }

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
