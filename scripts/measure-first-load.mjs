// scripts/measure-first-load.mjs
// Sums the JS referenced by prerendered pages in .next/server/app and flags
// packages that should not be in the public first-load bundle.
// Usage: yarn build && node scripts/measure-first-load.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const PAGES = ['index.html', 'blog.html', 'project.html', 'about.html'];
const FINGERPRINTS = [
  ['firebase', /@firebase\//],
  ['socket.io', /socket\.io/],
  ['react-markdown', /micromark|remark-parse/],
];

for (const page of PAGES) {
  const htmlPath = path.join('.next', 'server', 'app', page);
  if (!fs.existsSync(htmlPath)) {
    console.log(`${page.padEnd(14)} (not prerendered, skipped)`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const srcs = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
  let raw = 0;
  let gz = 0;
  const found = new Set();
  for (const src of srcs) {
    const filePath = path.join('.next', src.replace('/_next/', ''));
    if (!fs.existsSync(filePath)) continue;
    const buf = fs.readFileSync(filePath);
    raw += buf.length;
    gz += zlib.gzipSync(buf).length;
    const text = buf.toString('utf8');
    for (const [name, pattern] of FINGERPRINTS) {
      if (pattern.test(text)) found.add(name);
    }
  }
  console.log(
    `${page.padEnd(14)} scripts=${srcs.length} raw=${Math.round(raw / 1024)}KB gzip=${Math.round(gz / 1024)}KB` +
      (found.size ? `  contains: ${[...found].join(', ')}` : ''),
  );
}
