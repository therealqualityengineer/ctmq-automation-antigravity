const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const REPO_ROOT = path.resolve(__dirname, '../../');
const OUTPUT_DIR = path.join(REPO_ROOT, '.context');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'code-corpus.json');

const TARGET_DIRECTORIES = [
  { dir: 'pages', kind: 'page_object' },
  { dir: 'tests', kind: 'test_spec' },
  { dir: 'fixtures', kind: 'fixture' }
];

/**
 * Extracts string literals and locator calls from an AST node
 */
function extractLocators(sourceFile, node) {
  const locators = [];

  function visit(child) {
    if (ts.isCallExpression(child)) {
      const text = child.expression.getText(sourceFile);
      if (
        text.includes('getBy') ||
        text.includes('locator') ||
        text.includes('waitForSelector')
      ) {
        locators.push(child.getText(sourceFile));
      }
    }
    ts.forEachChild(child, visit);
  }

  visit(node);
  return Array.from(new Set(locators));
}

/**
 * Parses Page Object classes, constructors, and methods
 */
function parsePageObject(sourceFile, relPath) {
  const chunks = [];

  function visit(node) {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;
      const classStart = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      const classEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

      // Extract constructor and locators catalog
      const constructorNode = node.members.find(m => ts.isConstructorDeclaration(m));
      const locators = constructorNode ? extractLocators(sourceFile, constructorNode) : [];

      chunks.push({
        id: `${relPath}#${className}`,
        file: relPath,
        kind: 'class',
        parent: null,
        name: className,
        startLine: classStart,
        endLine: classEnd,
        locatorsDefined: locators,
        signature: `class ${className}`,
        code: node.getText(sourceFile).slice(0, 400) + '...' // summary preview
      });

      // Extract each method as an independent chunk
      node.members.forEach(member => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText(sourceFile);
          const methodStart = sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile)).line + 1;
          const methodEnd = sourceFile.getLineAndCharacterOfPosition(member.getEnd()).line + 1;
          const methodLocators = extractLocators(sourceFile, member);

          // Get parameters
          const params = member.parameters.map(p => p.getText(sourceFile)).join(', ');
          const isAsync = member.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword);
          const sig = `${isAsync ? 'async ' : ''}${methodName}(${params})`;

          chunks.push({
            id: `${relPath}#${className}.${methodName}`,
            file: relPath,
            kind: 'method',
            parent: className,
            name: methodName,
            startLine: methodStart,
            endLine: methodEnd,
            signature: sig,
            locatorsUsed: methodLocators,
            code: member.getText(sourceFile)
          });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return chunks;
}

/**
 * Parses Playwright test files for test.describe and test(...) blocks
 */
function parseTestSpec(sourceFile, relPath) {
  const chunks = [];
  let currentSuite = 'Root';

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const exprText = node.expression.getText(sourceFile);

      // Check for test.describe(...)
      if (exprText === 'test.describe' && node.arguments.length > 0) {
        const suiteTitle = node.arguments[0].getText(sourceFile).replace(/['"]/g, '');
        currentSuite = suiteTitle;
      }

      // Check for test('...', async ({ fixtures }) => { ... })
      if (
        (exprText === 'test' || exprText === 'test.only' || exprText === 'test.skip') &&
        node.arguments.length >= 2
      ) {
        const titleArg = node.arguments[0];
        const title = ts.isStringLiteral(titleArg) ? titleArg.text : titleArg.getText(sourceFile).replace(/['"]/g, '');
        
        const testStart = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
        const testEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
        const testLocators = extractLocators(sourceFile, node);

        // Extract fixtures used
        const fnArg = node.arguments[1];
        let fixturesUsed = [];
        if (fnArg && (ts.isArrowFunction(fnArg) || ts.isFunctionExpression(fnArg))) {
          if (fnArg.parameters.length > 0) {
            fixturesUsed = fnArg.parameters[0].getText(sourceFile).replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean);
          }
        }

        chunks.push({
          id: `${relPath}#${title.slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          file: relPath,
          kind: 'test',
          parent: currentSuite,
          name: title,
          startLine: testStart,
          endLine: testEnd,
          fixtures: fixturesUsed,
          locatorsUsed: testLocators,
          code: node.getText(sourceFile)
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return chunks;
}

/**
 * Main chunking coordinator
 */
function buildCodeCorpus() {
  console.log('🚀 Starting AST Code Chunker...');
  const allChunks = [];
  const stats = {
    pageObjects: 0,
    methods: 0,
    tests: 0,
    filesProcessed: 0
  };

  TARGET_DIRECTORIES.forEach(({ dir, kind }) => {
    const fullDir = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

    files.forEach(file => {
      const filePath = path.join(fullDir, file);
      const relPath = path.relative(REPO_ROOT, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');

      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      stats.filesProcessed++;

      let fileChunks = [];
      if (kind === 'page_object') {
        fileChunks = parsePageObject(sourceFile, relPath);
      } else if (kind === 'test_spec') {
        fileChunks = parseTestSpec(sourceFile, relPath);
      } else {
        // Fallback for fixtures or utils
        fileChunks = parsePageObject(sourceFile, relPath);
      }

      fileChunks.forEach(chunk => {
        if (chunk.kind === 'class') stats.pageObjects++;
        if (chunk.kind === 'method') stats.methods++;
        if (chunk.kind === 'test') stats.tests++;
      });

      allChunks.push(...fileChunks);
    });
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const corpus = {
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: 'AST Symbol Chunker v1.0',
      totalFilesScanned: stats.filesProcessed,
      totalChunks: allChunks.length,
      stats
    },
    chunks: allChunks
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(corpus, null, 2), 'utf-8');

  console.log(`✅ Code Corpus successfully generated at: ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Files Processed: ${stats.filesProcessed}`);
  console.log(`   - Page Object Classes: ${stats.pageObjects}`);
  console.log(`   - Page Methods: ${stats.methods}`);
  console.log(`   - Test Scenarios: ${stats.tests}`);
  console.log(`   - Total Chunks: ${allChunks.length}`);

  return corpus;
}

if (require.main === module) {
  buildCodeCorpus();
}

module.exports = { buildCodeCorpus };
