const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync('d:/Projects/MAISIP/frontend/app/admin/ledger/[id]/page.js', 'utf-8');
try {
  babel.transformSync(code, { presets: ['@babel/preset-react'] });
  console.log('Valid syntax!');
} catch (e) {
  console.error(e.message);
}
