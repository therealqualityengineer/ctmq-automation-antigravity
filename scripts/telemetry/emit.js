#!/usr/bin/env node
/**
 * QA-SDLC Live Telemetry Emitter
 *
 * Usage:
 *   node scripts/telemetry/emit.js \
 *     --ticket CTMQ-78 \
 *     --agent script-agent \
 *     --stage BUILD \
 *     --step corpus-query \
 *     --status passed \
 *     --duration 12 \
 *     --message "Matched BaseTempFormPage, AddTempPage, TempDetailPage" \
 *     --reused 14 \
 *     --artifact ".context/code-corpus.json"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const TELEMETRY_DIR = path.join(ROOT_DIR, '.context', 'telemetry');

const STEP_LABELS = {
  'orchestrator-start': 'QA Orchestrator Agent Started',
  'orchestrator-halt': 'QA Orchestrator Agent Halted (Blocker/Bug)',
  'orchestrator-complete': 'QA Orchestrator Agent Completed E2E',
  'jira-fetch': 'Jira Fetch & Story Analysis',
  'blueprint-read': 'Domain Blueprint Grounding',
  'testcase-design': 'QA Test Case Design (EP/BVA)',
  'subtask-sync': 'Sync "QA Testing Antigravity"',
  'branch-create': 'Safe Branch Creation (CB)',
  'corpus-query': 'Code Corpus Query & Deduplication',
  'gotchas-check': 'Gotchas Memory Check',
  'code-author': 'Page Object & Spec Authoring',
  'playwright-run': 'Playwright Suite Execution',
  'rca-heal': 'RCA & Probe Auto-Fix',
  'corpus-sync': 'AST Corpus & Gotchas Auto-Sync',
  'raise-pr': 'Commit & Raise Pull Request',
  'jira-close': 'Complete Sub-task & Close Ticket (CL)'
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
  } catch {
    return 'main';
  }
}

function inferTicketFromBranch(branch) {
  const match = branch.match(/([A-Z]+-\d+)/i);
  return match ? match[1].toUpperCase() : 'CTMQ-LIVE';
}

function readExistingEvents(ledgerFile) {
  if (!fs.existsSync(ledgerFile)) return [];
  return fs
    .readFileSync(ledgerFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function computeElapsedSeconds(existingEvents, step, nowIso) {
  const nowMs = new Date(nowIso).getTime();
  if (Number.isNaN(nowMs) || existingEvents.length === 0) return 15;

  // Prefer matching in_progress event for the same step
  for (let i = existingEvents.length - 1; i >= 0; i--) {
    const prev = existingEvents[i];
    if (prev.step === step && prev.status === 'in_progress' && prev.timestamp) {
      const diffSec = Math.round((nowMs - new Date(prev.timestamp).getTime()) / 1000);
      if (diffSec > 0 && diffSec < 1800) return diffSec;
    }
  }

  // Otherwise use elapsed time since the most recent completed event
  const lastEvt = existingEvents[existingEvents.length - 1];
  if (lastEvt && lastEvt.timestamp) {
    const diffSec = Math.round((nowMs - new Date(lastEvt.timestamp).getTime()) / 1000);
    if (diffSec > 0 && diffSec < 1800) return diffSec;
  }

  return 15;
}

function emitEvent(rawInput = {}) {
  if (!fs.existsSync(TELEMETRY_DIR)) {
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  }

  const branch = rawInput.branch || getCurrentBranch();
  const ticket = (rawInput.ticket || process.env.TICKET_ID || inferTicketFromBranch(branch)).toUpperCase();
  const ledgerFile = path.join(TELEMETRY_DIR, `${ticket}.jsonl`);
  if (rawInput.reset && fs.existsSync(ledgerFile)) {
    fs.unlinkSync(ledgerFile);
  }
  const existingEvents = readExistingEvents(ledgerFile);

  const timestamp = rawInput.timestamp || new Date().toISOString();
  const step = rawInput.step || 'step-update';
  const status = rawInput.status || 'passed'; // in_progress | passed | skipped | failed | repaired | waiting

  let durationSec;
  if (rawInput.duration !== undefined) {
    durationSec = Number(rawInput.duration);
  } else if (status === 'skipped') {
    durationSec = 0;
  } else if (status === 'passed' || status === 'repaired' || status === 'failed') {
    durationSec = computeElapsedSeconds(existingEvents, step, timestamp);
  }

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp,
    ticket,
    branch,
    agent: rawInput.agent || 'script-agent',
    stage: (rawInput.stage || 'BUILD').toUpperCase(),
    step,
    label: rawInput.label || STEP_LABELS[step] || step,
    status,
    durationSec,
    message: rawInput.message || '',
    reason: rawInput.reason || '',
    reusedCount: rawInput.reused !== undefined ? Number(rawInput.reused) : undefined,
    newCount: rawInput.created !== undefined ? Number(rawInput.created) : undefined,
    testsTotal: rawInput.testsTotal !== undefined ? Number(rawInput.testsTotal) : undefined,
    testsPassed: rawInput.testsPassed !== undefined ? Number(rawInput.testsPassed) : undefined,
    testsFailed: rawInput.testsFailed !== undefined ? Number(rawInput.testsFailed) : undefined,
    rcaAttempt: rawInput.rcaAttempt !== undefined ? Number(rawInput.rcaAttempt) : undefined,
    artifacts: rawInput.artifact
      ? String(rawInput.artifact)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  };

  fs.appendFileSync(ledgerFile, JSON.stringify(event) + '\n', 'utf8');

  // Update active state pointer so dashboard knows the most recently active ticket
  const stateFile = path.join(TELEMETRY_DIR, 'active-state.json');
  const activeState = {
    activeTicket: ticket,
    activeBranch: branch,
    lastAgent: event.agent,
    lastStage: event.stage,
    lastStep: event.step,
    lastStatus: event.status,
    updatedAt: event.timestamp
  };
  fs.writeFileSync(stateFile, JSON.stringify(activeState, null, 2), 'utf8');

  return event;
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const emitted = emitEvent(args);
  console.log(
    `[QA-SDLC Telemetry] ${emitted.ticket} | ${emitted.agent} | ${emitted.stage}:${emitted.step} -> ${emitted.status.toUpperCase()}`
  );
}

module.exports = { emitEvent, TELEMETRY_DIR, STEP_LABELS };
