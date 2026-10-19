const { createCanvas } = require('canvas');
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
    encoder.setRepeat(0);   // 0 = loop forever
    encoder.setDelay(250);  // 250ms per frame
    encoder.setQuality(10);

    const words = text.split(/\s+/);
    const totalFrames = words.length + 3;

    // Hitung ukuran font
    let fontSize = 80;
    if (text.length > 100) fontSize = 30;
    else if (text.length > 50) fontSize = 45;
    else if (text.length > 20) fontSize = 60;

    // Pre-calculate layout (sama persis kayak di web)
    ctx.font = `700 ${fontSize}px Arial, sans-serif`;
    const lineHeight = fontSize * 0.95;
    const startX = 30;
    const maxWidth = width - (startX * 2);

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

      // Background putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Teks hitam
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${fontSize}px Arial, sans-serif`;

      // Gambar teks
      let currentY = startY;
      const visibleLines = wrapText(ctx, visibleText, startX, startY, maxWidth, lineHeight);
      visibleLines.forEach((l, idx) => {
        ctx.fillText(l, startX, currentY);
        currentY += lineHeight;
      });

      // Efek Blur manual di Canvas
      const imgData = ctx.getImageData(0, 0, width, height);
      // Trik blur sederhana: timpa dengan teks semi transparan (opsional, karena gifencoder ga support ctx.filter)
      
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

// Fungsi pembantu untuk word wrap
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}
