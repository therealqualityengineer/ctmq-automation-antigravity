# Test Plan: CTMQ-49 - Implement Shifts management under Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-63)
**Status:** Automated & Verified (12/12 Passed - 100%)

### Summary & Objectives

Validate the end-to-end functionality of Shifts management under Admin General Settings (`/admin/shifts`). Verify seamless navigation from the Admin landing page (`/admin`) General Settings card to `/admin/shifts`, while preserving active PrimaryNav (Admin highlighted) and AdminSubNav state inside AppShell. Verify list page components including centered "+ Add Shift Option" button, search filtering by Shift Name, full-width data table structure with columns (#, Shift Name, Start Time, End Time, Default Shift), and responsive pagination controls. Validate the "Creating Shift Option" modal dialog: header, form fields (Shift Name, Start Time, End Time, Default Shift selector defaulting to "No"), dismiss behavior via close (X) and Cancel button, client-side required field validations for empty fields, 409 Conflict duplicate shift name detection (case-insensitive), max character length boundary (100 chars), and successful creation workflow with notification banner feedback and table refresh. Ensure robust security with unauthenticated redirect protection and browser navigation stability (direct URL, refresh, back/forward).

### Preconditions & Setup

- System running locally (`http://localhost:5173/admin/shifts` accessible)
- User is authenticated with role: Staffing Admin

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify navigation to Shifts page from Admin General Settings card | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Click the "Shifts" link under the General Settings card. | Browser navigates cleanly to `/admin/shifts`; page loads without errors. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Shifts page layout, AppShell navigation, and centered "+ Add Shift Option" button | 1. Navigate to `/admin/shifts`.<br>2. Inspect PrimaryNav, AdminSubNav, and top page controls. | AppShell renders with "Admin" primary nav tab active; AdminSubNav is visible; centered "+ Add Shift Option" button is prominently displayed at the top above the search box. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify Shifts table structure, columns, and Default Shift indicator | 1. Navigate to `/admin/shifts`.<br>2. Inspect table headers and data rows. | Full-width table renders columns: "#", "Shift Name", "Start Time", "End Time", and "Default Shift". Start/End times are formatted in 12-hour AM/PM format. Default Shift displays "Yes" or "No". | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify search filtering by Shift Name and search reset | 1. Enter existing shift name in search input and click Search.<br>2. Verify filtered results.<br>3. Clear search and submit. | Table filters dynamically to matching records by Shift Name; resets pagination to page 1; clearing search restores full list. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify pagination controls and page boundary button states | 1. Observe pagination indicator ("Page X of Y (N total)").<br>2. Click Next page button.<br>3. Click Previous page button. | Pagination splits records accurately; Previous button is disabled on page 1; Next button is disabled on the last page; current page indicator updates. | Boundary Value Analysis | Automated (PASSED) |
| TC-06 | Positive | Verify Add Shift Option modal display, default fields, and dismissal via close (X) / Cancel | 1. Click "+ Add Shift Option" button.<br>2. Verify modal header ("Creating Shift Option") and form fields.<br>3. Verify Default Shift defaults to "No" (value="false").<br>4. Dismiss modal via close (X) and Cancel. | Modal opens cleanly with header "Creating Shift Option", Shift Name, Start Time, End Time, Default Shift defaulted to "No", Save Shift button. Both close (X) and Cancel dismiss modal without saving or altering table. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify successful creation of a new non-default Shift Option | 1. Open Add Shift Option modal.<br>2. Enter a unique Shift Name, Start Time (e.g. 08:00 AM), End Time (e.g. 04:00 PM).<br>3. Leave Default Shift as "No".<br>4. Click "Save Shift". | Modal closes; new shift option persists; table refreshes showing new shift with "No" in Default Shift column; success FeedbackBanner appears. | State Transition Testing | Automated (PASSED) |
| TC-08 | Positive | Verify successful creation of a new default Shift Option | 1. Open Add Shift Option modal.<br>2. Enter a unique Shift Name, Start Time (e.g. 07:00 PM), End Time (e.g. 07:00 AM).<br>3. Select Default Shift as "Yes".<br>4. Click "Save Shift". | Modal closes; new shift option is added; table displays "Yes" under Default Shift column; success FeedbackBanner appears. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Negative | Verify client-side required field validation when submitting empty Shift Name, Start Time, or End Time | 1. Open Add Shift Option modal.<br>2. Leave required fields empty and click "Save Shift". | Submission is blocked; client-side validation error messages are displayed indicating required fields; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-10 | Negative | Verify 409 Conflict duplicate shift name validation (case-insensitive) | 1. Open Add Shift Option modal.<br>2. Enter an existing shift name (matching case or different case, e.g. "8d").<br>3. Provide valid Start and End times.<br>4. Click "Save Shift". | API returns 409 Conflict; inline error message "A shift option with this name already exists." is clearly displayed in the modal; modal remains open and inputs preserved. | Error Guessing / Negative | Automated (PASSED) |
| TC-11 | Negative | Verify unauthenticated access protection for `/admin/shifts` | 1. Clear session/auth tokens or log out.<br>2. Directly navigate to `/admin/shifts`. | Access is denied; user is redirected to `/login`; administrative shifts data and controls are not rendered. | Security / Negative Testing | Automated (PASSED) |
| TC-12 | Edge | Verify Shift Name maximum character length boundary (100 characters) and direct URL stability | 1. Open Add Shift Option modal.<br>2. Enter a 100-character valid string in Shift Name, valid times, and save.<br>3. Directly navigate to `/admin/shifts` and refresh. | 100-character name persists successfully; direct URL navigation and page refresh maintain AppShell and table state without errors. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data

- Valid Staffing Admin credentials
- Target Route: `/admin/shifts`
- New Shift Names: Unique test strings (e.g., `Day Shift QA`, `Night Shift QA`, `Shift-100char-...`)
- Existing Shift Name for duplicate check (e.g., `8D`)
- Times: Start Time (e.g. `08:00 AM`), End Time (e.g. `04:00 PM`)

### Implementation & Layered Architecture

- **Spec:** `tests/shifts.spec.ts`
- **Page Object:** `pages/ShiftsPage.ts`
- **Fixtures:** `shiftsPage`, `authenticatedShiftsPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/shiftsData.ts`

### Verification

- **Command:** `npx playwright test tests/shifts.spec.ts`
- **Result:** 12 passed (8.9s) - 100% Pass Rate
