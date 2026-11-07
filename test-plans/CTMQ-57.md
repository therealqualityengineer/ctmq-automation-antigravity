# Test Plan: CTMQ-57 - [Shared] Delete confirmation modal closes silently without deleting record or displaying error banner on failure

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-67)
**Status:** Automated & Verified (12/12 Passed - 100%)

### Summary & Objectives
Validate the Delete confirmation and error handling workflows across Temp, Client, and User Edit/Detail pages (`/temp/:id`, `/client/:id`, `/admin/users/:id`). Verify that confirming deletion triggers the respective `DELETE` endpoint (`/api/temps/{id}`, `/api/clients/{id}`, `/api/admin/users/{id}`). Ensure that on successful deletion (200 OK), the modal closes, the user is redirected to the corresponding list page, and a green success banner is displayed. Critically, ensure that on failure (400 self-deletion guard, 404 not found, 500 server error, or network failure), the confirmation modal closes and a prominent red `FeedbackBanner` is rendered displaying the failure error message, eliminating the silent failure defect where the modal closes without feedback.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated as Staffing Admin
- Active Temp, Client, and User records exist in the database

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify successful Temp deletion redirects to list with success banner | 1. Navigate to `/temp/:id`.<br>2. Click "Delete" button.<br>3. Confirm in modal.<br>4. Observe navigation and banner. | DELETE `/api/temps/{id}` returns 200; modal closes; redirects to `/temp`; green `FeedbackBanner` "Temp deleted successfully." displays; deleted temp is removed from list. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify successful Client deletion redirects to list with success banner | 1. Navigate to `/client/:id`.<br>2. Click "Delete" button.<br>3. Confirm in modal.<br>4. Observe navigation and banner. | DELETE `/api/clients/{id}` returns 200; modal closes; redirects to `/client`; green `FeedbackBanner` "Client deleted successfully." displays; deleted client is removed from list. | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Verify successful User deletion redirects to user manager with success banner | 1. Navigate to `/admin/users/:id`.<br>2. Click "Delete" button.<br>3. Confirm in modal.<br>4. Observe navigation and banner. | DELETE `/api/admin/users/{id}` returns 200; modal closes; redirects to `/admin/users`; green `FeedbackBanner` "User deleted successfully." displays; deleted user is removed. | State Transition Testing | Automated (PASSED) |
| TC-04 | Negative | Verify Temp delete failure (500) closes modal and displays prominent red error banner | 1. Navigate to `/temp/:id`.<br>2. Click "Delete".<br>3. Intercept `DELETE /api/temps/{id}` with 500 error.<br>4. Click Delete in modal. | Modal closes; page remains on `/temp/:id`; red `FeedbackBanner` displays "Failed to delete temp."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-05 | Negative | Verify Client delete failure (500) closes modal and displays prominent red error banner | 1. Navigate to `/client/:id`.<br>2. Click "Delete".<br>3. Intercept `DELETE /api/clients/{id}` with 500 error.<br>4. Click Delete in modal. | Modal closes; page remains on `/client/:id`; red `FeedbackBanner` displays "Failed to delete client."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-06 | Negative | Verify User delete failure (500) closes modal and displays prominent red error banner | 1. Navigate to `/admin/users/:id`.<br>2. Click "Delete".<br>3. Intercept `DELETE /api/admin/users/{id}` with 500 error.<br>4. Click Delete in modal. | Modal closes; page remains on `/admin/users/:id`; red `FeedbackBanner` displays "Failed to delete user."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-07 | Negative | Verify User self-deletion prevention (400 Bad Request) displays error banner | 1. Navigate to logged-in admin user profile.<br>2. Click "Delete".<br>3. Confirm in modal. | Modal closes; red `FeedbackBanner` displays "You cannot delete your own account."; user is not deleted. | Boundary Value Analysis | Automated (PASSED) |
| TC-08 | Negative | Verify Temp delete 404 Not Found displays error banner | 1. Open `/temp/:id`.<br>2. Intercept `DELETE /api/temps/{id}` with 404.<br>3. Confirm delete in modal. | Modal closes; red `FeedbackBanner` displays error message indicating temp not found. | Negative & Error Handling | Automated (PASSED) |
| TC-09 | Negative | Verify Client delete 404 Not Found displays error banner | 1. Open `/client/:id`.<br>2. Intercept `DELETE /api/clients/{id}` with 404.<br>3. Confirm delete in modal. | Modal closes; red `FeedbackBanner` displays error message indicating client not found. | Negative & Error Handling | Automated (PASSED) |
| TC-10 | State Transition | Verify cancelling Temp delete modal dismisses modal without deleting | 1. Open `/temp/:id`.<br>2. Click "Delete".<br>3. Click "Cancel" in modal. | Modal closes; no API request made; temp remains intact on `/temp/:id`. | State Transition Testing | Automated (PASSED) |
| TC-11 | State Transition | Verify cancelling Client delete modal dismisses modal without deleting | 1. Open `/client/:id`.<br>2. Click "Delete".<br>3. Click "Cancel" in modal. | Modal closes; no API request made; client remains intact on `/client/:id`. | State Transition Testing | Automated (PASSED) |
| TC-12 | State Transition | Verify cancelling User delete modal dismisses modal without deleting | 1. Open `/admin/users/:id`.<br>2. Click "Delete".<br>3. Click "Cancel" in modal. | Modal closes; no API request made; user remains intact on `/admin/users/:id`. | State Transition Testing | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Seeded Temp records (ID and name)
- Seeded Client records (ID and name)
- Seeded User records (ID, username, and role)
- Mock error responses (500 Internal Server Error, 404 Not Found)

### Implementation & Layered Architecture
- **Spec:** `tests/deleteConfirmationFeedback.spec.ts`
- **Page Objects:** `pages/TempDetailPage.ts`, `pages/ClientDetailPage.ts`, `pages/UserDetailPage.ts`, `pages/TempPage.ts`, `pages/ClientPage.ts`, `pages/UserManagerPage.ts`
- **Fixtures:** `authenticatedTempDetailPage`, `authenticatedClientDetailPage`, `authenticatedUserDetailPage`, `authenticatedTempPage`, `authenticatedClientPage`, `authenticatedUserManagerPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/deleteConfirmationData.ts`, `test-data/userDetailData.ts`

### Verification
- **Execution Command:** `npx playwright test tests/deleteConfirmationFeedback.spec.ts`
- **Result:** 12 passed (100% pass rate)
