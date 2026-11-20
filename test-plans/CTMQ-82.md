# Test Plan: CTMQ-82 - Add mandatory field indicators, optional Title uniformity, and validation on Add/Edit User pages
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-83)
**Status:** Automated (`tests/userMandatoryFields.spec.ts`)
**Page Objects & Fixtures:** `pages/AddUserPage.ts`, `pages/UserDetailPage.ts`, `fixtures/customFixtures.ts`, `test-data/addUserData.ts`, `test-data/userDetailData.ts`

### Summary & Objectives
Verify that Add User (`/admin/users/new`) and View/Edit User (`/admin/users/:id`) enforce consistent visual mandatory field indicators (`*` with `text-red-600`), treat `Title` as optional on both Add and Edit flows (persisting `null` when empty/whitespace), and provide dual validation feedback (top `FeedbackBanner` + inline field error) for missing required fields and password/confirm-password mismatches while preserving existing guards (`409 Conflict` duplicate username/email, self-deactivation, and self-deletion).

### Preconditions & Setup
- CTMQ application is running at `http://localhost:5173`.
- Authenticated as an active Admin user (`qaengineer`).
- At least one existing User record is available in User Manager (`/admin/users`) for View/Edit testing.

### Test Scenarios

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Add User mandatory field indicators (`*`) and non-marked optional fields | 1. Navigate to `/admin/users/new`.<br>2. Inspect `FieldRow` labels for **Full Name**, **User Name**, **E-Mail**, **Password**, and **Confirm Password**.<br>3. Inspect `FieldRow` labels for **Title** and **Status**. | - All 5 mandatory fields (`Full Name`, `User Name`, `E-Mail`, `Password`, `Confirm Password`) render a red asterisk (`*`, `text-red-600`).<br>- Optional/defaulted fields (`Title`, `Status`) do not render a mandatory asterisk (`*`), and `Title` input does not have the HTML `required` attribute. | Equivalence Partitioning |
| TC-02 | Positive | View and Edit User mandatory field indicators (`*`) and optional Title | 1. Navigate to `/admin/users/:id` in View mode.<br>2. Inspect `FieldRow` labels for **Full Name**, **User Name**, **E-Mail**, **Title**, and **Status**.<br>3. Switch to Edit mode and re-inspect the labels. | - In both View and Edit modes, `Full Name`, `User Name`, and `E-Mail` render the red mandatory asterisk (`*`, `text-red-600`).<br>- `Title` and `Status` do not render a mandatory asterisk (`*`) in either mode. | State Transition Testing |
| TC-03 | Positive | Create new User with empty/omitted Title succeeds (`201 Created`) and persists `title: null` | 1. Navigate to `/admin/users/new` (or invoke `POST /api/admin/users`).<br>2. Fill valid **Full Name**, **User Name**, **E-Mail**, **Password**, and matching **Confirm Password**, leaving **Title** blank/whitespace.<br>3. Save the user and inspect the created record. | - Creation succeeds (`201 Created`) without validation errors.<br>- Persisted user record stores `title: null` and displays empty/fallback title on View/Edit User. | Equivalence Partitioning |
| TC-04 | Negative | Add User required field validation displays top `FeedbackBanner` and inline field errors | 1. Navigate to `/admin/users/new`.<br>2. Attempt to save with blank/whitespace values for mandatory fields (**Full Name**, **User Name**, **E-Mail**, **Password**, **Confirm Password**).<br>3. Also verify API `POST /api/admin/users` rejects missing required fields with `400 Bad Request`. | - Submission is blocked (no `POST` request sent from UI when client validation fails).<br>- Error feedback is displayed in **both** the top `FeedbackBanner` and inline beneath each offending mandatory field.<br>- Backend `POST /api/admin/users` returns `400 Bad Request` when required fields are blank. | Error Guessing / Decision Table |
| TC-05 | Negative / Edge | Add User Password and Confirm Password mismatch validation and live error clearing on typing | 1. Navigate to `/admin/users/new`.<br>2. Fill valid **Full Name**, **User Name**, and **E-Mail**.<br>3. Enter different values in **Password** and **Confirm Password** and click Save.<br>4. Modify **Password** or **Confirm Password** by typing. | - Saving with mismatched passwords is blocked and displays `"Password and Confirm Password must match."` in **both** the top `FeedbackBanner` and inline beneath **Confirm Password**.<br>- Typing in **Password** or **Confirm Password** immediately clears the mismatch error. | Boundary Value Analysis / State Transition |
| TC-06 | Negative | Edit User required field validation displays top `FeedbackBanner` and inline field errors | 1. Navigate to `/admin/users/:id` and click Edit.<br>2. Clear **Full Name**, **User Name**, or **E-Mail** (or enter whitespace-only) and click Save.<br>3. Also verify `PUT /api/admin/users/{id}` rejects missing required fields with `400 Bad Request`. | - Saving is blocked in the UI.<br>- Validation error is shown in **both** the top `FeedbackBanner` and inline below the offending field(s).<br>- Backend `PUT /api/admin/users/{id}` returns `400 Bad Request` for blank required fields. | Error Guessing / Equivalence Partitioning |
| TC-07 | Edge / Regression | Preserve existing duplicate (`409 Conflict`) and self-protection guards without data loss | 1. Attempt to create a user with an existing `userName` or `email` (`POST /api/admin/users`).<br>2. Verify existing user records remain intact and clearing `Title` on Edit User persists `title: null`. | - Duplicate `userName` or `email` returns `409 Conflict` with descriptive feedback.<br>- Existing users suffer zero data loss. | Regression / Decision Table |

### Required Test Data
- **Mandatory Add User Fields**: `["Full Name", "User Name", "E-Mail", "Password", "Confirm Password"]`
- **Mandatory Edit User Fields**: `["Full Name", "User Name", "E-Mail"]`
- **Non-Marked Fields**: `["Title", "Status"]`
- **Mismatch Error Message**: `"Password and Confirm Password must match."`
- **Dynamic User Payloads**: Timestamped/unique `userName` and `email` values to avoid collision across runs.
