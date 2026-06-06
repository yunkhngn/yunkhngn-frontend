const fs = require('fs');
const path = require('path');

describe('LetterForm', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'components', 'admin', 'LetterForm.jsx'),
    'utf8',
  );

  test('is a client component that navigates back to the list on save', () => {
    expect(source).toMatch(/'use client'/);
    expect(source).toMatch(/useRouter/);
    expect(source).toMatch(/router\.push\('\/admin\/letters'\)/);
  });

  test('supports both scan and text modes via the shared LetterEditor', () => {
    expect(source).toMatch(/LetterEditor/);
    expect(source).toMatch(/kind:\s*'scan'/);
    expect(source).toMatch(/form\.kind\s*===\s*'text'/);
  });

  test('POSTs on create and PATCHes on edit', () => {
    expect(source).toMatch(/editing\s*\?\s*'PATCH'\s*:\s*'POST'/);
  });

  test('uploads page images to Cloudinary for scans', () => {
    expect(source).toMatch(/cloudinary\.com/);
    expect(source).toMatch(/secure_url/);
  });
});
