const fs = require('fs');
const path = require('path');

describe('RevealHeading component', () => {
  const filePath = path.join(process.cwd(), 'components', 'home', 'RevealHeading.jsx');

  test('uses clip-path for reveal animation', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/clipPath/);
    expect(source).toMatch(/inset\(0 100%/);
    expect(source).toMatch(/inset\(0 0%/);
  });

  test('clips overflow to contain the reveal', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/overflow-hidden/);
  });

  test('triggers once when in viewport', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/whileInView/);
    expect(source).toMatch(/once:\s*true/);
  });

  test('renders optional section index number', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/padStart/);
    expect(source).toMatch(/tracking-widest/);
  });
});
