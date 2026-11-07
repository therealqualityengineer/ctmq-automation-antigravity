# Test Plan: CTMQ-53 - Implement Edit functionality for Shifts, Order Types, and Status Options in Admin General Settings
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-64)
**Status:** Automated & Verified (10/10 Passed)
**Spec File:** [`tests/adminGeneralSettingsEdit.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminGeneralSettingsEdit.spec.ts)

### Summary & Objectives
Validate the Edit functionality for Shifts, Order Types, and Status Options in Admin General Settings. Verify that clicking any existing record opens the respective modal in Edit mode with pre-populated values, that entity Names are strictly immutable/disabled, that editable attributes can be updated and saved via PUT endpoints, that success feedback banners display and lists refresh dynamically, and that existing Add flows remain backward compatible.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated with Staffing Admin permissions.
- Existing records exist for Shifts (`/admin/shifts`), Order Types (`/admin/order-types`), and Status Options (`/admin/status-options`).

### Test Scenarios & Execution Matrix

| Scenario ID | Type | Description | Test Steps | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Edit Shift Option - Update times and default flag | 1. Navigate to `/admin/shifts`<br>2. Click an existing Shift row/name<br>3. Verify modal opens with pre-populated values<br>4. Modify Start Time, End Time, and toggle Is Default<br>5. Click Save/Submit | Modal closes, green FeedbackBanner is displayed, updated times and default status appear in table without full page reload. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-02 | Positive | Edit Order Type - Update status, default, and shift default | 1. Navigate to `/admin/order-types`<br>2. Click an existing Order Type row/name<br>3. Verify modal opens with pre-populated values<br>4. Update Status (Active/Hidden), Is Default, and Shift Order Type Default<br>5. Click Save/Submit | Modal closes, green FeedbackBanner is displayed, updated values reflect in the Order Types table. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-03 | Positive | Edit Status Option - Update description, active state, and display order | 1. Navigate to `/admin/status-options`<br>2. Click an existing Status Option row/name<br>3. Verify modal opens with pre-populated values<br>4. Update Description, toggle Active/Inactive, and change Display Order<br>5. Click Save/Submit | Modal closes, green FeedbackBanner is displayed, updated description, status, and display order reflect in the table. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-04 | Positive | Backward Compatibility - Add modals remain functional | 1. Navigate to `/admin/shifts`, `/admin/order-types`, `/admin/status-options`<br>2. Click "+ Add Shift", "+ Add Order Type", "+ Add Status Option"<br>3. Verify modal titles and fields | Modals open in Create mode with title "Add ...", entity Name fields are empty and editable. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-05 | Negative | Verify Entity Names are Immutable / Disabled in Edit Mode | 1. Open Edit modal for Shift, Order Type, and Status Option<br>2. Inspect Name input element in each modal | Shift Name, Order Type Name, and Status Option Name inputs are strictly disabled (`disabled` attribute, `cursor-not-allowed`). | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-06 | Negative | Shift Edit Validation - Missing/cleared required times | 1. Open Edit modal for an existing Shift<br>2. Clear required Start Time<br>3. Click Save/Submit | Modal remains open, input values are preserved, and required error message is displayed within the modal. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-07 | Negative | Status Option Edit Validation - Invalid display order handling | 1. Open Edit modal for a Status Option<br>2. Enter invalid Display Order (e.g. non-numeric / negative)<br>3. Click Save/Submit | Modal remains open, inputs are retained, and validation blocks submission. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-08 | Negative | Edit Modal Cancellation - Discard changes | 1. Open Edit modal on Shifts, Order Types, or Status Options<br>2. Modify fields<br>3. Click Cancel or Close button<br>4. Inspect table | Modal closes and no changes are persisted in the table. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-09 | Edge | Status Option Display Order Boundary Testing | 1. Open Edit modal for Status Option<br>2. Set Display Order to boundary values (e.g., 0, 999)<br>3. Save and inspect persisted values | Display order is saved accurately and persisted in UI. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |
| TC-10 | Edge | Shift & Order Type Is Default Toggle | 1. Open Edit modal for a non-default Shift/Order Type<br>2. Check "Is Default" and save<br>3. Re-open and uncheck "Is Default" and save | Default flag transitions accurately between true and false states. | Automated (`tests/adminGeneralSettingsEdit.spec.ts`) - Passed |

### Architecture & Components
- **Page Objects Updated**:
  - [`pages/ShiftsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/ShiftsPage.ts): Added `openEditShiftModal`, `openEditShiftModalByRow`, and `updateShift` methods with multi-mode title and save button selectors.
  - [`pages/OrderTypesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/OrderTypesPage.ts): Added `openEditOrderTypeModal`, `openEditOrderTypeModalByRow`, and `updateOrderType` methods supporting `#order-type-default` and dynamic status updates.
  - [`pages/StatusOptionsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/StatusOptionsPage.ts): Added `openEditStatusOptionModal`, `openEditStatusOptionModalByRow`, `fillDisplayOrder`, and `updateStatusOption` methods.
- **Test Data**:
  - [`test-data/adminGeneralSettingsEditData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminGeneralSettingsEditData.ts): Centralized routes, titles, success banners, immutable field classes, and test payloads.
- **Test Suite**:
  - [`tests/adminGeneralSettingsEdit.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminGeneralSettingsEdit.spec.ts): 10 test scenarios covering all positive, negative, and edge test cases.

### Test Execution Results
- `npx playwright test tests/adminGeneralSettingsEdit.spec.ts`: **10 / 10 Passed (100%)**
