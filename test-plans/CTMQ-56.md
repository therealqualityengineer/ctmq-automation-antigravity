# Test Plan: CTMQ-56 - [Admin] Align User Profile page with Temp and Client View/Edit mode pattern

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-65)
**Status:** Automated & Verified (11/11 Passed - 100%)

### Summary & Objectives
Verify the User profile page (/admin/users/:id) alignment with Temp and Client View/Edit mode architecture. Ensure default read-only View mode with appropriate disabled styling and action buttons (Edit, Delete), seamless switching to Edit mode with editable fields and action buttons (Save, Cancel, Delete), accurate rollback on Cancel, successful update and feedback banner on Save while remaining on page, Delete confirmation modal behavior in both modes, and enforcement of self-deactivation and self-deletion server guards.

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin/users` accessible)
- Authenticated user with Admin role permissions.
- Test user accounts seeded in the database (active test user, duplicate candidate user, and the current logged-in admin user).
- Navigated to Admin User Management (`/admin/users`).

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Default View Mode Verification | 1. Navigate to `/admin/users/:id` for an existing user.<br>2. Inspect page title, input/select fields, and action buttons. | Page title displays "View User". Inputs (`Full Name`, `User Name`, `Title`, `E-Mail`) and select (`Status`) are disabled with disabled styles. `Role` is read-only. Action buttons display only [Edit] and [Delete]. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Mode Transition to Edit | 1. Navigate to `/admin/users/:id`.<br>2. Click [Edit] button. | Mode switches to Edit. Page title updates to "Edit User". Input fields and select become enabled/interactive. Action buttons display [Save], [Cancel], and [Delete]. | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Cancel Discards Changes & Restores View Mode | 1. In Edit mode, modify `Full Name` and `Title`.<br>2. Click [Cancel] button. | Form reverts to original values without making a PUT request. Field/validation errors are cleared. Mode switches back to View mode with title "View User" and disabled fields. | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Save User Changes with In-Page Feedback | 1. In Edit mode, modify `Title` to a valid value.<br>2. Click [Save] button. | PUT `/api/admin/users/:id` is sent. Mode switches to View mode. URL stays on `/admin/users/:id`. Updated values persist on the page. Green FeedbackBanner displays "User saved successfully.". | State Transition Testing / EP | Automated (PASSED) |
| TC-05 | Negative | Validation Error on Required Fields | 1. In Edit mode, clear required `Full Name` or `E-Mail` field.<br>2. Click [Save] button. | Mode remains in Edit mode. Validation error message is displayed. Form is not submitted. | Negative / Error Guessing | Automated (PASSED) |
| TC-06 | Negative | Duplicate Username or Email Conflict (409) | 1. In Edit mode, enter a username or email belonging to another user.<br>2. Click [Save] button. | API returns 409 Conflict. Page remains in Edit mode with current edits intact. Error banner or inline field error displays the conflict message. | Boundary & Negative Testing | Automated (PASSED) |
| TC-07 | Negative | Self-Deactivation Prevention (400) | 1. Navigate to own admin user profile `/admin/users/:ownId`.<br>2. Switch to Edit mode and change `Status` to Inactive.<br>3. Click [Save] button. | API returns 400 Bad Request. Page remains in Edit mode. Error banner displays message preventing self-deactivation. | State Transition & Error Handling | Automated (PASSED) |
| TC-08 | Positive | Delete Modal Triggered from View Mode | 1. On `/admin/users/:id` in View mode, click [Delete] button.<br>2. Verify modal renders.<br>3. Click Cancel inside modal. | ConfirmDeleteModal opens with title "Delete User" and prompt "Are you sure? This can't be undone.". Canceling closes modal; page remains in View mode. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Delete Modal Triggered from Edit Mode | 1. On `/admin/users/:id` in Edit mode, click [Delete] button.<br>2. Verify modal renders.<br>3. Click Cancel inside modal. | ConfirmDeleteModal opens with title "Delete User". Canceling closes modal; page remains in Edit mode. | State Transition Testing | Automated (PASSED) |
| TC-10 | Positive | Delete User Execution & Redirection | 1. On `/admin/users/:id` for a non-admin/deletable user, click [Delete].<br>2. Confirm deletion in modal. | DELETE `/api/admin/users/:id` is executed. Redirects to `/admin/users`. Green FeedbackBanner displays "User deleted successfully.". User is removed from list. | Lifecycle / State Transition | Automated (PASSED) |
| TC-11 | Negative | Self-Deletion Prevention Guard (400) | 1. Navigate to own admin user profile `/admin/users/:ownId`.<br>2. Click [Delete] and confirm deletion. | API returns 400 Bad Request. Error message is displayed. User account is not deleted. | Negative / Security Guard | Automated (PASSED) |

### Required Test Data
- Target user ID and profile data (`Full Name`, `User Name`, `Title`, `E-Mail`, `Status: Active`).
- Updated valid profile payload (e.g., new `Title: "Senior Staffing Director"`).
- Conflicting user data (existing username/email for 409 test).
- Current authenticated Admin credentials and user ID for self-guard tests.

### Implementation & Layered Architecture
- **Spec:** `tests/userDetail.spec.ts`
- **Page Object:** `pages/UserDetailPage.ts`
- **Fixtures:** `userDetailPage`, `authenticatedUserDetailPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/userDetailData.ts`

### Verification
- **Command:** `npx playwright test tests/userDetail.spec.ts`
- **Result:** 11 passed (9.6s) - 100% Pass Rate
