// Build bookmarklet.txt and install.html from fill-visitor.js + config.js:  node build.js
const fs = require('fs');
const path = require('path');
const cfgFile = path.join(__dirname, 'config.js');
if (!fs.existsSync(cfgFile)) {
  console.error('config.js not found. Run:  cp config.example.js config.js  and edit it.');
  process.exit(1);
}
const cfg = require(cfgFile);
// Turn the config into a JS literal (keeps regexes).
const toSrc = (v) => {
  if (v instanceof RegExp) return v.toString();
  if (Array.isArray(v)) return '[' + v.map(toSrc).join(', ') + ']';
  if (v && typeof v === 'object') return '{ ' + Object.entries(v).map(([k, x]) => JSON.stringify(k) + ': ' + toSrc(x)).join(', ') + ' }';
  return JSON.stringify(v);
};
let src = fs.readFileSync(path.join(__dirname, 'fill-visitor.js'), 'utf8');
src = src.replace('__CONFIG__', () => toSrc(cfg));
const code = src.split('\n').filter(l => !/^\s*\/\//.test(l)).map(l => l.trim()).filter(Boolean).join(' ');
new Function(code); // syntax check
const bm = 'javascript:' + encodeURIComponent(code);
fs.writeFileSync(path.join(__dirname, 'bookmarklet.txt'), bm + '\n');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
fs.writeFileSync(path.join(__dirname, 'install.html'), `<!doctype html><meta charset="utf-8"><title>Install visitor-form bookmarklet</title>
<body style="font:16px sans-serif;max-width:40em;margin:2em auto">
<h2>Visitor form defaults</h2>
<p>Drag this link to your bookmarks toolbar:</p>
<p><a href="${esc(bm)}" style="font-size:20px;padding:6px 12px;border:2px solid #333;border-radius:6px;text-decoration:none">Fill visitor defaults</a></p>
<p>Then open the Site Access form and click the bookmark. It never submits; review and click Submit yourself.</p>`);
console.log('ok, bookmarklet length', bm.length);
