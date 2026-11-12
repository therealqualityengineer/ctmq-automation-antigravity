# Scratch & Probe Workbench

This directory is an exploratory laboratory and diagnostic workbench used by developers and `script-agent`.

## Purpose & Value
- **Live Run Element Probing**: Quick one-off standalone scripts to inspect accessibility trees, Shadow DOM, tricky iframes, or test candidate locators before adding them to formal Page Objects.
- **Root Cause Analysis (RCA)**: Fast diagnostic runs, DOM snapshot dumps, and network response inspections during test failure analysis without having to run full specs or suites.
- **Continuous Knowledge Source**: Retain useful probe patterns locally so future tickets can reference how a screen or control was previously probed.

## Relationship with the Continuous Learning System

```
[Test Failure / UI Mystery] 
        │
        ▼
[Write or Reuse Probe in scratch/probe-*.ts] ──> Rapidly isolate DOM / timing issue
        │
        ▼
[Port Fix to Page Object / Fixture] ─────────> Production code updated
        │
        ▼
[Distill Finding into context_docs/app_gotchas.md] ──> Permanent memory for future agents
```

## Guidelines
1. **Never import from `scratch/` into `tests/` or `pages/`**.
2. **Reuse Existing Probes First**: Before creating a new probe, scan `scratch/probe-*.ts` to see if the target page or feature already has a working exploration script.
3. **Keep `scratch/` Lightweight**: Probes should be quick, standalone scripts that execute in seconds.
4. **Distill into `app_gotchas.md`**: Whenever a probe script resolves a difficult locator, timing glitch, or API behavior, document the lesson in `context_docs/app_gotchas.md` with a link to the probe script.


