const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public chrome disables route transition animation on /about', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'PublicChrome.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /pathname\s*!==\s*['"]\/about['"]/,
    'Expected PublicChrome to exclude /about from global page transition animation'
  );
});

test('public chrome does not run page transition on initial mount', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'PublicChrome.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /<AnimatePresence\s+mode=["']wait["']\s+initial=\{false\}/,
    'Expected AnimatePresence to set initial={false} to prevent first-paint flash animation'
  );
});
