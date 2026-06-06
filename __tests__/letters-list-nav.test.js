const fs = require('fs');
const path = require('path');

describe('Admin LettersClient is list-only + navigation', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app', '(admin)', 'admin', 'letters', 'LettersClient.jsx'),
    'utf8',
  );

  test('navigates to the create page', () => {
    expect(source).toMatch(/useRouter/);
    expect(source).toMatch(/router\.push\('\/admin\/letters\/new'\)/);
  });

  test('navigates to the edit page by id', () => {
    expect(source).toMatch(/router\.push\(`\/admin\/letters\/\$\{letter\.id\}`\)/);
  });

  test('no longer renders an inline form dialog', () => {
    expect(source).not.toMatch(/<Dialog\b/);
    expect(source).not.toMatch(/uploadImageAt/);
    expect(source).not.toMatch(/handleSave/);
  });
});
