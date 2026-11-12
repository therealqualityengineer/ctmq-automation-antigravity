# Automation Framework Rules & Guidelines

These rules govern how AI agents generate test plans and automation code in this repository.

## 1. Architecture Standards
- All tests live under `tests/*.spec.ts`.
- Every test must use custom fixtures from `fixtures/customFixtures.ts`.
- Page interactions must be encapsulated in Page Object classes under `pages/` extending `BasePage`.
- Test data must never be hardcoded in test specs; import from `test-data/`.
- Utility functions must live in `utils/`.
- **Deduplication & DRY Principles**:
  - **Specs**: Scan existing `tests/*.spec.ts` before creating new test files. Never duplicate test scenarios that are already covered by existing specs. Augment existing tests or reference them instead of creating redundant tests.
  - **Page Objects**: Never duplicate locators or action methods across multiple Page Objects. Global layout elements (header, nav links, logout) and generic browser interactions (`setViewport`, `pressTab`, validity checks) belong in `BasePage` or shared components. Shared forms (e.g. create vs edit) must inherit from a common base form class.
  - **Test Data**: Check `test-data/` to reuse existing interfaces, URLs, and data generators rather than duplicating data models.

## 2. Assertion & Verification Principles
- **Never weaken assertions**: An assertion must verify genuine business intent. Do not replace strict assertions with loose checks (e.g. `toBeTruthy()`) just to force a pass.
- **Explicit Waits**: Prefer web-first assertions (e.g., `await expect(locator).toBeVisible()`) over arbitrary `page.waitForTimeout()`.

## 3. Locator Best Practices
- Prefer user-facing locators: `page.getByRole()`, `page.getByLabel()`, `page.getByTestId()`.
- Use CSS or XPath only when semantic locators are unavailable.
- Centralize all locators inside the relevant Page Object constructor.

## 4. Git & Branching Standards
- **Branch Protection**: Never commit or merge directly to `main` or `master`. Always switch to a dedicated feature or test branch before staging/committing.
- **Commit Messages**: Write meaningful, structured commit messages following Conventional Commits format (`feat:`, `test:`, `fix:`, `refactor:`, `chore:`).
- **Pull Requests**: Every PR must include a comprehensive description detailing changes, affected Page Objects, Specs, Test Plans, and verification steps.

## 5. Agent Roles, Separation of Concerns & Trigger Prompts

| Agent | Trigger Prompt | Example | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **`plan-agent`** | `Add Testcase {JiraTicket}` | `Add Testcase CTMQ-10` | Design QA test cases & update `"QA Testing Antigravity"` sub-task |
| **`script-agent`** | `Write test {JiraTicket}` | `Write test CTMQ-10` | Generate & run Playwright tests, execute RCA / auto-fix |
| **`git-agent`** | `CB {Branch Name/Ticket number}`<br>`Raise PR` | `CB CTMQ-10`<br>`Raise PR` | Safe branch creation from updated main & PR creation |
| **`jira-agent`** | `CL {JiraTicket}` | `CL CTMQ-10` | Self-assignment, complete QA sub-task, audit & close parent ticket |

- **`plan-agent` (Master of Testcase Design)**:
  - **Trigger Prompt**: `Add Testcase {JiraTicket}` (e.g., `Add Testcase CTMQ-10`)
  - Focuses solely on business logic, requirement interpretation, test scenario design, and QA testing methodologies.
  - Must **never** inspect repository test files or dictate automation implementation (e.g., file paths, target page objects, code structure).
  - Must **never** control or guide `script-agent`.
- **`script-agent` (Master of Test Write & Execution)**:
  - **Trigger Prompt**: `Write test {JiraTicket}` (e.g., `Write test CTMQ-10`)
  - Has full ownership over automation architecture.
  - Independently decides what to automate vs. manual and analyzes the codebase to identify reusable components vs. what must be created new.
  - Actively audits `tests/` and `pages/` to prevent duplicate test scenarios, duplicate locators, and redundant helper methods.
  - Responsible for writing clean, layered Playwright TypeScript tests.
- **`git-agent` (Master of Git Workflow & Branch Safety)**:
  - **Trigger Prompts**:
    - `CB {Branch Name/Ticket number}` (e.g., `CB CTMQ-10`, `CB feat/login`) — Stashes changes, pulls latest `main`, and checks out a new branch.
    - `Raise PR` or `Raise PR {JiraTicket}` — Validates branch safety, commits changes with Conventional Commits, and creates a detailed PR.
  - Enforces branch safety guardrails (blocks direct commits to `master` or `main`).
  - Manages branch creation from updated `main` (`CB {Branch Name/Ticket number}`).
  - Formulates Conventional Commits and generates high-quality Pull Requests with detailed documentation.
- **`jira-agent` (Master of Jira Lifecycle & Ticket Closure)**:
  - **Trigger Prompt**: `CL {JiraTicket}` (e.g., `CL CTMQ-10`)
  - Manages ticket self-assignment to the active user for parent tickets and sub-tasks.
  - Completes the `"QA Testing Antigravity"` sub-task first.
  - Audits sibling sub-tasks and strictly enforces that all sub-tasks must be in a completed status before closing the parent ticket.
  - Halts and immediately alerts the user if any sibling sub-tasks remain open or in progress.

## 6. Test Execution & Failure Handling
- **Mandatory Test Execution**: Once test writing is completed for a ticket, `script-agent` must run the tests (`npx playwright test <spec>`) and verify that all tests pass.
- **Root Cause Analysis & Auto-Fix**: If a test fails, diagnose the root cause (locators, synchronization, fixture, test data) and fix it. Never weaken assertions to force a pass.
- **Escalate Unfixable Failures**: If a test cannot be fixed due to an application bug, environment/service outage, or missing permissions, stop immediately and inform the user with a detailed failure report.

## 7. Continuous Learning & Knowledge Retention
To ensure agents build compound intelligence between Ticket #1 and Ticket #100:
- **Application Blueprint (`context_docs/application_knowledge.md`)**:
  - `plan-agent` must read this file before generating test scenarios to incorporate system workflows, user roles, and cross-feature dependencies.
  - Upon completing a ticket test plan, `plan-agent` updates this blueprint with newly discovered entities, validations, and business rules.
- **Timing & Gotchas Memory (`context_docs/app_gotchas.md`)**:
  - `script-agent` must consult this file before authoring tests to avoid known UI timing, selector, or modal traps.
  - When resolving failures or DOM quirks via RCA, `script-agent` records the finding and resolution here.
- **Probe Workbench (`scratch/`)**:
  - `script-agent` reuses existing `scratch/probe-*.ts` scripts or creates new standalone probes for rapid DOM inspection and isolated RCA debugging.
  - Probes remain the executable testbench; distilled lessons must always be ported into `context_docs/app_gotchas.md`.

