const fs = require('fs');
const path = require('path');

describe('HomeContent visual overhaul', () => {
  const filePath = path.join(process.cwd(), 'components', 'home', 'HomeContent.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  test('imports HeroBackground', () => {
    expect(source).toMatch(/import HeroBackground/);
  });

  test('imports RevealHeading', () => {
    expect(source).toMatch(/import RevealHeading/);
  });

  test('imports TiltCard', () => {
    expect(source).toMatch(/import TiltCard/);
  });

  test('hero has gradient text class', () => {
    expect(source).toMatch(/bg-gradient-to-br from-foreground to-foreground\/60/);
    expect(source).toMatch(/bg-clip-text text-transparent/);
  });

  test('role chips are present', () => {
    expect(source).toMatch(/Software Engineer/);
    expect(source).toMatch(/Graphic Designer/);
    expect(source).toMatch(/Guitarist/);
  });

  test('uses heroContainerVariants for stagger', () => {
    expect(source).toMatch(/heroContainerVariants/);
    expect(source).toMatch(/heroItemVariants/);
  });

  test('uses cardContainerVariants for section cards', () => {
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/cardItemVariants/);
  });

  test('gallery uses ParallaxPhoto with useScroll', () => {
    expect(source).toMatch(/ParallaxPhoto/);
    expect(source).toMatch(/useScroll/);
  });

  test('uses gradient dividers between sections', () => {
    expect(source).toMatch(/from-transparent via-border to-transparent/);
  });

  test('uses space-y-32 for outer container', () => {
    expect(source).toMatch(/space-y-32/);
  });
});
