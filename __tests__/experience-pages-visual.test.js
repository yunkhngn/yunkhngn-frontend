const fs = require('fs');
const path = require('path');

describe('ContactClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'contact', 'ContactClient.jsx');

  test('imports PageHero', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/PageHero/);
  });

  test('imports motion from framer-motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/framer-motion/);
    expect(source).toMatch(/\bmotion\b/);
  });

  test('uses font-serif class (not inline style)', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/font-serif/);
    expect(source).not.toMatch(/fontFamily.*playfair/);
  });

  test('has stagger variants for form', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/staggerChildren/);
  });
});

describe('AboutClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'about', 'AboutClient.jsx');

  test('imports HeroBackground', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/HeroBackground/);
  });

  test('imports RevealHeading', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/RevealHeading/);
  });

  test('h1 story uses gradient text', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/bg-clip-text/);
    expect(source).toMatch(/text-transparent/);
  });

  test('has stagger variants for skills or timeline', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/staggerChildren/);
  });
});

describe('KhoaAIClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'khoa-ai', 'KhoaAIClient.jsx');

  test('imports HeroBackground', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/HeroBackground/);
  });

  test('imports motion from framer-motion', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/framer-motion/);
    expect(source).toMatch(/\bmotion\b/);
  });

  test('has entrance animation on mount (initial + animate)', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/initial=\{/);
    expect(source).toMatch(/animate=\{/);
  });

  test('uses subtle HeroBackground in sidebar', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/subtle/);
  });
});
