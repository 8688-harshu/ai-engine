import { chromium } from 'playwright';

async function getCGPA() {
    const browser = await chromium.launch({ headless: true });
    // Use a persistent context if needed, but for now simple page
    const page = await browser.newPage();

    try {
        console.log('Navigating to login...');
        await page.goto('https://www.srkrexams.in/Login.aspx', { timeout: 60000 });

        console.log('Filling credentials...');
        // Heuristic: First text input is username, first password input is password
        const userFilled = await page.fill('input[type="text"]', '23B91A4770').catch(() => false);
        if (!userFilled) {
            // Fallback: search by generic names
            await page.fill('input[name*="user"]', '23B91A4770');
        }

        await page.fill('input[type="password"]', '23B91A4770');

        console.log('Logging in...');
        // Heuristic: Submit button
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
            page.click('input[type="submit"], button[type="submit"], #btnLogin')
        ]);

        console.log('Logged in. Scanning page for CGPA...');

        // Wait for potential dynamic content
        await page.waitForTimeout(3000);

        // Extract visible text
        const text = await page.innerText('body');

        // Simple Regex to find CGPA or SGPA
        const cgpaMatch = text.match(/CGPA\s*[:=-]?\s*([\d\.]+)/i);
        const sgpaMatch = text.match(/SGPA\s*[:=-]?\s*([\d\.]+)/i);

        if (cgpaMatch) {
            console.log(`\n*** FOUND CGPA: ${cgpaMatch[1]} ***\n`);
        } else if (sgpaMatch) {
            console.log(`\n*** FOUND SGPA: ${sgpaMatch[1]} *** (CGPA not explicitly found)\n`);
        } else {
            console.log('\nCould not automatically find "CGPA" in the text.');
            console.log('Page Text Preview:');
            console.log(text.substring(0, 500));
        }

    } catch (e) {
        console.error('Extraction Failed:', e);
    } finally {
        await browser.close();
    }
}

getCGPA();
