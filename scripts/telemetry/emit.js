#!/usr/bin/env node
/**
 * QA-SDLC Live Telemetry Emitter
 *
 * Usage:
 *   node scripts/telemetry/emit.js \
 *     --ticket CTMQ-75 \
 *     --agent script-agent \
 *     --stage BUILD \
 *     --step corpus-query \
 *     --status passed \
 *     --duration 12 \
 *     --message "Matched StatusOptionsPage, BaseTempFormPage, ClientDetailPage" \
 *     --reused 8 \
 *     --artifact ".context/code-corpus.json"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const TELEMETRY_DIR = path.join(ROOT_DIR, '.context', 'telemetry');

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

function emitEvent(rawInput = {}) {
  if (!fs.existsSync(TELEMETRY_DIR)) {
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  }

  const branch = rawInput.branch || getCurrentBranch();
  const ticket = (rawInput.ticket || process.env.TICKET_ID || inferTicketFromBranch(branch)).toUpperCase();

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: rawInput.timestamp || new Date().toISOString(),
    ticket,
    branch,
    agent: rawInput.agent || 'script-agent',
    stage: (rawInput.stage || 'BUILD').toUpperCase(),
    step: rawInput.step || 'step-update',
    label: rawInput.label || rawInput.step || 'Step Update',
    status: rawInput.status || 'passed', // in_progress | passed | skipped | failed | repaired | waiting
    durationSec: rawInput.duration !== undefined ? Number(rawInput.duration) : undefined,
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

  const ledgerFile = path.join(TELEMETRY_DIR, `${ticket}.jsonl`);
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

module.exports = { emitEvent, TELEMETRY_DIR };
