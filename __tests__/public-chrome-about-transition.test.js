const fs = require('fs');
const path = require('path');

describe('PageTransition component', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'PageTransition.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  test('disables route transition animation on /about', () => {
    expect(source).toMatch(/pathname\s*!==\s*['"]\/about['"]/);
  });

  test('is wired into the public route group via template.jsx', () => {
    const templatePath = path.join(process.cwd(), 'app', '(public)', 'template.jsx');
    const template = fs.readFileSync(templatePath, 'utf8');
    expect(template).toMatch(/PageTransition/);
  });
});
