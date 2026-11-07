# Test Plan: CTMQ-48 - Implement Status Options management under Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-61)
**Status:** Automated & Verified (15/15 Passed - 100%)

### Summary & Objectives
Validate the end-to-end functionality of Status Options management under Admin General Settings (`/admin/status-options`). Verify seamless navigation from the Admin landing page (`/admin`) General Settings card to `/admin/status-options`, preserving active PrimaryNav ("Admin") and AdminSubNav state within AppShell. Verify list page controls including centered "+ Add Status Option" button, entity type sub-tabs ("Client" and "Temp", defaulting to "Client"), search filtering by name and description, full-width data table (# row index, Status Name, Status Description, Currently Active indicator: Yes in green / No in gray), and responsive pagination controls. Validate the Add Status Option modal dialog: header with required indicator, form fields (Status Option * max 100, Status Description max 255, Is Active? dropdown defaulting to Yes), dismissal behavior via Cancel and close (X) button, client-side required field validation, 409 Conflict duplicate detection (case-insensitive within same entity type), cross-entity type independence, and successful creation workflow with notification banner feedback and table refresh. Ensure robust security with unauthenticated redirect protection and browser navigation stability (direct URL, refresh, back/forward).

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin/status-options` accessible)
- User is authenticated with role: Staffing Admin
- PostgreSQL database initialized with additive `status_options` table

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify navigation to Status Options page from Admin General Settings card | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Click the "Status Options" link under the General Settings card. | Browser navigates cleanly to `/admin/status-options`; page loads without errors. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Status Options page layout, AppShell navigation, and centered "+ Add Status Option" button | 1. Navigate to `/admin/status-options`.<br>2. Inspect PrimaryNav, AdminSubNav, and top page controls. | AppShell renders with "Admin" primary nav tab active; AdminSubNav is visible; centered "+ Add Status Option" button is prominently displayed at top above sub-tabs. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify default Client sub-tab selection and sub-tab switching between Client and Temp | 1. Navigate to `/admin/status-options`.<br>2. Verify "Client" sub-tab is selected by default.<br>3. Click "Temp" sub-tab.<br>4. Click back to "Client" sub-tab. | Initial load defaults to "Client" tab; clicking "Temp" switches active tab and displays Temp status options; switching tabs resets pagination to page 1. | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Verify Status Options table structure, column headers, and active status indicators | 1. Navigate to `/admin/status-options`.<br>2. Inspect table headers and data rows. | Full-width table renders columns: "#", "Status Name", "Status Description", and "Currently Active". Active records display green `Yes` and inactive display gray `No`. Empty descriptions show "-". | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify search filtering by status name and description within active sub-tab | 1. Enter an existing status option name in search input and click Search.<br>2. Enter matching description text and click Search.<br>3. Clear search and submit. | Table filters dynamically to matching records across both name and description within active tab; resets pagination to page 1; clearing search restores full list. | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Verify pagination controls and page boundary button states | 1. Observe pagination indicator ("Page X of Y (N total)").<br>2. Click Next page button.<br>3. Click Previous page button. | Pagination splits records accurately; Previous button is disabled on page 1; Next button is disabled on the last page; current page indicator updates. | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Positive | Verify Add Status Option modal display, default fields, and dismissal via Cancel & close (X) | 1. Click "+ Add Status Option" button.<br>2. Verify modal header ("Status Option", "* indicates required field") and fields.<br>3. Click close (X) button.<br>4. Reopen modal and click "Cancel" button. | Modal opens cleanly with header, required Status Option input, optional Status Description, Is Active? dropdown defaulting to "Yes", Save and Cancel buttons. Both close (X) and Cancel dismiss modal without saving or altering table. | State Transition Testing | Automated (PASSED) |
| TC-08 | Positive | Verify successful creation of a new Status Option under Client tab | 1. Ensure "Client" tab is active and click "+ Add Status Option".<br>2. Enter unique Status Option name and description.<br>3. Set Is Active? to "Yes" and click "Save". | Modal closes; new status option persists under Client entity type; table refreshes showing new option with green `Yes` indicator; success banner appears. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Verify successful creation of a new Status Option under Temp tab | 1. Switch to "Temp" tab and click "+ Add Status Option".<br>2. Enter unique Status Option name and description.<br>3. Set Is Active? to "Yes" and click "Save". | Modal closes; new status option persists under Temp entity type; table refreshes showing new option under Temp tab; success banner appears. | State Transition Testing | Automated (PASSED) |
| TC-10 | Positive | Verify creation of Status Option with Inactive status ("No") and empty description | 1. Open Add Status Option modal.<br>2. Enter a unique Status Option name without description.<br>3. Select Is Active? as "No" and click "Save". | Modal closes; new status option is added; table displays "-" under Status Description and gray `No` indicator; success banner appears. | Equivalence Partitioning | Automated (PASSED) |
| TC-11 | Negative | Verify client-side required field validation when submitting empty Status Option name | 1. Open Add Status Option modal.<br>2. Leave Status Option name blank.<br>3. Click "Save". | Submission is blocked; client-side validation error message is displayed indicating Status Option name is required; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-12 | Negative | Verify 409 Conflict duplicate status option name validation within same entity type (case-insensitive) | 1. Open Add Status Option modal.<br>2. Enter an existing status option name for the current entity type (matching or different case).<br>3. Click "Save". | API returns 409 Conflict; inline error message is clearly displayed in modal indicating duplicate name; modal remains open and inputs preserved. | Error Guessing / Negative | Automated (PASSED) |
| TC-13 | Positive | Verify status option with same name can exist across different entity types (Client vs Temp) | 1. Create a status option under "Client" tab.<br>2. Switch to "Temp" tab.<br>3. Create a status option with the exact same name under "Temp". | Both creations succeed because unique constraint is scoped to `(entity_type, name)`. | Decision Table Testing | Automated (PASSED) |
| TC-14 | Negative | Verify unauthenticated access protection for `/admin/status-options` | 1. Clear session/auth tokens or log out.<br>2. Directly navigate to `/admin/status-options`. | Access is denied; user is redirected to `/login`; administrative status options data and controls are not rendered. | Security / Negative Testing | Automated (PASSED) |
| TC-15 | Edge | Verify maximum character length boundaries (100 chars name, 255 chars desc) and direct URL stability | 1. Open Add Status Option modal.<br>2. Enter a 100-character name and 255-character description, then save.<br>3. Directly navigate to `/admin/status-options` and refresh. | 100-char name and 255-char description persist successfully; direct URL navigation and page refresh maintain AppShell and table state without errors. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Route: `/admin/status-options`
- Client Status Options: Unique test names (e.g., `Client-Pending-QA`, `Client-Active-QA`)
- Temp Status Options: Unique test names (e.g., `Temp-Onboarding-QA`, `Temp-Available-QA`)
- Duplicate check string: Existing status name within same entity type
- Cross-tab string: Same status name created under both Client and Temp
- Boundary lengths: 100 characters for name, 255 characters for description

### Implementation & Layered Architecture
- **Spec:** [tests/statusOptions.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/statusOptions.spec.ts)
- **Page Object:** [pages/StatusOptionsPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/StatusOptionsPage.ts)
- **Fixtures:** `statusOptionsPage`, `authenticatedStatusOptionsPage` in [fixtures/customFixtures.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [test-data/statusOptionsData.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/statusOptionsData.ts)

### Verification
- **Command:** `npx playwright test tests/statusOptions.spec.ts`
- **Result:** 15 passed (9.4s) - 100% Pass Rate
