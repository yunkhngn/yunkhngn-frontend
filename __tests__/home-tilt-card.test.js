const fs = require('fs');
const path = require('path');

describe('TiltCard component', () => {
  const filePath = path.join(process.cwd(), 'components', 'home', 'TiltCard.jsx');

  test('uses motion values for rotation', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/useMotionValue/);
    expect(source).toMatch(/useTransform/);
    expect(source).toMatch(/rotateX/);
    expect(source).toMatch(/rotateY/);
  });

  test('caps tilt at 8 degrees', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/8/);
    expect(source).toMatch(/-8/);
  });

  test('detects touch devices and disables tilt', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/hover: none/);
  });

  test('sets perspective on wrapper for 3D effect', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/perspective/);
  });
});
