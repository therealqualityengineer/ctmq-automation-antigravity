# Test Plan: CTMQ-54 - [Admin] Modal submit button remains stuck in 'Saving...' disabled state after previously saving an item

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-68)
**Status:** Automated & Verified (8/8 Passed - 100%)
**Spec File:** [`tests/adminModalSubmitReset.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminModalSubmitReset.spec.ts)

### Summary & Objectives
Verify that across all Admin General Settings modals (Certifications, Specialties, Shifts, Order Types, and Status Options), after saving an item and closing the modal, reopening the popup modal immediately displays the submit button in an enabled, clickable state with text "Save". Verify that users can successfully submit consecutive items without requiring a full page refresh, that closing/cancelling modals resets submission state, and that form state is properly re-initialized across interactions.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated with Staffing Admin permissions
- Seeded test data exists for each entity

### Test Scenarios & Execution Matrix

| Scenario ID | Type | Description | Test Steps | Expected Result | Automation & Execution Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify Shifts modal submit button resets to "Save" and remains enabled after successful save | 1. Navigate to `/admin/shifts`<br>2. Click "+ Add Shift Option"<br>3. Fill valid details and click "Save"<br>4. Verify item saved and modal closes<br>5. Click "+ Add Shift Option" again<br>6. Inspect submit button<br>7. Submit second shift | Modal opens with clean form; submit button displays "Save", is enabled (`disabled=false`), and allows immediate consecutive submission. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-02 | Positive | Verify Order Types modal submit button resets to "Save" and remains enabled after successful save | 1. Navigate to `/admin/order-types`<br>2. Click "+ Add Order Type"<br>3. Fill valid details and click "Save"<br>4. Verify item saved and modal closes<br>5. Click "+ Add Order Type" again<br>6. Inspect submit button<br>7. Submit second order type | Modal opens with clean form; submit button displays "Save Order Type" / "Save", is enabled, and allows immediate consecutive submission. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-03 | Positive | Verify Status Options modal submit button resets to "Save" and remains enabled after successful save | 1. Navigate to `/admin/status-options`<br>2. Click "+ Add Status Option"<br>3. Fill valid details and click "Save"<br>4. Verify item saved and modal closes<br>5. Click "+ Add Status Option" again<br>6. Inspect submit button<br>7. Submit second status option | Modal opens with clean form; submit button displays "Save", is enabled, and allows immediate consecutive submission. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-04 | Positive | Verify Certifications modal submit button resets to "Save" and remains enabled after successful save | 1. Navigate to `/admin/certifications`<br>2. Click "+ Add Certification"<br>3. Fill valid details and click "Save"<br>4. Verify item saved and modal closes<br>5. Click "+ Add Certification" again<br>6. Inspect submit button<br>7. Submit second certification | Modal opens with clean form; submit button displays "Save", is enabled, and allows immediate consecutive submission. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-05 | Positive | Verify Specialties modal submit button resets to "Save" and remains enabled after successful save | 1. Navigate to `/admin/specialties`<br>2. Click "+ Add Specialty"<br>3. Fill valid details and click "Save"<br>4. Verify item saved and modal closes<br>5. Click "+ Add Specialty" again<br>6. Inspect submit button<br>7. Submit second specialty | Modal opens with clean form; submit button displays "Save", is enabled, and allows immediate consecutive submission. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-06 | Positive | Verify modal dismissal via Cancel or Close (X) preserves enabled "Save" button state on reopen | 1. Open Add modal on any Admin page<br>2. Partially fill inputs<br>3. Dismiss via Cancel or Close (X)<br>4. Reopen modal | Modal reopens with clean inputs; submit button displays "Save" and is enabled. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-07 | Negative | Verify validation failure does not permanently lock the modal submit button | 1. Open Add modal<br>2. Attempt submit with invalid/empty fields<br>3. Correct fields with valid data<br>4. Click Save | Submit button remains responsive and successfully saves when fields are corrected. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |
| TC-08 | Edge | Verify rapid consecutive open and close toggles do not corrupt submit button state | 1. Open Add modal and immediately close it 3 times consecutively<br>2. Open Add modal a 4th time<br>3. Inspect submit button | Modal opens cleanly with enabled "Save" button and full submission capability. | Automated (`tests/adminModalSubmitReset.spec.ts`) - Passed |

### Architecture & Layered Implementation
- **Spec:** [`tests/adminModalSubmitReset.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminModalSubmitReset.spec.ts)
- **Page Objects Reused:**
  - [`pages/ShiftsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/ShiftsPage.ts)
  - [`pages/OrderTypesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/OrderTypesPage.ts)
  - [`pages/StatusOptionsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/StatusOptionsPage.ts)
  - [`pages/CertificationsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/CertificationsPage.ts)
  - [`pages/SpecialtiesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/SpecialtiesPage.ts)
- **Fixtures:** `authenticatedShiftsPage`, `authenticatedOrderTypesPage`, `authenticatedStatusOptionsPage`, `authenticatedCertificationsPage`, `authenticatedSpecialtiesPage` in [`fixtures/customFixtures.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [`test-data/adminModalSubmitResetData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminModalSubmitResetData.ts)

### Test Execution Results
- Command: `npx playwright test tests/adminModalSubmitReset.spec.ts`
- Result: **8 / 8 Passed (100% Pass Rate)**
