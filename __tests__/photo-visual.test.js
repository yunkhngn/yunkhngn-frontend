const fs = require('fs');
const path = require('path');

describe('PhotoClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'photo', 'PhotoClient.jsx');

  test('imports PageHero', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/PageHero/);
  });

  test('imports motion from framer-motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/from ['"]framer-motion['"]/);
    expect(source).toMatch(/\bmotion\b/);
  });

  test('defines cardContainerVariants with staggerChildren', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/staggerChildren/);
  });

  test('uses layout key for stagger remount', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/key=\{.*layout.*\}/);
  });
});
