import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Playwright Custom Reporter for QA-SDLC Live Dashboard.
 * Automatically streams Playwright test execution starts, passes, failures, and retries
 * into .context/telemetry/<TICKET>.jsonl so the Live Flow & Evaluation tabs update in real time.
 */
class TelemetryReporter implements Reporter {
  private rootDir: string;
  private telemetryDir: string;
  private startTime: number = 0;
  private totalTests: number = 0;
  private passedTests: number = 0;
  private failedTests: number = 0;
  private skippedTests: number = 0;
  private retriedTests: number = 0;
  private detectedTicket: string = 'CTMQ-LIVE';
  private branch: string = 'main';
  private specFiles: Set<string> = new Set();

  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.telemetryDir = path.join(this.rootDir, '.context', 'telemetry');
  }

  private resolveBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.rootDir,
        stdio: ['ignore', 'pipe', 'ignore']
      })
        .toString()
        .trim();
    } catch {
      return 'main';
    }
  }

  private resolveTicket(suite: Suite): string {
    if (process.env.TICKET_ID) {
      return process.env.TICKET_ID.toUpperCase();
    }
    const branchMatch = this.branch.match(/([A-Z]+-\d+)/i);
    if (branchMatch) {
      return branchMatch[1].toUpperCase();
    }
    const allTests = suite.allTests();
    for (const test of allTests) {
      const file = test.location?.file || '';
      const titleMatch = test.title.match(/(CTMQ-\d+)/i) || file.match(/(ctmq-\d+)/i);
      if (titleMatch) {
        return titleMatch[1].toUpperCase();
      }
    }
    // Check active-state.json if available
    try {
      const stateFile = path.join(this.telemetryDir, 'active-state.json');
      if (fs.existsSync(stateFile)) {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (state.activeTicket) return state.activeTicket;
      }
    } catch {
      // ignore
    }
    return 'CTMQ-75';
  }

  private appendTelemetry(payload: Record<string, unknown>): void {
    try {
      if (!fs.existsSync(this.telemetryDir)) {
        fs.mkdirSync(this.telemetryDir, { recursive: true });
      }
      const event = {
        id: `pw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        ticket: this.detectedTicket,
        branch: this.branch,
        agent: 'script-agent',
        ...payload
      };
      const ledgerFile = path.join(this.telemetryDir, `${this.detectedTicket}.jsonl`);
      fs.appendFileSync(ledgerFile, JSON.stringify(event) + '\n', 'utf8');

      const stateFile = path.join(this.telemetryDir, 'active-state.json');
      fs.writeFileSync(
        stateFile,
        JSON.stringify(
          {
            activeTicket: this.detectedTicket,
            activeBranch: this.branch,
            lastAgent: 'script-agent',
            lastStage: event.stage,
            lastStep: event.step,
            lastStatus: event.status,
            updatedAt: event.timestamp
          },
          null,
          2
        ),
        'utf8'
      );
    } catch {
      // Never fail test run due to telemetry I/O
    }
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.branch = this.resolveBranch();
    this.detectedTicket = this.resolveTicket(suite);
    const tests = suite.allTests();
    this.totalTests = tests.length;

    for (const t of tests) {
      if (t.location?.file) {
        this.specFiles.add(path.relative(this.rootDir, t.location.file));
      }
    }

    this.appendTelemetry({
      stage: 'VERIFY',
      step: 'playwright-run',
      label: 'Playwright Suite Execution',
      status: 'in_progress',
      testsTotal: this.totalTests,
      testsPassed: 0,
      testsFailed: 0,
      message: `Executing ${this.totalTests} Playwright tests (${Array.from(this.specFiles).join(', ')})`,
      artifacts: Array.from(this.specFiles)
    });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      this.passedTests++;
      if (result.retry > 0) {
        this.retriedTests++;
      }
    } else if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests++;
    } else if (result.status === 'skipped') {
      this.skippedTests++;
    }

    const durationSec = Math.round((result.duration || 0) / 100) / 10;
    const relSpec = test.location?.file
      ? path.relative(this.rootDir, test.location.file)
      : 'tests/spec.ts';

    this.appendTelemetry({
      stage: 'VERIFY',
      step: 'playwright-run',
      label: 'Playwright Suite Execution',
      status: this.failedTests > 0 ? 'failed' : 'in_progress',
      durationSec,
      testsTotal: this.totalTests,
      testsPassed: this.passedTests,
      testsFailed: this.failedTests,
      message: `${result.status === 'passed' ? '✓' : '✗'} ${test.title} (${durationSec}s)`,
      artifacts: [relSpec]
    });
  }

  onEnd(result: FullResult): void {
    const totalDurationSec = Math.round((Date.now() - this.startTime) / 100) / 10;
    const finalStatus =
      result.status === 'passed' && this.failedTests === 0
        ? this.retriedTests > 0
          ? 'repaired'
          : 'passed'
        : 'failed';

    this.appendTelemetry({
      stage: 'VERIFY',
      step: 'playwright-run',
      label: 'Playwright Suite Execution',
      status: finalStatus,
      durationSec: totalDurationSec,
      testsTotal: this.totalTests,
      testsPassed: this.passedTests,
      testsFailed: this.failedTests,
      message: `Playwright run ${finalStatus.toUpperCase()}: ${this.passedTests}/${this.totalTests} passed in ${totalDurationSec}s`,
      artifacts: [...Array.from(this.specFiles), 'playwright-report/index.html']
    });
  }
}

export default TelemetryReporter;
