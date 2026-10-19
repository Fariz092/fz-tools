module.exports = async (req, res) => {
  const name = req.query.name || 'FZPEDIATOOLS';
  const username = req.query.username || '@username';
  const followers = req.query.followers || '1000';
  const following = req.query.following || '100';
  const likes = req.query.likes || '5000';
  const bio = req.query.bio || 'Bio profile';
  const theme = req.query.theme || 'dark';

  try {
    const { default: chromium } = await import('@sparticuz/chromium');
    const { default: puppeteer } = await import('puppeteer-core');

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1350 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    
    const domain = req.headers.host;
    await page.goto(`https://${domain}/tools/tiktok-profile.html`, { waitUntil: 'networkidle0' });

    await page.evaluate((n, u, fers, fing, lks, b, thm) => {
      document.getElementById('in-name').value = n;
      document.getElementById('in-username').value = u;
      document.getElementById('in-followers').value = fers;
      document.getElementById('in-following').value = fing;
      document.getElementById('in-likes').value = lks;
      document.getElementById('in-bio').value = b;
      document.getElementById('in-theme').value = thm;
      
      ['in-name', 'in-username', 'in-followers', 'in-following', 'in-likes', 'in-bio', 'in-theme'].forEach(id => {
        const el = document.getElementById(id);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }, name, username, followers, following, likes, bio, theme);

    await new Promise(r => setTimeout(r, 1000));

    const element = await page.$('#tt-frame');
    const imageBuffer = await element.screenshot({ type: 'png' });

    await browser.close();
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
