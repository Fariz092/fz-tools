const { createCanvas } = require('pureimage');
const GIFEncoder = require('gifencoder');

module.exports = async (req, res) => {
  const text = req.query.text || 'brat';
  
  try {
    const width = 400;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(250);
    encoder.setQuality(10);

    const words = text.split(/\s+/);
    const totalFrames = words.length + 3;

    let fontSize = 80;
    if (text.length > 100) fontSize = 30;
    else if (text.length > 50) fontSize = 45;
    else if (text.length > 20) fontSize = 60;

    ctx.font = `${fontSize}px sans-serif`;
    const lineHeight = fontSize * 0.95;
    const startX = 30;
    const maxWidth = width - (startX * 2);

    // Pre-calculate layout
    const fullLines = [];
    let testLine = '';
    for (let n = 0; n < words.length; n++) {
      const t = testLine + words[n] + ' ';
      if (ctx.measureText(t).width > maxWidth && n > 0) {
        fullLines.push(testLine.trim());
        testLine = words[n] + ' ';
      } else {
        testLine = t;
      }
    }
    fullLines.push(testLine.trim());

    const totalHeight = fullLines.length * lineHeight;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;

    for (let i = 0; i < totalFrames; i++) {
      const visibleCount = Math.min(i + 1, words.length);
      const visibleText = words.slice(0, visibleCount).join(' ');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px sans-serif`;

      // Gambar teks dengan wrap
      const lines = [];
      let line = '';
      const vWords = visibleText.split(' ');
      for (let n = 0; n < vWords.length; n++) {
        const t = line + vWords[n] + ' ';
        if (ctx.measureText(t).width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = vWords[n] + ' ';
        } else {
          line = t;
        }
      }
      lines.push(line.trim());

      let currentY = startY;
      lines.forEach(l => {
        ctx.fillText(l, startX, currentY);
        currentY += lineHeight;
      });

      encoder.addFrame(ctx);
    }

    encoder.finish();
    const buffer = encoder.out.getData();

    res.setHeader('Content-Type', 'image/gif');
    res.status(200).send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
