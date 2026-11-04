# Test Plan: CTMQ-46 - Implement Specialties management under Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-59)
**Status:** Automated & Verified (14/14 Passed - 100%)

### Summary & Objectives
Validate the end-to-end functionality of Specialties management under Admin General Settings (`/admin/specialties`). Verify seamless navigation from the Admin landing page (`/admin`) General Settings card to `/admin/specialties`, while preserving active PrimaryNav and AdminSubNav state inside AppShell. Verify list page components including centered "+ Add Specialty" button, search filtering across specialty name and certification mapping, full-width data table structure with status pills (Active/Inactive), and responsive pagination controls. Validate the Add Specialty modal dialog: header, form fields (Specialty Name, dynamic multi-select Certification Mapping, Status selector), dismiss behavior via Cancel and close button, client-side required field validation for empty name, 409 Conflict duplicate name detection (case-insensitive), max character length boundary (100 chars), and successful creation workflow with notification banner feedback and table refresh. Ensure robust security with unauthenticated redirect protection and browser navigation stability (direct URL, refresh, back/forward).

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin/specialties` accessible)
- User is authenticated with role: Staffing Admin
- Database seeded with active certifications for mapping multi-select dropdown

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify navigation to Specialties page from Admin General Settings card | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Click the "Specialties" link under the General Settings card. | Browser navigates cleanly to `/admin/specialties`; page loads without errors. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Specialties page layout, AppShell navigation, and centered "+ Add Specialty" button | 1. Navigate to `/admin/specialties`.<br>2. Inspect PrimaryNav, AdminSubNav, and top page controls. | AppShell renders with "Admin" primary nav tab active; AdminSubNav is visible; centered "+ Add Specialty" button is prominently displayed at the top above the search box. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify Specialties table structure, columns, and status pills | 1. Navigate to `/admin/specialties`.<br>2. Inspect table headers and data rows. | Full-width table renders columns: "Specialty Name", "Certification Mapping", and "Status". Active records display green `Active` pill and inactive display gray `Inactive` pill. Unmapped certifications display "-" or empty. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify search filtering by specialty name and certification mapping | 1. Enter existing specialty name in the search input and click Search.<br>2. Enter mapped certification name and click Search.<br>3. Clear search and submit. | Table filters dynamically to matching records across both specialty name and certification mapping; resets pagination to page 1; clearing search restores full list. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify pagination controls and page boundary button states | 1. Observe pagination indicator ("Page X of Y (N total)").<br>2. Click Next page button.<br>3. Click Previous page button. | Pagination splits records accurately; Previous button is disabled on page 1; Next button is disabled on the last page; current page indicator updates. | Boundary Value Analysis | Automated (PASSED) |
| TC-06 | Positive | Verify Add Specialty modal display, default fields, and dismissal via Cancel & close (X) | 1. Click "+ Add Specialty" button.<br>2. Verify modal header ("Add Specialty") and fields.<br>3. Click close (X) button.<br>4. Reopen modal and click "Cancel" button. | Modal opens cleanly with header, required Specialty Name input, Certification Mapping multi-select, Status defaulted to "Active", Save and Cancel buttons. Both close (X) and Cancel dismiss modal without saving or altering table. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify Certification Mapping multi-select populated with active certifications | 1. Click "+ Add Specialty" button.<br>2. Open the Certification Mapping dropdown.<br>3. Select multiple certification options.<br>4. Deselect one option. | Dropdown dynamically lists active certifications; supports zero, single, or multiple selections; selected chips/labels display correctly; deselection updates selection accurately. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Verify successful creation of a new Specialty with mapped certifications and active status | 1. Open Add Specialty modal.<br>2. Enter a unique Specialty Name.<br>3. Select one or more certifications from mapping dropdown.<br>4. Ensure Status is "Active" and click "Save". | Modal closes; new specialty record persists; table refreshes showing new specialty with comma-separated certification mappings and green `Active` pill; success FeedbackBanner appears. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Verify creation of Specialty without certification mapping | 1. Open Add Specialty modal.<br>2. Enter a unique Specialty Name without selecting any certifications.<br>3. Click "Save". | Modal closes; new specialty is added; table displays "-" or empty under Certification Mapping column; success FeedbackBanner appears. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Negative | Verify client-side required field validation when submitting empty Specialty Name | 1. Open Add Specialty modal.<br>2. Leave Specialty Name blank.<br>3. Click "Save". | Submission is blocked; client-side validation error message is displayed indicating Specialty Name is required; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-11 | Negative | Verify 409 Conflict duplicate specialty name validation (case-insensitive) | 1. Open Add Specialty modal.<br>2. Enter an existing specialty name (matching case or different case).<br>3. Click "Save". | API returns 409 Conflict; inline error message is clearly displayed in the modal indicating duplicate name; modal remains open and inputs preserved. | Error Guessing / Negative | Automated (PASSED) |
| TC-12 | Edge | Verify Specialty Name maximum character length boundary (100 characters) | 1. Open Add Specialty modal.<br>2. Enter a 100-character valid string in Specialty Name.<br>3. Attempt to enter 101+ characters or verify `maxlength=100`.<br>4. Click "Save". | Input restricts or validates character length to 100; 100-character specialty persists successfully without truncation or database error. | Boundary Value Analysis | Automated (PASSED) |
| TC-13 | Negative | Verify unauthenticated access protection for `/admin/specialties` | 1. Clear session/auth tokens or log out.<br>2. Directly navigate to `/admin/specialties`. | Access is denied; user is redirected to `/login`; administrative specialties data and controls are not rendered. | Security / Negative Testing | Automated (PASSED) |
| TC-14 | Edge | Verify direct URL navigation, browser refresh, and back/forward navigation stability | 1. Directly navigate to `/admin/specialties` via address bar.<br>2. Trigger browser refresh.<br>3. Navigate to another page and click browser Back button. | Page reloads cleanly without loss of layout or console errors; AppShell, table data, and controls remain fully intact. | State Transition Testing | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Route: `/admin/specialties`
- New Specialty Names: Unique test strings (e.g., `Cardiology-QA`, `Pediatrics-QA`, `Specialty-100char-...`)
- Existing Specialty Name for duplicate check (e.g., `General Practice`)
- Available Certifications for mapping (e.g., `BLS`, `ACLS`, `PALS`, `RN`)

### Implementation & Layered Architecture
- **Spec:** [tests/specialties.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/specialties.spec.ts)
- **Page Object:** [pages/SpecialtiesPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/SpecialtiesPage.ts)
- **Fixtures:** `specialtiesPage`, `authenticatedSpecialtiesPage` in [fixtures/customFixtures.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [test-data/specialtiesData.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/specialtiesData.ts)

### Verification
- **Command:** `npx playwright test tests/specialties.spec.ts`
- **Result:** 14 passed (9.1s) - 100% Pass Rate
