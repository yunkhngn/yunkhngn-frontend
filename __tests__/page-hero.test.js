const fs = require('fs');
const path = require('path');

describe('PageHero component', () => {
  const filePath = path.join(process.cwd(), 'components', 'shared', 'PageHero.jsx');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('imports and uses HeroBackground', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/HeroBackground/);
  });

  test('renders eyebrow with uppercase tracking style', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/uppercase/);
    expect(source).toMatch(/tracking/);
  });

  test('renders serif h1', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/font-serif/);
    expect(source).toMatch(/<h1/);
  });

  test('outer div is relative (required for HeroBackground positioning)', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/\brelative\b/);
  });

  test('accepts children slot', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/children/);
  });
});
