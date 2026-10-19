module.exports = async (req, res) => {
  const text = req.query.text || 'Tulis pesan...';
  const time = req.query.time || '12.00';
  const theme = req.query.theme || 'dark';

  try {
    const { default: chromium } = await import('@sparticuz/chromium');
    const { default: puppeteer } = await import('puppeteer-core');

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1920 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    
    const domain = req.headers.host;
    await page.goto(`https://${domain}/tools/iqc-generator.html`, { waitUntil: 'networkidle0' });

    await page.evaluate((txt, tm, thm) => {
      document.getElementById('in-text').value = txt;
      document.getElementById('in-time').value = tm;
      document.getElementById('in-theme').value = thm;
      ['in-text', 'in-time', 'in-theme'].forEach(id => {
        const el = document.getElementById(id);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }, text, time, theme);

    await new Promise(r => setTimeout(r, 1000));

    const element = await page.$('#story-frame');
    const imageBuffer = await element.screenshot({ type: 'png' });

    await browser.close();
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
