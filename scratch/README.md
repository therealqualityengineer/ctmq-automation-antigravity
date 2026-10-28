# Scratch & Probe Workbench

This directory is **git-ignored** (`/scratch/`).

## Purpose
Used by `script-agent` and developers as an optional exploratory workbench:
- **Live Run Element Probing**: Quick one-off scripts to inspect accessibility trees, Shadow DOM, tricky iframes, or test candidate locators before integrating them into formal Page Objects.
- **Root Cause Analysis (RCA)**: Temporary diagnostic scripts, DOM snapshot dumps, or network response inspections during test failure analysis.
- **Local Knowledge Reference**: Retain useful probe patterns or selector notes locally for future reference without polluting the production test suites.

## Guidelines
1. **Never import from `scratch/` into `tests/` or `pages/`**.
2. **Production Code is Source of Truth**: All verified locators and flows must be ported into their proper Page Objects (`pages/`), test data (`test-data/`), and specs (`tests/`).
3. Files here are local-only and will not be tracked or committed to Git.

