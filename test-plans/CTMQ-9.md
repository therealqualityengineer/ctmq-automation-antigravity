# Test Plan: CTMQ-9 - Create Temp details form and persist Temp records
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-36)
**Status:** Automated & Verified (21 / 21 Passed - 100%)

### Summary & Objectives
Verify the end-to-end Temp creation workflow initiated from the `+ Add Temp` action. The scope encompasses the responsive two-box form layout (Left box: Contact & Address details; Right box: Status & Personal details), dynamic 50-state dropdown, ZIP-to-county lookup (single auto-select, multi-county choice, and invalid ZIP handling), form validations, Save/Cancel actions, double-submission safeguards, route/API authorization (`POST /api/temps`), PostgreSQL persistence in the `temps` table with leading zero preservation for ZIP codes, and prevention of county state retention when ZIP changes (CTMQ-25).

### Preconditions & Setup
- Deployed or local CTMQ application running frontend and backend services with applied EF Core `temps` table migration.
- Authenticated session with an active Staffing Admin user.
- Unauthenticated session state for route and API security tests.
- Reference dataset for ZIP-to-county mappings (single match, multi match, and unknown).

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Navigation to Add Temp form via `+ Add Temp` button | 1. Log in as Staffing Admin.<br>2. Navigate to Temp section (`/temp`).<br>3. Click `+ Add Temp` button. | Dedicated Temp creation page opens under authenticated AppShell with clean form state. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Two-column form layout and section styling | 1. Inspect the Add Temp page layout. | Page renders two side-by-side boxes with subtle borders: Left (Contact & Address) and Right (Status & Personal). | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | State dropdown population contains all 50 US states | 1. Click State dropdown in the Left box. | Dropdown displays all 50 US states with full state names and standard 2-letter abbreviations. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Single-match ZIP to County auto-population | 1. Enter a valid US ZIP code mapping to exactly one county (e.g., `90210`, `01001`). | County field automatically populates and selects the matching county without requiring manual intervention. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Multi-match ZIP to County selection dropdown | 1. Enter a valid US ZIP code mapping to multiple counties.<br>2. Inspect County field. | County field presents a selection dropdown listing all matching counties for user selection. | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Standard 5-digit ZIP format acceptance and length constraint | 1. Test entering standard 5-digit ZIP (`01001`).<br>2. Inspect HTML constraints (`maxlength="5"`, `inputmode="numeric"`). | Standard 5-digit ZIP is accepted as valid without validation errors. | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Positive | Status, Gender, and Marital Status field selection | 1. Inspect Right box controls.<br>2. Select Status from dropdown, choose Gender from radio button group, select Marital Status from dropdown. | Choices reflect user selection accurately with proper active/checked state. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Successful Temp record creation and persistence | 1. Fill all valid Left box (Personal/Address) and Right box (Status/Personal) fields.<br>2. Click Save button. | Request `POST /api/temps` succeeds with HTTP 201; Temp record persists to PostgreSQL; success feedback toast is displayed. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Positive | Cancel button discards input and redirects | 1. Fill partial or complete form fields.<br>2. Click Cancel. | Inputs are discarded; user is navigated back to previous view; form URL is exited without persisting data. | State Transition Testing | Automated (PASSED) |
| TC-10 | Negative | Mandatory field validation on empty submission | 1. Click Save on an empty form. | Submission is blocked; HTML5 required field validations trigger on mandatory fields (First Name, Last Name, Email, ZIP, etc.). | Error Guessing | Automated (PASSED) |
| TC-11 | Negative | Invalid email format validation | 1. Enter invalid email formats (`invalid-email-format`) in Email field.<br>2. Inspect field validity. | Field is marked invalid; submission is prevented until valid email syntax is entered. | Equivalence Partitioning | Automated (PASSED) |
| TC-12 | Negative | Unknown or invalid ZIP code handling | 1. Enter an invalid or non-existent ZIP code (`00000`). | Field displays clear error feedback ("No county found for this ZIP — please check the ZIP."); County field resets to empty. | Error Guessing | Automated (PASSED) |
| TC-13 | Negative | County reset on ZIP change or clearance (CTMQ-25 regression prevention) | 1. Enter valid ZIP that populates County.<br>2. Clear ZIP or change to an unknown/different ZIP. | County selection does NOT retain the previous ZIP's county; it resets/clears immediately. | State Transition Testing | Automated (PASSED) |
| TC-14 | Negative | Route protection for unauthenticated access | 1. In an unauthenticated session, navigate directly to Add Temp URL (`/temp/new`). | Access denied; user redirected to `/login` with return URL parameter; form is not exposed. | Boundary Value Analysis | Automated (PASSED) |
| TC-15 | Negative | API endpoint authorization enforcement | 1. Send `POST /api/temps` without valid authorization header/session cookie. | Server returns HTTP 401 Unauthorized; creation is rejected. | Boundary Value Analysis | Automated (PASSED) |
| TC-16 | Negative | Backend server validation and error shielding | 1. Send invalid payload directly to `POST /api/temps`. | Backend rejects request with HTTP 400 Bad Request; no raw database/SQL exceptions or stack traces are exposed. | Error Guessing | Automated (PASSED) |
| TC-17 | Edge | Leading zeros preservation in ZIP code | 1. Create a Temp record with ZIP code starting with zero (`01001`).<br>2. Inspect database record / API response. | ZIP is stored and retrieved as string `"01001"`, preserving leading zeros without numeric truncation. | Boundary Value Analysis | Automated (PASSED) |
| TC-18 | Edge | Date of Birth boundary and format validation | 1. Test Date of Birth field input with valid ISO date format (`1995-12-31`). | Date field accepts and retains valid date representation. | Boundary Value Analysis | Automated (PASSED) |
| TC-19 | Edge | Responsive two-box vertical stacking on narrow screens | 1. View Add Temp page on mobile viewports (375px). | Left and Right boxes stack vertically in readable order; no horizontal scrolling or overflow. | Boundary Value Analysis | Automated (PASSED) |
| TC-20 | Edge | In-progress save and double-submission protection | 1. Fill valid form.<br>2. Trigger save action. | Save button enforces submission handling, successfully creating the record without duplicate creation. | State Transition Testing | Automated (PASSED) |
| TC-21 | Edge | Input whitespace trimming and normalization | 1. Enter names with leading/trailing whitespaces.<br>2. Submit and inspect saved record. | Whitespace is automatically trimmed before persistence. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- **Staffing Admin Auth**: Active credentials (`qaengineer`).
- **Valid Temp Data**:
  - First Name: `Jane`
  - Last Name: `Doe`
  - Cell Phone: `555-123-4567`
  - Email: `jane.doe.<unique>@example.com`
  - Address: `123 Main St`
  - City: `Agawam`
  - State: `MA` (`Massachusetts`)
  - ZIP: `01001` (tests leading zero preservation)
  - County: `Hampden County`
  - Status: `Active`
  - Date of Birth: `1990-05-15`
  - Gender: `Female`
  - Marital Status: `Single`
- **ZIP Lookup Test Cases**:
  - Single Match: `01001` -> `Hampden County`, MA; `90210` -> `Los Angeles County`, CA
  - Unknown ZIP: `00000` -> Error feedback & county reset

### Automation Implementation & Verification Summary
- **Spec File**: `tests/addTemp.spec.ts`
- **Page Objects**: `pages/AddTempPage.ts`, `pages/TempPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/addTempData.ts`
- **Branch**: `CTMQ7-&-9`
- **Test Results**: 21 passed / 0 failed (5.5s) - 100% Pass Rate
