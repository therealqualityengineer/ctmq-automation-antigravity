# Test Plan: CTMQ-6 - Implement complete Add User functionality
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-34)
**Status:** Automated & Verified (18 / 18 Passed - 100%)

### Summary & Objectives
Implement and verify complete Add User functionality from Admin → User Manager, allowing an authenticated Staffing Admin to create another Staffing Admin account. The verification encompasses navigation from the `+ Add User` button, form UI validations, role locking (Staffing Admin), active/inactive status selection, uniqueness enforcement (username and email), security controls (authentication enforcement, no plaintext or returned password hashes), double-submission prevention, and non-regression of existing user management features.

### Preconditions & Setup
- Deployed or local CTMQ application running frontend and backend services.
- Authenticated session with an active Staffing Admin user.
- Unauthenticated session state for route and API security tests.
- Database contains seeded users for duplicate detection testing.

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Navigation to Add User form via `+ Add User` button | 1. Log in as Staffing Admin.<br>2. Navigate to Admin → User Manager (`/admin/users`).<br>3. Click the `+ Add User` button. | Browser navigates to the Add User form route (e.g. `/admin/users/new`) and renders the form with all required controls. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Add User form layout, field defaults, and role immutability | 1. Navigate to `/admin/users/new`.<br>2. Inspect all form fields, default selections, and attributes. | Form renders Full Name, User Name, Title, Email, Role, and Status fields.<br>Role is prefilled with "Staffing Admin" and is disabled/read-only.<br>Status defaults to "Active". | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Successful creation of active Staffing Admin account | 1. Fill in valid unique Full Name, User Name, Title, and Email.<br>2. Keep Status as "Active".<br>3. Click Save/Submit. | Account is created in PostgreSQL; success message/toast is displayed; user is redirected to `/admin/users`. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Successful creation of inactive Staffing Admin account | 1. Fill in valid unique Full Name, User Name, Title, and Email.<br>2. Select Status as "Inactive".<br>3. Click Save/Submit. | Account is created with Inactive status; success feedback is shown; redirected to User Manager list. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Newly created user visibility and accuracy in User Manager list | 1. Create a new user with known attributes.<br>2. Redirect to User Manager table.<br>3. Locate newly created user row or search for username. | Table displays the created user with accurate Full Name, User Name, Title, Role ("Staffing Admin"), Status, and Email. | State Transition Testing | Automated (PASSED) |
| TC-06 | Positive | Cancel button discards input and returns to list | 1. Navigate to `/admin/users/new`.<br>2. Enter data into fields.<br>3. Click "Cancel". | Form input is discarded; user is navigated back to `/admin/users`; no new user record is created. | State Transition Testing | Automated (PASSED) |
| TC-07 | Negative | Mandatory field validation on empty form submission | 1. Navigate to `/admin/users/new`.<br>2. Leave all fields empty.<br>3. Click Save/Submit. | Submission is blocked; field-level validation errors appear for Full Name, User Name, Title, and Email. | Error Guessing | Automated (PASSED) |
| TC-08 | Negative | Individual mandatory field validation | 1. Navigate to `/admin/users/new`.<br>2. Test omitting one mandatory field at a time (e.g., missing Email or missing Username).<br>3. Attempt to save. | Appropriate field-level error message is shown for the specific missing field without submitting invalid payload. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Negative | Invalid email format validation | 1. Enter valid Full Name, User Name, and Title.<br>2. Enter invalid email formats (`user@`, `@domain.com`, `plainaddress`, `user@domain`).<br>3. Attempt to save. | Form displays email format validation error ("Invalid email address"); save is blocked. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Negative | Duplicate User Name conflict handling | 1. Fill form with an existing user's username (testing exact and different casing).<br>2. Provide valid unique values for other fields.<br>3. Click Save/Submit. | Request is rejected with a clear conflict message (e.g., "Username already in use"); no raw database/SQL exception is exposed. | Equivalence Partitioning | Automated (PASSED) |
| TC-11 | Negative | Duplicate Email conflict handling | 1. Fill form with an existing user's email address.<br>2. Provide valid unique values for other fields.<br>3. Click Save/Submit. | Request is rejected with a clear conflict message (e.g., "Email already in use"); no raw database/SQL exception is exposed. | Equivalence Partitioning | Automated (PASSED) |
| TC-12 | Negative | Route protection for unauthenticated users | 1. Start an unauthenticated browser session (logged out).<br>2. Attempt direct navigation to `/admin/users/new`. | Access is denied; user is redirected to `/login` with return URL parameter; Add User form is not exposed. | Boundary Value Analysis | Automated (PASSED) |
| TC-13 | Negative | API endpoint authorization enforcement | 1. Send `POST /api/admin/users` without authorization token/session cookie. | Server returns HTTP 401 Unauthorized; account creation is rejected. | Boundary Value Analysis | Automated (PASSED) |
| TC-14 | Edge | Input sanitization and leading/trailing whitespace trimming | 1. Enter username and email with leading and trailing whitespaces.<br>2. Save the user.<br>3. Inspect the stored/returned record. | Whitespace is automatically trimmed and normalized prior to persistence. | Boundary Value Analysis | Automated (PASSED) |
| TC-15 | Edge | Maximum boundary length handling on input fields | 1. Enter inputs at and beyond boundary character limits for Full Name, Username, Title, and Email.<br>2. Attempt to save. | Fields enforce agreed max length restrictions via client validation and backend schema constraints. | Boundary Value Analysis | Automated (PASSED) |
| TC-16 | Edge | Double-submission and in-progress save protection | 1. Fill valid form details.<br>2. Click Save/Submit and immediately attempt rapid repeat clicks or trigger multiple submits. | Submit button enters disabled/loading state during request processing, preventing duplicate user creation requests. | State Transition Testing | Automated (PASSED) |
| TC-17 | Edge | Security: Password hash exclusion in API response | 1. Intercept network response payload from successful `POST /api/admin/users`. | Response payload omits password hash, salt, or plaintext secrets; only public profile attributes are returned. | Error Guessing | Automated (PASSED) |
| TC-18 | Edge | Non-regression: Existing search, pagination, and edit workflows | 1. Navigate to `/admin/users`.<br>2. Verify search filtering, table pagination, and row edit navigation continue to function correctly. | Existing User Manager features remain fully operational with zero regression. | Equivalence Partitioning | Automated (PASSED) |

### Required Test Data
- **Staffing Admin Auth**: Active Staffing Admin credentials for authenticated session (`qaengineer`).
- **New Valid User**:
  - Full Name: `Test User <unique>`
  - User Name: `usr_<unique>`
  - Title: `Staffing Specialist`
  - Email: `<unique>@example.com`
  - Role: `Staffing Admin`
  - Status: `Active` / `Inactive`
- **Duplicate User Seed Data**: Existing user record (e.g., `qaengineer` / `therealqualityengineer@gmail.com`).
- **Invalid Form Data**:
  - Empty strings `""` for mandatory fields.
  - Invalid emails: `invalid-email`, `user@`, `@domain.com`.
  - Boundary strings: 100+ chars for fields with limits.

### Automation Implementation & Verification Summary
- **Spec File**: `tests/addUser.spec.ts`
- **Page Objects**: `pages/AddUserPage.ts`, `pages/UserManagerPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/addUserData.ts`
- **Branch**: `CTMQ-6-Testing`
- **Test Results**: 18 passed / 0 failed (5.3s) - 100% Pass Rate
