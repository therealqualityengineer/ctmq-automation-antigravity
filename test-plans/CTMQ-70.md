# Test Plan: CTMQ-70 - Add Certification and Speciality fields in Temp page

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-71)
**Status:** Automated & Verified (15/15 Passed - 100%)

### Summary & Objectives
Validate the integration of Certification and Specialty fields into the Temp module details form (`/temp/new` and Temp profile/edit view). Ensure that both fields render seamlessly within the existing Temp page layout, dynamically populate active records from Admin General Settings (Certifications and Specialties), respect mapping and dependent dropdown behavior, persist correctly upon Temp creation and update, and adhere to validation, security, and responsive UI standards.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated with role: Staffing Admin
- Active Specialties and Certifications seeded in the database via Admin General Settings (`/admin/specialties`, `/admin/certifications`)
- Inactive Specialty and Certification records available for negative filtering verification

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify presence, labeling, and placement of Certification and Specialty fields on Temp form | 1. Log in as Staffing Admin.<br>2. Navigate to Temp section (`/temp`).<br>3. Click "+ Add Temp" button to open `/temp/new`.<br>4. Inspect the form sections. | Both "Certification" and "Specialty" fields render clearly with appropriate labels, placeholders, and alignment in the Right Box of the Temp details form layout. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Verify dynamic loading of active Certifications into the Certification dropdown | 1. Navigate to `/temp/new`.<br>2. Inspect Certification dropdown options. | Dropdown dynamically lists all active certifications configured in Admin General Settings; default option is "Select Certification". | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Verify Specialty dropdown is initially disabled with placeholder Select Certification first | 1. Navigate to `/temp/new`.<br>2. Inspect Specialty dropdown before any certification selection. | Specialty dropdown is disabled (`disabled=""`) and displays placeholder "Select Certification first". | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Verify dynamic Specialty options population and enabling upon selecting a mapped Certification | 1. Select a Certification with mapped specialties (e.g., "BLS-Mapping-Test").<br>2. Inspect Specialty dropdown state and options.<br>3. Select a mapped specialty. | Specialty dropdown becomes enabled; options include "Select Specialty" and mapped specialties; selection updates value correctly. | Decision Table Testing | Automated (PASSED) |
| TC-05 | Positive | Verify Specialty dropdown behavior when selected Certification has no mapped specialties | 1. Select a Certification without mapped specialties (e.g., "ACLS-No-Mapping").<br>2. Inspect Specialty dropdown. | Specialty dropdown remains disabled and displays "No mapped specialties". | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Verify clearing Certification selection resets and disables Specialty dropdown | 1. Select mapped Certification and Specialty.<br>2. Clear Certification selection back to default ("Select Certification"). | Specialty dropdown resets to default and becomes disabled with placeholder "Select Certification first". | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify successful creation of Temp record with both Certification and Specialty | 1. Fill all required Temp details.<br>2. Select valid Certification and mapped Specialty.<br>3. Click "Save". | Temp record is successfully created (`POST /api/temps` returns 201 Created); response reflects saved certification and specialty; success toast appears. | State Transition Testing | Automated (PASSED) |
| TC-08 | Positive | Verify creation of Temp record with Certification selected and Specialty omitted | 1. Fill all required Temp details.<br>2. Select Certification.<br>3. Leave Specialty unselected.<br>4. Click "Save". | Temp record is created successfully with selected Certification and null Specialty without validation errors. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Positive | Verify creation of Temp record without Certification and Specialty (optional fields) | 1. Fill all required Temp details.<br>2. Leave both Certification and Specialty fields blank.<br>3. Click "Save". | Temp record is created successfully; system treats fields as optional, storing null values. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Positive | Verify pre-population and read-only state of Certification and Specialty on existing Temp record | 1. Open an existing Temp record that has saved Certification and Specialty.<br>2. Verify pre-populated values and field disabled states. | Pre-populated values match existing record; fields are read-only / disabled in View mode. | State Transition Testing | Automated (PASSED) |
| TC-11 | Positive | Verify editing and updating Certification and Specialty on an existing Temp record | 1. Open existing Temp record in Detail view.<br>2. Click "Edit" button.<br>3. Modify Specialty.<br>4. Click "Save". | In Edit mode, fields become editable; saving triggers `PUT /api/temps` (200 OK); record updates with modified values. | State Transition Testing | Automated (PASSED) |
| TC-12 | Positive | Verify Cancel action discards selected Certification and Specialty without saving | 1. Fill form and select Certification and Specialty.<br>2. Click "Cancel".<br>3. Reopen "+ Add Temp" form. | Form is dismissed without saving; reopening form displays blank/default state for Certification and Specialty. | State Transition Testing | Automated (PASSED) |
| TC-13 | Negative | Verify inactive Certifications are excluded from selectable options | 1. Set a Certification to "Inactive" in Admin General Settings.<br>2. Navigate to `/temp/new`.<br>3. Inspect Certification dropdown options. | Inactive Certifications do not appear in the selectable options for creating new Temp records. | Error Guessing / Negative | Automated (PASSED) |
| TC-14 | Negative | Verify unauthenticated access protection redirects /temp/new to /login | 1. Log out or start an unauthenticated session.<br>2. Attempt direct navigation to `/temp/new`. | Access is denied; user is redirected to `/login`; Temp form and fields are not exposed. | Security / Negative Testing | Automated (PASSED) |
| TC-15 | Edge | Verify responsive layout and keyboard accessibility across Specialty & Certification fields | 1. Test Temp page across desktop (1280px) and mobile (375px) viewports.<br>2. Navigate using keyboard Tab key. | Desktop renders clean two-column layout; mobile renders vertically stacked boxes without horizontal overflow; Tab key moves focus cleanly to enabled elements. | Boundary Value Analysis / Accessibility | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Route: `/temp/new`, `/temp`, `/temp/:id`
- Seeded Active Specialties (`Cardiology`, `Pediatrics`)
- Seeded Active Certifications (`BLS-Mapping-Test`, `ACLS-No-Mapping`)
- Seeded Inactive Certification (`CPR-Inactive-Test`)
- Sample Temp payload (Name, Phone, Email, Address, City, State, ZIP, Status, DOB, Gender, MaritalStatus)

### Implementation & Layered Architecture
- **Spec:** [`tests/tempCertificationSpecialty.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCertificationSpecialty.spec.ts)
- **Page Objects:** [`pages/BaseTempFormPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/BaseTempFormPage.ts), [`pages/AddTempPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/AddTempPage.ts), [`pages/TempDetailPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/TempDetailPage.ts)
- **Fixtures:** `authenticatedAddTempPage`, `authenticatedTempDetailPage`, `addTempPage` in [`fixtures/customFixtures.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [`test-data/tempCertSpecialtyData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/tempCertSpecialtyData.ts), [`test-data/addTempData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/addTempData.ts)

### Verification
- **Execution Command:** `npx playwright test tests/tempCertificationSpecialty.spec.ts`
- **Result:** 15 passed (12.7s) - 100% Pass Rate
