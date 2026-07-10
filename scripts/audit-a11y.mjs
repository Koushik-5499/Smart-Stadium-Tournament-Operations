import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    
    let violations = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('axe-core') && text.includes('violation')) {
        violations.push(text);
      }
      if (text.includes('axe-core')) {
        console.log('[BROWSER AXE]', text);
      }
    });

    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' }).catch(() => {
      console.log("Could not reach localhost:5173. Please make sure the dev server is running.");
      process.exit(1);
    });

    console.log("Waiting for axe-core scan in browser...");
    await new Promise(r => setTimeout(r, 5000));
    
    if (violations.length > 0) {
      console.error(`Found accessibility violations! Check browser console output above.`);
      process.exit(1);
    } else {
      console.log("SUCCESS! No accessibility violations found.");
    }
  } catch (err) {
    console.error("Error during axe scan:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

