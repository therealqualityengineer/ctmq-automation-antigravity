# Test Plan: CTMQ-14 - Add read-only Temp details and Edit mode
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-39)
**Status:** Automated & Verified (20 / 20 Passed - 100%)

### Summary & Objectives
Verify the read-only Temp details View mode and explicit Edit mode workflows for existing Temp records, while preserving standard Create mode behavior from the `+ Add Temp` action. Ensure that selecting an existing Temp record opens in read-only View mode where all fields are non-editable, Save/Cancel actions are hidden, and an explicit Edit button is provided. Verify that clicking Edit switches the form into Edit mode, enabling all fields and toggling action controls (displaying Save and Cancel while hiding Edit). Validate that Save updates only the selected record and displays appropriate feedback, while Cancel reverts unsaved changes and returns to View mode. Confirm that form submission cannot occur accidentally in View mode, validations (including normalized unique email) are strictly enforced in Edit mode, and the two-column full-width responsive layout is preserved across all modes.

### Preconditions & Setup
- Deployed or local CTMQ application running frontend and backend services.
- Authenticated Staffing Admin user credentials.
- Pre-seeded Temp records in the database for view and edit operations.
- Unauthenticated session state for route security testing.

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Create mode initial state via `+ Add Temp` button | 1. Log in as Staffing Admin.<br>2. Navigate to Temp module (`/temp`).<br>3. Click `+ Add Temp` button. | Temp form opens in Create mode (`/temp/new`); all fields are editable; Save and Cancel buttons are visible; Edit button is not present. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Existing Temp record opens in read-only View mode | 1. Log in as Staffing Admin.<br>2. Navigate to Temp list (`/temp`).<br>3. Click on an existing Temp record row. | Record details page opens in View mode (`/temp/:id`); all fields display persisted values in read-only/disabled state; Edit button is visible; Save and Cancel buttons are hidden. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Transition from View mode to Edit mode via Edit button | 1. Open an existing Temp in View mode.<br>2. Click the `Edit` button. | Form switches to Edit mode; all Temp fields become editable; Save and Cancel buttons become visible; Edit button is hidden. | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Successful update and persistence in Edit mode | 1. In Edit mode of an existing Temp, modify editable fields (e.g. Phone, Address, Status).<br>2. Click Save. | Changes persist to the database; save success feedback/toast appears; page transitions back to read-only View mode displaying updated values; other Temp records remain unchanged. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Cancel in Edit mode discards unsaved changes | 1. In Edit mode of an existing Temp, modify one or more fields.<br>2. Click Cancel. | Unsaved edits are discarded; page returns to read-only View mode; original persisted field values are restored; backend record is unchanged. | State Transition Testing | Automated (PASSED) |
| TC-06 | Positive | Cancel in Create mode abandons form and navigates back | 1. Navigate to `+ Add Temp`.<br>2. Enter partial data into form fields.<br>3. Click Cancel. | Unsaved input is abandoned; user is navigated back to Temp list (`/temp`); no new Temp record is created. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Create mode persistence creates new Temp record | 1. Navigate to `+ Add Temp`.<br>2. Fill all mandatory and optional fields with valid unique data.<br>3. Click Save. | New Temp record is created via `POST /api/temps`; success feedback is shown; record appears in Temp list. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Two-column presentation and full-width layout retention | 1. Open Temp record in View mode and switch to Edit mode.<br>2. Inspect container widths and two-box structure. | Two-box layout is preserved (Left: Contact & Address, Right: Status & Personal); layout spans full available viewport width without arbitrary max-width constraints. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Negative | View mode form submission prevention via Enter key | 1. Open an existing Temp in View mode.<br>2. Focus on form elements and press Enter key. | Form does not submit; no HTTP PUT/POST update request is issued; page remains in View mode. | Error Guessing | Automated (PASSED) |
| TC-10 | Negative | Form controls tamper resistance and immutability in View mode | 1. Open an existing Temp in View mode.<br>2. Attempt to type into text inputs, toggle radio buttons (Gender), or select options from dropdowns (State, Status, Marital Status). | All form inputs and controls are disabled/readonly and reject user modifications via keyboard and mouse. | Boundary Value Analysis | Automated (PASSED) |
| TC-11 | Negative | Mandatory field validation enforcement in Edit mode | 1. Open an existing Temp in Edit mode.<br>2. Clear mandatory fields (e.g. First Name, Last Name, Email).<br>3. Click Save. | Form submission is blocked; validation error messages appear for required fields; data is not saved. | Boundary Value Analysis | Automated (PASSED) |
| TC-12 | Negative | Invalid email format validation enforcement in Edit mode | 1. Open an existing Temp in Edit mode.<br>2. Set Email field to invalid format (`invalid-email-format`).<br>3. Click Save. | Form submission is blocked; invalid email validation error is displayed; record is not updated. | Equivalence Partitioning | Automated (PASSED) |
| TC-13 | Negative | Unique email enforcement against other records in Edit mode | 1. Open Temp A in Edit mode.<br>2. Change Email to match the email of existing Temp B.<br>3. Click Save. | Update is rejected with duplicate email validation error; Temp A retains original email or remains in Edit mode with error. | Equivalence Partitioning | Automated (PASSED) |
| TC-14 | Positive | Self-email retention on update in Edit mode | 1. Open an existing Temp in Edit mode.<br>2. Modify a non-email field (e.g. Phone or Address) while keeping original email unchanged.<br>3. Click Save. | Save succeeds without self-collision duplicate email error; changes persist successfully. | Equivalence Partitioning | Automated (PASSED) |
| TC-15 | Negative | Unauthenticated route protection for Temp detail route | 1. In an unauthenticated session, navigate directly to `/temp/:id`. | Access denied; user redirected to `/login` with return URL; sensitive Temp details are not exposed. | Boundary Value Analysis | Automated (PASSED) |
| TC-16 | Negative | Non-existent Temp record handling | 1. Log in as Staffing Admin.<br>2. Navigate directly to `/temp/9999999` (non-existent record). | Application displays clear not-found error message or redirects gracefully to Temp list without runtime crash. | Error Guessing | Automated (PASSED) |
| TC-17 | Edge | Re-entering Edit mode after canceling edits | 1. Open an existing Temp in Edit mode and modify a field.<br>2. Click Cancel (reverts to View mode with persisted values).<br>3. Click Edit again. | Form controls become editable again displaying original persisted values; subsequent modifications and save operate normally. | State Transition Testing | Automated (PASSED) |
| TC-18 | Edge | Consecutive Edit-Save-Edit-Save cycles | 1. Edit record: update Phone -> click Save. Verify View mode shows updated Phone.<br>2. Click Edit again: update Address -> click Save. Verify View mode shows updated Address. | Each update cycle commits cleanly to the backend and reflects in subsequent View and Edit modes without stale cache or UI desynchronization. | State Transition Testing | Automated (PASSED) |
| TC-19 | Edge | Dynamic ZIP-to-County lookup updating in Edit mode | 1. Open an existing Temp in Edit mode.<br>2. Change ZIP code to another valid US ZIP mapping to a different county. | County field dynamically updates to match the new ZIP; previous county is not retained (CTMQ-25 regression prevention); Save persists new ZIP and County. | Decision Table Testing | Automated (PASSED) |
| TC-20 | Edge | Responsive two-box vertical stacking on narrow viewports | 1. Set viewport to mobile width (375x667).<br>2. View existing Temp in both View and Edit modes. | Two-box layout stacks vertically; all fields, Edit, Save, and Cancel buttons remain visible, readable, and functional without horizontal overflow. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- **Staffing Admin Auth**: Active credentials (`qaengineer` / admin role).
- **Existing Temp Records**:
  - Temp A (for standard View, Edit, Cancel, and persistence tests).
  - Temp B (for unique email collision tests).
- **Test Payloads**:
  - Modified Phone: `555-987-6543`
  - Modified Address: `456 Oak Avenue`
  - Valid New ZIP & County: `90210` (`Los Angeles County`)
  - Invalid Email: `invalid-email-format`
- **Viewports**:
  - Desktop Standard: 1920 x 1080, 1440 x 900
  - Mobile: 375 x 667

### Automation Implementation & Verification Summary
- **Spec File**: `tests/tempDetail.spec.ts`
- **Page Objects**: `pages/TempDetailPage.ts`, `pages/TempPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts` (`tempDetailPage`, `authenticatedTempDetailPage`)
- **Test Data**: `test-data/tempDetailData.ts`
- **Branch**: `CTMQ-14-Testing`
- **Test Results**: 20 passed / 0 failed (6.3s) - 100% Pass Rate
