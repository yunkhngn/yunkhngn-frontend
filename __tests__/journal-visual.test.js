const fs = require('fs');
const path = require('path');

describe('JournalClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'journal', 'JournalClient.jsx');

  test('imports PageHero', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/PageHero/);
  });

  test('imports motion from framer-motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/from ['"]framer-motion['"]/);
    expect(source).toMatch(/motion/);
  });

  test('defines cardContainerVariants with staggerChildren', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/staggerChildren/);
  });

  test('uses whileInView on timeline', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/whileInView/);
  });
});
