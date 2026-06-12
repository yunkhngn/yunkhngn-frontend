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
    expect(source).toMatch(/import\s+\{\s*m\s+as\s+motion\s+\}\s+from ['"]framer-motion['"]/);
  });

  test('defines cardContainerVariants with staggerChildren', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/cardContainerVariants/);
    expect(source).toMatch(/staggerChildren/);
  });

  test('has a route-level loading state and aspect-video cards', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/aspect-video/);
    const loadingPath = path.join(process.cwd(), 'app', '(public)', 'project', 'loading.jsx');
    const loadingSource = fs.readFileSync(loadingPath, 'utf8');
    expect(loadingSource).toMatch(/animate-/);
  });

  test('receives project data from the server component', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/function ProjectList\(\{\s*projects = \[\],\s*repos = \[\]\s*\}\)/);
    expect(source).not.toMatch(/readNestJson/);
    expect(source).not.toMatch(/useEffect/);
  });

  test('has FolderOpen in empty state', () => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toMatch(/FolderOpen/);
  });
});
