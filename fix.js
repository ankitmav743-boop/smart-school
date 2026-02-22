import fs from 'fs';
let text = fs.readFileSync('server/index.js', 'utf8');
text = text.replace(/`class`/g, '\\`class\\`');
fs.writeFileSync('server/index.js', text);
