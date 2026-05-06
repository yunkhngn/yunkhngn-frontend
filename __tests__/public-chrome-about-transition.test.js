const fs = require('fs');
const path = require('path');

describe('PublicChrome Component', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'PublicChrome.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  test('disables route transition animation on /about', () => {
    expect(source).toMatch(/pathname\s*!==\s*['"]\/about['"]/);
  });

  test('does not run page transition on initial mount', () => {
    expect(source).toMatch(/<AnimatePresence\s+mode=["']wait["']\s+initial=\{false\}/);
  });
});
