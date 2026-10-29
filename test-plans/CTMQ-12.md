# Test Plan: CTMQ-12 - Improve Temp save feedback and enforce unique email
**Jira Sub-task:** [QA Testing Antigravity](CTMQ-38)
**Status:** Automated

### Summary & Objectives
Validate the Temp save experience, ensuring clear success/failure feedback on the Temp details page without unwanted page redirects. Verify strict email uniqueness enforcement (normalized trimming and case-insensitivity) and ensure save triggers only via explicit click on the "Save" button rather than Enter keypresses or inadvertent events.

### Preconditions & Setup
- User is logged in as a Staffing Admin with permissions to create/edit Temps.
- The application database contains at least one existing Temp record with a known email (e.g., `existing.temp@example.com`).
- Temp details/creation form is accessible.

### Test Scenarios

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Successful Temp Save & Feedback | 1. Navigate to Temp details page.<br>2. Fill in all required fields with valid unique data.<br>3. Click "Save". | Temp is saved successfully. A clear success message is displayed on the same page. User remains on the Temp details page without redirecting to the list. | Equivalence Partitioning | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-02 | Negative | Duplicate Email Rejection - Exact Match | 1. Navigate to Temp details page.<br>2. Enter an email that already exists in the system.<br>3. Click "Save". | Duplicate email is rejected with a clear field-level validation error. User remains on the page with all entered values retained. | Equivalence Partitioning | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-03 | Negative | Duplicate Email Rejection - Trimmed Whitespace | 1. Navigate to Temp details page.<br>2. Enter an existing email with leading and trailing spaces (e.g., `  existing.temp@example.com  `).<br>3. Click "Save". | Email is normalized and rejected as a duplicate. Clear validation error is shown. Form values are retained on the same page. | Boundary Value Analysis | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-04 | Negative | Duplicate Email Rejection - Case-Insensitive | 1. Navigate to Temp details page.<br>2. Enter an existing email using uppercase/mixed-case characters (e.g., `EXISTING.TEMP@EXAMPLE.COM`).<br>3. Click "Save". | Email is evaluated case-insensitively and rejected as duplicate. Error message displayed; values retained on page. | Equivalence Partitioning | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-05 | Edge | Form Field Enter Key Does Not Trigger Save | 1. Navigate to Temp details page and fill in fields.<br>2. Focus on an input field (e.g., Name, Email).<br>3. Press the "Enter" key on the keyboard. | No form submission or save request is triggered. Focus remains in the field; save only triggers upon clicking the Save button. | Event Handling / Boundary Analysis | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-06 | Edge | Rapid Repeated Save Button Clicks | 1. Fill in valid Temp details.<br>2. Rapidly click the "Save" button multiple times while the save request is pending. | Save button is disabled or debounced during the request. Only one submission is sent to the server, preventing duplicate records. | Concurrency / Boundary Analysis | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-07 | Negative | Server / API Failure Handling | 1. Fill in valid Temp details.<br>2. Simulate an API or database failure (e.g. 500 Internal Server Error).<br>3. Click "Save". | A clear error message is displayed indicating the save failed. No success message is shown. All entered values are retained on the page. | Negative & Error Handling | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-08 | Negative | Validation Failure on Missing / Invalid Data | 1. Leave required fields blank or provide invalid input formats.<br>2. Click "Save". | Validation messages are displayed for invalid fields. User remains on page with entered values retained. | Equivalence Partitioning | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |
| TC-09 | Positive | Keyboard Navigation Usability | 1. Use the Tab key and standard keyboard shortcuts to navigate through the Temp form.<br>2. Modify values using standard keyboard input. | Navigation and editing function smoothly without triggering unintended form saves or resets. | State Transition Testing | Automated ([`tempSaveFeedbackAndUniqueEmail.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempSaveFeedbackAndUniqueEmail.spec.ts)) |

### Required Test Data
- Existing Temp email: `existing.temp@example.com`
- Unique Temp email: `new.temp.${timestamp}@example.com`
- Whitespace duplicate test email: `  existing.temp@example.com  `
- Uppercase duplicate test email: `EXISTING.TEMP@EXAMPLE.COM`
- Valid payload fields: First Name, Last Name, Phone, Address, etc.

### Automation Implementation
- **Test Spec:** `tests/tempSaveFeedbackAndUniqueEmail.spec.ts`
- **Page Object:** `pages/AddTempPage.ts`
- **Fixtures:** `fixtures/customFixtures.ts`
- **Test Data:** `test-data/addTempData.ts`
- **Test Execution:** 9 passed / 0 failed (100% pass rate)
