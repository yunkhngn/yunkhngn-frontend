const fs = require('fs');
const path = require('path');

describe('BlogListClient visual polish', () => {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'blog', 'BlogListClient.jsx');
  const loadingPath = path.join(process.cwd(), 'app', '(public)', 'blog', 'loading.jsx');
  const pagePath = path.join(process.cwd(), 'app', '(public)', 'blog', 'page.jsx');
  const fetchDataPath = path.join(process.cwd(), 'lib', 'fetchBlogListData.js');

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

  test('syncs tag query param in a tiny Suspense child', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/BlogTagParamSync/);
    expect(source).toMatch(/useSearchParams/);
    expect(source).toMatch(/Suspense fallback={null}/);
    expect(source).toMatch(/onTagChange\(tag \|\| null\)/);
  });

  test('blog page stays static ISR without searchParams', () => {
    const source = fs.readFileSync(pagePath, 'utf8');
    expect(source).not.toMatch(/Suspense/);
    expect(source).not.toMatch(/searchParams/);
    expect(source).toMatch(/revalidate = 120/);
    expect(source).toMatch(/<BlogListClient blogs={blogs} \/>/);
  });

  test('blog list fetch returns an empty list on apiFetch errors', () => {
    const source = fs.readFileSync(fetchDataPath, 'utf8');
    expect(source).toMatch(/error/);
    expect(source).toMatch(/console\.warn/);
    expect(source).toMatch(/return \[\]/);
    expect(source).toMatch(/Array\.isArray\(data\)/);
  });
});
