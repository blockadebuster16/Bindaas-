const fs = require('fs');
const path = require('path');

const replacements = {
  'â‚¹': '₹',
  'â†’': '→',
  'âŒˆ': '⌈',
  'âŒ‰': '⌉',
  'Ã—': '×',
  'Ã·': '÷',
  'âœ“': '✓',
  'âœ…': '✅',
  'âš™ï¸ ': '⚙️',
  'â Œ': '❌',
  'â”€': '─',
  'â€¦': '…',
  'Â·': '·',
  'â€™': '’',
  'â€œ': '“',
  'â€ ': '”',
  'â€“': '–',
  'â€”': '—',
  'Â©': '©'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed encoding in:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../client/src'));
