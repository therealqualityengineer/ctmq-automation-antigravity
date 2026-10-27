# Automation Framework Rules & Guidelines

These rules govern how AI agents generate test plans and automation code in this repository.

## 1. Architecture Standards
- All tests live under `tests/*.spec.ts`.
- Every test must use custom fixtures from `fixtures/customFixtures.ts`.
- Page interactions must be encapsulated in Page Object classes under `pages/` extending `BasePage`.
- Test data must never be hardcoded in test specs; import from `test-data/`.
- Utility functions must live in `utils/`.

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
