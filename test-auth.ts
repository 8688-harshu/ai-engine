import { Coordinator } from './src/engine/Coordinator';
import { ScanConfig } from './src/types';

async function testAuth() {
    // We will use https://the-internet.herokuapp.com/login which is a standard test site
    // Credentials are: tomsmith / SuperSecretPassword!

    const config: ScanConfig = {
        startUrl: 'https://the-internet.herokuapp.com/secure', // This page redirects to login if not auth'd
        maxPages: 1,
        maxDepth: 1,
        headless: false, // Show browser to verify visually if needed (or set to true)
        auth: {
            type: 'basic',
            username: 'tomsmith',
            password: 'SuperSecretPassword!',
            loginUrl: 'https://the-internet.herokuapp.com/login'
        }
    };

    console.log('Starting Auth Test Scan...');
    const coordinator = new Coordinator(config);
    try {
        const report = await coordinator.run();

        console.log('Scan Results for ' + report.pagesScanned + ' pages.');

        // If we successfully scanned /secure, it means login worked!
        // If login failed, we would likely cover /login only or get stuck.

        const securePage = report.issues.find(i => i.url.includes('secure'));
        // Alternatively, check the report's knowledge graph for nodes
        const nodes = report.knowledgeGraph.map(n => n.id);
        console.log('Nodes found:', nodes);

        const foundSecure = nodes.some(n => n.includes('/secure'));

        if (foundSecure) {
            console.log('SUCCESS: Accessed /secure page!');
        } else {
            console.log('FAILURE: Did not access /secure page.');
        }

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

testAuth();
