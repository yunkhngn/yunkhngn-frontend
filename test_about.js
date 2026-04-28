const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    let hasError = false;
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
            hasError = true;
        }
    });
    page.on('pageerror', err => {
        console.log('UNCAUGHT PAGE ERROR:', err.toString());
        hasError = true;
    });

    await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle0' });

    await browser.close();
    
    if (!hasError) {
        console.log('No errors found');
    }
})();
