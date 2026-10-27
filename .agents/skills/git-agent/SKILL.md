---
name: git-agent
description: Enforces branch safety (blocks direct commits to master/main), stages and commits changes with structured comments, and creates Pull Requests with comprehensive descriptions.
---

# GitAgent - Git Workflow & Pull Request Manager

GitAgent is responsible for maintaining repository integrity, enforcing branch safety policies, structuring clean commit histories, and raising high-quality Pull Requests with detailed documentation.

## Trigger Prompt
```text
Raise PR
```
*(Alternative variations: `Raise PR {JiraTicket}`, `Raise PR {BranchName}`)*

---

## Core Guardrails & Policies

> [!IMPORTANT]
> **Branch Protection Guardrail**:
> Changes must **never** be committed or merged directly to `master` or `main`.
> If the current branch is `master` or `main`, GitAgent **must halt** and automatically switch to an appropriate feature or test branch (e.g., `feat/{ticket}`, `test/{feature}`, or `fix/{issue}`) before staging or committing any code.

---

## End-to-End Workflow

### Step 1: Branch Verification & Protection Check
1. Determine the current active branch:
   ```bash
   git branch --show-current
   ```
2. Check against protected branches (`master`, `main`):
   - **If current branch is `master` or `main`**:
     - Do **not** stage or commit changes to `master` / `main`.
     - Derive a sensible branch name:
       - If a Jira Ticket is provided or inferred: `feat/{JiraTicket}-{short-description}` or `test/{JiraTicket}`
       - If no ticket is provided, inspect modified files to formulate a descriptive name: `feat/{feature-name}` or `test/{component-name}`
     - Create and switch to the new branch:
       ```bash
       git checkout -b <new-branch-name>
       ```
   - **If already on a feature/working branch (not master/main)**:
     - Proceed on the current branch.

### Step 2: Inspect Working Tree & Change Verification
1. Inspect modified, created, or untracked files:
   ```bash
   git status
   ```
2. Verify that:
   - No untracked secret files (e.g., `.env`, `.pem`, credentials) are being accidentally included.
   - All expected automation assets (specs in `tests/`, page objects in `pages/`, test data in `test-data/`, fixtures in `fixtures/`, test plans in `test-plans/`) are accounted for.
3. Check diff summary:
   ```bash
   git diff --stat
   ```

### Step 3: Stage and Commit Changes with Proper Comment
1. Stage modified and newly created files:
   ```bash
   git add .
   ```
2. Construct a **Conventional Commit** message:
   - **Format**:
     ```text
     <type>(<scope>): <short imperative description>

     <Detailed bullet points explaining what was changed and why>

     Jira: <JiraTicket> (if applicable)
     ```
   - **Types**:
     - `feat`: New automation capabilities, new Page Object methods, or new test scenarios.
     - `test`: Adding or updating Playwright test specs.
     - `fix`: Fixing broken locators, failing assertions, or incorrect test fixtures.
     - `refactor`: Restructuring Page Objects, utilities, or test architecture without behavior change.
     - `chore`: Configuration updates, dependencies, or documentation.
   - **Example**:
     ```bash
     git commit -m "feat(AUTH-102): implement login error handling and boundary tests" \
       -m "- Add LoginPage object with user-facing locators
     - Register loginPage fixture in fixtures/customFixtures.ts
     - Implement TC01-TC03 positive and negative tests in tests/login.spec.ts
     - Add mock credentials and error strings in test-data/loginData.ts
     - Sync test plan at test-plans/AUTH-102.md"
     ```

### Step 4: Push to Remote Repository
1. Push the current branch to origin with upstream tracking:
   ```bash
   git push -u origin <branch-name>
   ```

### Step 5: Raise Pull Request with Comprehensive Description
1. Determine base branch (usually `main` or `master`).
2. Generate a structured Pull Request:
   - **Title**: `<type>(<scope>): <clear, descriptive summary>`
   - **Description Template**:
     ```markdown
     ## Description
     {Concise summary of the feature, bug fix, or automation suite introduced.}

     ## Related Jira Ticket
     - Ticket: [{JiraTicket}](https://your-jira-instance/browse/{JiraTicket})
     - Sub-Task: **QA Testing Antigravity**

     ## Changes Introduced
     - **Page Objects**:
       - `pages/{Feature}Page.ts`: Added locators and helper methods for {feature}
     - **Fixtures**:
       - `fixtures/customFixtures.ts`: Injected `{feature}Page` fixture
     - **Test Specs**:
       - `tests/{feature}.spec.ts`: Added test cases ({TC IDs}) covering positive, negative, and edge scenarios
     - **Test Data**:
       - `test-data/{feature}Data.ts`: Added test constants and payload mocks
     - **Documentation / Test Plans**:
       - `test-plans/{JiraTicket}.md`: Synchronized automation status

     ## Quality & Safety Checklist
     - [x] Branch is not `master` or `main` (branch protection enforced)
     - [x] Follows layered architecture (`Spec -> Pages -> Utils -> Test Data`)
     - [x] All element locators are encapsulated in Page Objects
     - [x] Strict web-first assertions used (no weakened checks)
     - [x] No sensitive files or credentials committed

     ## Verification & Test Results
     - Command: `npx playwright test tests/{feature}.spec.ts`
     - Status: All tests passing locally
     ```
3. Create the PR using GitHub CLI (`gh`):
   ```bash
   /opt/homebrew/bin/gh pr create --base main --head <branch-name> --title "<PR Title>" --body "<PR Description>"
   ```
4. **Fallback Mechanism**:
   - If `gh` CLI is not logged in or encounters network restrictions:
     - Provide the direct GitHub compare link so the user can open it in their browser:
       `https://github.com/<owner>/<repo>/compare/main...<branch-name>?expand=1`
     - Output the formatted PR title and description so the user can easily copy/paste or submit it.

### Step 6: Link to Jira Sub-task (Optional)
If a Jira ticket is linked and Atlassian MCP is active:
1. Post a comment on the `"QA Testing Antigravity"` sub-task with the PR link and commit SHA to maintain complete traceability.

---

## Failure Modes & Safeguards

| Scenario | Action |
| :--- | :--- |
| Active branch is `master` or `main` | **Abort commit**. Immediately branch off via `git checkout -b <new-branch>` |
| Nothing to commit (`working tree clean`) | Notify user that working tree is clean; skip commit step and proceed only if remote branch lacks PR |
| Merge conflict when pushing | Abort push; inform user to pull base branch and resolve conflicts |
| Unauthenticated GitHub CLI | Output direct web PR URL along with complete ready-to-paste PR description |
