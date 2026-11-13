const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../');
const CORPUS_FILE = path.join(REPO_ROOT, '.context', 'code-corpus.json');

/**
 * Parses CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let kind = null;
  let limit = 15;
  const queryTokens = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--kind' && args[i + 1]) {
      kind = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10) || 15;
      i++;
    } else {
      queryTokens.push(args[i]);
    }
  }

  return {
    query: queryTokens.join(' ').trim().toLowerCase(),
    kind,
    limit
  };
}

/**
 * Scores a chunk based on query token matches
 */
function scoreChunk(chunk, tokens) {
  let score = 0;
  const searchableText = [
    chunk.name || '',
    chunk.signature || '',
    chunk.parent || '',
    chunk.file || '',
    Array.isArray(chunk.locatorsDefined) ? chunk.locatorsDefined.join(' ') : '',
    Array.isArray(chunk.locatorsUsed) ? chunk.locatorsUsed.join(' ') : '',
    Array.isArray(chunk.fixtures) ? chunk.fixtures.join(' ') : '',
    chunk.code ? chunk.code.slice(0, 300) : ''
  ].join(' ').toLowerCase();

  for (const token of tokens) {
    if (!token) continue;
    // Exact name match
    if (chunk.name && chunk.name.toLowerCase() === token) {
      score += 15;
    } else if (chunk.name && chunk.name.toLowerCase().includes(token)) {
      score += 8;
    }

    // Signature match
    if (chunk.signature && chunk.signature.toLowerCase().includes(token)) {
      score += 6;
    }

    // File name match
    if (chunk.file && chunk.file.toLowerCase().includes(token)) {
      score += 4;
    }

    // General text match
    if (searchableText.includes(token)) {
      score += 2;
    }
  }

  return score;
}

/**
 * Main query function
 */
function queryCorpus() {
  const { query, kind, limit } = parseArgs();

  if (!query) {
    console.error('❌ Error: Please provide a search query.\nUsage: npm run corpus:query -- "<query>" [--kind class|method|test] [--limit <n>]');
    process.exit(1);
  }

  if (!fs.existsSync(CORPUS_FILE)) {
    console.log('⚠️ Corpus file not found. Building AST code corpus first...');
    const { buildCodeCorpus } = require('./ast-chunker');
    buildCodeCorpus();
  }

  const corpusData = JSON.parse(fs.readFileSync(CORPUS_FILE, 'utf-8'));
  const tokens = query.split(/\s+/).filter(Boolean);

  let filtered = corpusData.chunks;
  if (kind) {
    filtered = filtered.filter(c => c.kind === kind);
  }

  const scored = filtered
    .map(chunk => ({ chunk, score: scoreChunk(chunk, tokens) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) {
    console.log(`🔍 No matches found in Code Corpus for query: "${query}"`);
    return;
  }

  console.log(`\n🔍 Code Corpus Query Results for: "${query}" (Found ${scored.length} matches)\n${'='.repeat(70)}`);

  // Group by kind for clear agent comprehension
  const classes = scored.filter(s => s.chunk.kind === 'class');
  const methods = scored.filter(s => s.chunk.kind === 'method');
  const tests = scored.filter(s => s.chunk.kind === 'test');

  if (classes.length > 0) {
    console.log('\n📦 PAGE OBJECT CLASSES:');
    classes.forEach(({ chunk }) => {
      console.log(`  • ${chunk.name} (${chunk.file}:${chunk.startLine}-${chunk.endLine})`);
      if (chunk.locatorsDefined && chunk.locatorsDefined.length > 0) {
        console.log(`    Locators Defined: ${chunk.locatorsDefined.slice(0, 3).join(', ')}${chunk.locatorsDefined.length > 3 ? '...' : ''}`);
      }
    });
  }

  if (methods.length > 0) {
    console.log('\n⚙️ REUSABLE METHODS:');
    methods.forEach(({ chunk }) => {
      console.log(`  • [${chunk.parent}] ${chunk.signature} (${chunk.file}:${chunk.startLine})`);
      if (chunk.locatorsUsed && chunk.locatorsUsed.length > 0) {
        console.log(`    Locators: ${chunk.locatorsUsed.join(', ')}`);
      }
    });
  }

  if (tests.length > 0) {
    console.log('\n🧪 EXISTING TEST SCENARIOS (Deduplication Check):');
    tests.forEach(({ chunk }) => {
      console.log(`  • [${chunk.parent}] "${chunk.name}"`);
      console.log(`    File: ${chunk.file}:${chunk.startLine} | Fixtures: ${chunk.fixtures?.join(', ') || 'none'}`);
    });
  }

  console.log(`\n${'='.repeat(70)}\n`);
}

if (require.main === module) {
  queryCorpus();
}

module.exports = { queryCorpus };
