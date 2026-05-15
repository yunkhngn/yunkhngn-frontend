// __tests__/project-list-visual.test.js
const fs = require('fs');
const path = require('path');

describe('ProjectListClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'project', 'ProjectListClient.jsx');

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

  test('imports motion from framer-motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/motion/);
    expect(source).toMatch(/framer-motion/);
  });

  test('defines cardContainerVariants with staggerChildren', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/staggerChildren/);
  });

  test('has skeleton loading (animate-pulse + aspect-video)', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/animate-pulse/);
    expect(source).toMatch(/aspect-video/);
  });

  test('has FolderOpen in empty state', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/FolderOpen/);
  });
});
