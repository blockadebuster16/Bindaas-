const fs = require('fs');
const path = require('path');

const replacements = {
  '\u00E2\u201A\u00B9': '\u20B9', // â‚¹ -> ₹
  '\u00E2\u2020\u2019': '\u2192', // â†’ -> →
  '\u00C3\u2014': '\u00D7', // Ã— -> ×
  '\u00C3\u00B7': '\u00F7', // Ã· -> ÷
  '\u00C3\u00A2\u20AC\u201C': '\u2014', // Ã¢â‚¬â€œ -> — (em dash maybe?)
  '\u00E2\u20AC\u201C': '\u2013', // â€“ -> –
  '\u00E2\u20AC\u201D': '\u2014', // â€” -> —
  '\u00C2\u00B7': '\u00B7', // Â· -> ·
  '\u00E2\u0153\u201C': '\u2713', // âœ“ -> ✓
  '\u00E2\u0153\u2026': '\u2705', // âœ… -> ✅
  '\u00E2\u0161\u2122\u00EF\u00B8\u008F': '\u2699\uFE0F', // âš™ï¸  -> ⚙️
  '\u00E2\u0152\u0160': '\u230A', // âŒŠ -> ⌊
  '\u00E2\u0152\u0161': '\u230B', // âŒ -> ⌋
  '\u00E2\u0152\u02C6': '\u2308', // âŒˆ -> ⌈
  '\u00E2\u0152\u2030': '\u2309', // âŒ‰ -> ⌉
  '\u00E2\u20AC\u00A6': '\u2026', // â€¦ -> …
  '\u00E2\u20AC\u2122': '\u2019', // â€™ -> ’
  '\u00E2\u20AC\u0153': '\u201C', // â€œ -> “
  '\u00E2\u20AC\u009D': '\u201D', // â€  -> ”
  '\u00E2\u274C': '\u274C', // â Œ -> ❌
  '\u00E2\u201D\u20AC': '\u2500', // â”€ -> ─
  '\u00C2\u00A9': '\u00A9', // Â© -> ©
  '\u00F0\u0178\u0152\u00BF': '\uD83C\uDF3F' // ðŸŒ¿ -> 🌿
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
        }
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed Unicode encoding in:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../client/src'));
