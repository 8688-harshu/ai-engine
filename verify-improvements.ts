import { chromium } from 'playwright';
import { SemanticAnalyzer } from './src/analyzers/SemanticAnalyzer';
import { FunctionalAnalyzer } from './src/analyzers/FunctionalAnalyzer';
import path from 'path';

async function runVerification() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const filePath = 'file://' + path.resolve('./test-assets/localization-test.html');
    console.log(`Navigating to ${filePath}...`);
    await page.goto(filePath);

    console.log('--- Running Functional Analyzer ---');
    const funcAnalyzer = new FunctionalAnalyzer();
    const funcIssues = await funcAnalyzer.analyze(page, filePath);

    console.log(`Found ${funcIssues.length} functional issues.`);
    funcIssues.forEach(i => {
        console.log(`[${i.category}] ${i.description}`);
        console.log(`   Location: ${i.location}`);
        console.log(`   Snippet: "${i.snippet}"`);
    });

    console.log('\n--- Running Semantic Analyzer ---');
    const semAnalyzer = new SemanticAnalyzer();
    const semIssues = await semAnalyzer.analyze(page, filePath);

    console.log(`Found ${semIssues.length} semantic issues.`);
    semIssues.forEach(i => {
        console.log(JSON.stringify({
            category: i.category,
            description: i.description,
            location: i.location,
            snippet: i.snippet
        }, null, 2));
    });

    await browser.close();
}

runVerification().catch(console.error);
