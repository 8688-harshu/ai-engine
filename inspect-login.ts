import { chromium } from 'playwright';

async function inspect() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Navigating to login page...');
    await page.goto('https://www.srkrexams.in/Login.aspx');

    console.log('Page loaded. Inspecting inputs...');

    const inputs = await page.$$eval('input', els => els.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        placeholder: e.getAttribute('placeholder')
    })));

    console.log('Found Inputs:', JSON.stringify(inputs, null, 2));

    await browser.close();
}

inspect();
