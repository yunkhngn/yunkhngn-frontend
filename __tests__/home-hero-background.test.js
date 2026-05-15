const fs = require('fs');
const path = require('path');

describe('HeroBackground component', () => {
  const filePath = path.join(process.cwd(), 'components', 'home', 'HeroBackground.jsx');

  test('applies heavy blur to orbs', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/blur-\[120px\]/);
  });

  test('uses primary and secondary theme colors', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/primary\/10/);
    expect(source).toMatch(/secondary\/10/);
  });

  test('renders with pointer-events-none and negative z-index', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/pointer-events-none/);
    expect(source).toMatch(/-z-10/);
  });

  test('animates orbs with Framer Motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/animate=/);
    expect(source).toMatch(/Infinity/);
  });
});
