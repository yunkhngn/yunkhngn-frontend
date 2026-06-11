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

  test('receives initial tag without useSearchParams', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).not.toMatch(/useSearchParams/);
    expect(source).toMatch(/initialTag = null/);
    expect(source).toMatch(/useState\(initialTag\)/);
  });

  test('blog page renders client directly with initialTag', () => {
    const source = fs.readFileSync(pagePath, 'utf8');
    expect(source).not.toMatch(/Suspense/);
    expect(source).toMatch(/searchParams/);
    expect(source).toMatch(/initialTag={initialTag}/);
  });

  test('blog list fetch throws on apiFetch errors', () => {
    const source = fs.readFileSync(fetchDataPath, 'utf8');
    expect(source).toMatch(/error/);
    expect(source).toMatch(/throw new Error/);
    expect(source).toMatch(/Array\.isArray\(data\)/);
  });
});
