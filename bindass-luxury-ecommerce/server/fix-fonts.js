const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove inline Space Grotesk
      const original = content;
      content = content.replace(/fontFamily:\s*["']'Space Grotesk',\s*sans-serif["']/g, 'fontFamily: "inherit"');
      
      // Also fix the Membership.jsx hardcoded Manrope
      content = content.replace(/font-family:\s*'Manrope',\s*sans-serif;/g, '');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Standardized fonts in:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../client/src'));
