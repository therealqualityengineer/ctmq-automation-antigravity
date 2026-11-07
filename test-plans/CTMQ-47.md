# Test Plan: CTMQ-47 - Implement Certifications management under Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-60)
**Status:** Automated & Verified (14/14 Passed - 100%)

### Summary & Objectives
Validate the end-to-end functionality of Certifications management under Admin General Settings (`/admin/certifications`). Verify seamless navigation from the Admin landing page (`/admin`) General Settings card to `/admin/certifications`, while preserving active PrimaryNav and AdminSubNav state inside AppShell. Verify list page components including centered "+ Add Certification" button, search filtering across certification name and mapped specialties, full-width data table structure with status pills (Active/Inactive), and responsive pagination controls. Validate the Add Certification modal dialog: header, form fields (Certification Name, dynamic multi-select Mapped Specialties, Status selector), dismiss behavior via Cancel and close button, client-side required field validation for empty name, 409 Conflict duplicate name detection (case-insensitive), max character length boundary (100 chars), and successful creation workflow with notification banner feedback and table refresh. Ensure robust security with unauthenticated redirect protection and browser navigation stability (direct URL, refresh, back/forward).

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin/certifications` accessible)
- User is authenticated with role: Staffing Admin
- Database seeded with active specialties for mapping multi-select dropdown

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify navigation to Certifications page from Admin General Settings card | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Click the "Certifications" link under the General Settings card. | Browser navigates cleanly to `/admin/certifications`; page loads without errors. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Certifications page layout, AppShell navigation, and centered "+ Add Certification" button | 1. Navigate to `/admin/certifications`.<br>2. Inspect PrimaryNav, AdminSubNav, and top page controls. | AppShell renders with "Admin" primary nav tab active; AdminSubNav is visible; centered "+ Add Certification" button is prominently displayed at the top above the search box. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify Certifications table structure, columns, and status pills | 1. Navigate to `/admin/certifications`.<br>2. Inspect table headers and data rows. | Full-width table renders columns: "Certification Name", "Mapped Specialties", and "Status". Active records display green `Active` pill and inactive display gray `Inactive` pill. Unmapped specialties display "-" or empty. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify search filtering by certification name and mapped specialties | 1. Enter existing certification name in search input and click Search.<br>2. Enter mapped specialty name and click Search.<br>3. Clear search and submit. | Table filters dynamically to matching records across both certification name and mapped specialties; resets pagination to page 1; clearing search restores full list. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify pagination controls and page boundary button states | 1. Observe pagination indicator ("Page X of Y (N total)").<br>2. Click Next page button.<br>3. Click Previous page button. | Pagination splits records accurately; Previous button is disabled on page 1; Next button is disabled on the last page; current page indicator updates. | Boundary Value Analysis | Automated (PASSED) |
| TC-06 | Positive | Verify Add Certification modal display, default fields, and dismissal via Cancel & close (X) | 1. Click "+ Add Certification" button.<br>2. Verify modal header ("Add Certification") and fields.<br>3. Click close (X) button.<br>4. Reopen modal and click "Cancel" button. | Modal opens cleanly with header, required Certification Name input, Mapped Specialties multi-select, Status defaulted to "Active", Save and Cancel buttons. Both close (X) and Cancel dismiss modal without saving or altering table. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify Mapped Specialties multi-select populated with active specialties | 1. Click "+ Add Certification" button.<br>2. Open the Mapped Specialties dropdown.<br>3. Select multiple specialty options.<br>4. Deselect one option. | Dropdown dynamically lists active specialties; supports zero, single, or multiple selections; selected tags/items display correctly; deselection updates selection accurately. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Verify successful creation of a new Certification with mapped specialties and active status | 1. Open Add Certification modal.<br>2. Enter a unique Certification Name.<br>3. Select one or more specialties from dropdown.<br>4. Ensure Status is "Active" and click "Save". | Modal closes; new certification record persists; table refreshes showing new certification with comma-separated specialties and green `Active` pill; success FeedbackBanner appears. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Verify creation of Certification without mapped specialties and inactive status | 1. Open Add Certification modal.<br>2. Enter a unique Certification Name without selecting any specialties.<br>3. Select Status as "Inactive" and click "Save". | Modal closes; new certification is added; table displays "-" or empty under Mapped Specialties column and gray `Inactive` pill; success FeedbackBanner appears. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Positive | Verify creation of Certification with single mapped specialty | 1. Open Add Certification modal.<br>2. Enter a unique Certification Name.<br>3. Select exactly one specialty.<br>4. Click "Save". | Modal closes; certification is saved with single specialty name displayed in table column; success banner appears. | Equivalence Partitioning | Automated (PASSED) |
| TC-11 | Negative | Verify client-side required field validation when submitting empty Certification Name | 1. Open Add Certification modal.<br>2. Leave Certification Name blank.<br>3. Click "Save". | Submission is blocked; client-side validation error message is displayed indicating Certification Name is required; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-12 | Negative | Verify 409 Conflict duplicate certification name validation (case-insensitive) | 1. Open Add Certification modal.<br>2. Enter an existing certification name (matching case or different case).<br>3. Click "Save". | API returns 409 Conflict; inline error message is clearly displayed in the modal indicating duplicate name; modal remains open and inputs preserved. | Error Guessing / Negative | Automated (PASSED) |
| TC-13 | Negative | Verify unauthenticated access protection for `/admin/certifications` | 1. Clear session/auth tokens or log out.<br>2. Directly navigate to `/admin/certifications`. | Access is denied; user is redirected to `/login`; administrative certifications data and controls are not rendered. | Security / Negative Testing | Automated (PASSED) |
| TC-14 | Edge | Verify Certification Name maximum character length boundary (100 characters) and direct URL stability | 1. Open Add Certification modal.<br>2. Enter a 100-character valid string in Certification Name and save.<br>3. Directly navigate to `/admin/certifications` and refresh. | 100-character name persists successfully; direct URL navigation and page refresh maintain AppShell and table state without errors. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Route: `/admin/certifications`
- New Certification Names: Unique test strings (e.g., `ACLS-QA`, `BLS-QA`, `Cert-100char-...`)
- Existing Certification Name for duplicate check (e.g., `BLS`)
- Available Specialties for mapping (e.g., `Cardiology`, `Emergency Medicine`, `Pediatrics`)

### Implementation & Layered Architecture
- **Spec:** [tests/certifications.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/certifications.spec.ts)
- **Page Object:** [pages/CertificationsPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/CertificationsPage.ts)
- **Fixtures:** `certificationsPage`, `authenticatedCertificationsPage` in [fixtures/customFixtures.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [test-data/certificationsData.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/certificationsData.ts)

### Verification
- **Command:** `npx playwright test tests/certifications.spec.ts`
- **Result:** 14 passed (11.2s) - 100% Pass Rate
