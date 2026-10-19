module.exports = async (req, res) => {
  const text = req.query.text || 'brat';
  
  try {
    // Dynamic import untuk kedua modul ES Module
    const { default: chromium } = await import('@sparticuz/chromium');
    const { default: puppeteer } = await import('puppeteer-core');

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    
    const domain = req.headers.host;
    await page.goto(`https://${domain}/tools/brat.html`, { waitUntil: 'networkidle0' });

    await page.evaluate((txt) => {
      const input = document.getElementById('in-text');
      input.value = txt;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, text);

    await new Promise(r => setTimeout(r, 1000));

    const element = await page.$('.brat-canvas-wrap');
    const imageBuffer = await element.screenshot({ type: 'png' });

    await browser.close();
    
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
