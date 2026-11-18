# Test Plan: CTMQ-75 - Dynamically populate Temp and Client Status dropdowns from active Admin Status Options
**Jira Sub-task:** [QA Testing Antigravity](CTMQ-77)
**Status:** Automated ([tests/dynamicStatusOptions.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/dynamicStatusOptions.spec.ts))

### Summary & Objectives
Verify that the Status dropdowns on Temp and Client create/edit pages dynamically populate from active Status Options configured in Admin General Settings (`/admin/status-options`), that `GET /api/admin/status-options` supports active status filtering, that `POST`/`PUT` endpoints for Temps and Clients dynamically validate submitted statuses against active `status_options`, and that existing records with baseline or subsequently inactivated statuses remain intact without data loss.

### Preconditions & Setup
- Authenticated user with Admin / QA Engineer (`qaengineer`) role having access to `/admin/status-options`, `/temps`, `/clients`, and corresponding API endpoints.
- Baseline Status Options (`Active`, `Inactive`) exist for both `Temp` and `Client` entity types.
- Dynamic test status options (e.g., custom active status, custom inactive status) are created via Admin Status Options or API with unique short suffixes (`<= 16` chars) for test isolation.

### Test Scenarios

| Scenario ID | Type | Description | Automation Status | Spec Reference | Testing Technique |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | API filters active Temp Status Options ordered by DisplayOrder then Name | Automated | `tests/dynamicStatusOptions.spec.ts` | Equivalence Partitioning |
| TC-02 | Positive | API filters active Client Status Options ordered by DisplayOrder then Name | Automated | `tests/dynamicStatusOptions.spec.ts` | Equivalence Partitioning |
| TC-03 | Positive | Create Temp page dynamically populates active Temp Status Options with "Active" default | Automated | `tests/dynamicStatusOptions.spec.ts` | State Transition Testing |
| TC-04 | Positive | Create Client page dynamically populates active Client Status Options with "Active" default | Automated | `tests/dynamicStatusOptions.spec.ts` | State Transition Testing |
| TC-05 | Positive | Create and Edit Temp using newly added active Status Option | Automated | `tests/dynamicStatusOptions.spec.ts` | State Transition Testing |
| TC-06 | Positive | Create and Edit Client using newly added active Status Option | Automated | `tests/dynamicStatusOptions.spec.ts` | State Transition Testing |
| TC-07 | Negative | Inactive Status Options are excluded from Temp and Client dropdowns | Automated | `tests/dynamicStatusOptions.spec.ts` | Equivalence Partitioning |
| TC-08 | Negative | Entity isolation between Temp and Client Status dropdowns | Automated | `tests/dynamicStatusOptions.spec.ts` | Decision Table Testing |
| TC-09 | Negative | Backend rejects invalid, inactive, or cross-entity status on Temp/Client create and update | Automated | `tests/dynamicStatusOptions.spec.ts` | Error Guessing |
| TC-10 | Edge | Existing Temp/Client with subsequently inactivated status preserves data on View/Edit | Automated | `tests/dynamicStatusOptions.spec.ts` | State Transition Testing |
| TC-11 | Edge | Default "Active" selection fallback when "Active" option is inactive or absent | Automated | `tests/dynamicStatusOptions.spec.ts` | Boundary Value Analysis |
| TC-12 | Positive | Baseline Status Options ("Active", "Inactive") exist and existing records remain compatible | Automated | `tests/dynamicStatusOptions.spec.ts` | Equivalence Partitioning |

### Automation Assets Added / Updated
- **Spec**: `tests/dynamicStatusOptions.spec.ts` (12 automated scenarios, 12 passed)
- **Page Objects Updated**:
  - `pages/StatusOptionsPage.ts` (`getStatusOptionsViaApi`, `createStatusOptionViaApi`, `updateStatusOptionViaApi`)
  - `pages/BaseTempFormPage.ts` (`getStatusOptionTexts`, `getSelectedStatus`, `selectStatus`, `fillAddress`)
  - `pages/TempDetailPage.ts` (`createTempRawViaApi`, `updateTempRawViaApi`)
  - `pages/ClientDetailPage.ts` (`getStatusOptionTexts`, `getSelectedStatus`, `selectStatus`, `fillAddress`, `createClientRawViaApi`, `updateClientRawViaApi`)
- **Test Data Updated**:
  - `test-data/statusOptionsData.ts` (`dynamicDropdowns` generator & payloads)
  - `test-data/addTempData.ts` (widened `TempPayload.status` type to support custom dynamic statuses)
