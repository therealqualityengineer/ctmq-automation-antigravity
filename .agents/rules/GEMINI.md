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

## 5. Agent Roles & Separation of Concerns
- **`plan-agent` (Master of Testcase Design)**:
  - Focuses solely on business logic, requirement interpretation, test scenario design, and QA testing methodologies.
  - Must **never** inspect repository test files or dictate automation implementation (e.g., file paths, target page objects, code structure).
  - Must **never** control or guide `script-agent`.
- **`script-agent` (Master of Test Write & Execution)**:
  - Has full ownership over automation architecture.
  - Independently decides what to automate vs. manual and analyzes the codebase to identify reusable components vs. what must be created new.
  - Actively audits `tests/` and `pages/` to prevent duplicate test scenarios, duplicate locators, and redundant helper methods.
  - Responsible for writing clean, layered Playwright TypeScript tests.

## 6. Test Execution & Failure Handling
- **Mandatory Test Execution**: Once test writing is completed for a ticket, `script-agent` must run the tests (`npx playwright test <spec>`) and verify that all tests pass.
- **Root Cause Analysis & Auto-Fix**: If a test fails, diagnose the root cause (locators, synchronization, fixture, test data) and fix it. Never weaken assertions to force a pass.
- **Escalate Unfixable Failures**: If a test cannot be fixed due to an application bug, environment/service outage, or missing permissions, stop immediately and inform the user with a detailed failure report.
