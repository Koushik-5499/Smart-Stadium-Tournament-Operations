const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Navigating to live login page...');
    await page.goto('https://smart-stadium-wc2026.vercel.app/login', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    const pageHtml = await page.content();
    console.log('Initial load check...');
    if (pageHtml.includes('Firebase: Error')) {
      console.log('Error found on initial load!');
    } else {
      console.log('No error on initial load. Clicking Google Login...');
      
      // Click the "Sign in with Google" button
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const googleBtn = btns.find(b => b.textContent.includes('Sign in with Google'));
        if (googleBtn) {
          googleBtn.click();
          return true;
        }
        return false;
      });
      
      if (clicked) {
        console.log('Clicked Google Login. Waiting for network or error...');
        // Wait for potential error banner
        try {
          await page.waitForSelector('.alert-banner.danger', { timeout: 5000 });
          const errorText = await page.evaluate(() => {
            const el = document.querySelector('.alert-banner.danger');
            return el ? el.textContent : 'Not found';
          });
          console.log('Error Banner text after clicking:', errorText);
        } catch (e) {
          console.log('No error banner appeared after clicking Google Login within 5 seconds.');
        }
      } else {
        console.log('Could not find Google Login button');
      }
    }
  } catch (error) {
    console.error('Navigation failed:', error);
  } finally {
    await browser.close();
  }
})();
