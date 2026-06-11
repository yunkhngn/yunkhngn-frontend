const fs = require('fs');
const path = require('path');

describe('BlogListClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'blog', 'BlogListClient.jsx');
  const loadingPath = path.join(process.cwd(), 'app', '(public)', 'blog', 'loading.jsx');

  test('imports PageHero', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/PageHero/);
  });

  test('imports RevealHeading', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/RevealHeading/);
  });

  test('imports TiltCard', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/TiltCard/);
  });

  test('defines cardContainerVariants with staggerChildren', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/staggerChildren/);
  });

  test('has skeleton loading (animate-pulse)', () => {
    const source = fs.readFileSync(loadingPath, 'utf8');
    expect(source).toMatch(/animate-pulse/);
  });

  test('has FileText in empty state', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/FileText/);
  });
});
