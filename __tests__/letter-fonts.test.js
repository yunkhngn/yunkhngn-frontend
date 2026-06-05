const fs = require('fs');
const path = require('path');

describe('handwriting font registration', () => {
  const layout = fs.readFileSync(
    path.join(process.cwd(), 'app', 'layout.jsx'),
    'utf8',
  );
  const tailwind = fs.readFileSync(
    path.join(process.cwd(), 'tailwind.config.js'),
    'utf8',
  );

  test('layout loads both local handwriting fonts', () => {
    expect(layout).toMatch(/next\/font\/local/);
    expect(layout).toMatch(/Reebie\.ttf/);
    expect(layout).toMatch(/fz-handwriting\.ttf/);
    expect(layout).toMatch(/--font-reebie/);
    expect(layout).toMatch(/--font-fz/);
  });

  test('layout applies the font CSS variables to the body', () => {
    expect(layout).toMatch(/reebie\.variable/);
    expect(layout).toMatch(/fzHandwriting\.variable/);
  });

  test('tailwind exposes reebie and fz font families', () => {
    expect(tailwind).toMatch(/reebie:\s*\["var\(--font-reebie\)"/);
    expect(tailwind).toMatch(/fz:\s*\["var\(--font-fz\)"/);
  });
});
