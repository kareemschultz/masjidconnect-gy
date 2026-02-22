import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to a common mobile size (iPhone 12 Pro) for MasjidConnect
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  try {
    console.log('Navigating to https://masjidconnectgy.com...');
    await page.goto('https://masjidconnectgy.com', { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    const path = 'screenshot.png';
    await page.screenshot({ path: path, fullPage: false });
    console.log(`Screenshot saved to ${path}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();