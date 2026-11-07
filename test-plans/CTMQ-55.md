# Test Plan: CTMQ-55 - Implement Delete functionality with confirmation modal for Temp, Client, and User

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-69)
**Status:** Automated & Verified (15/15 Passed - 100%)

### Summary & Objectives
Validate the end-to-end Delete functionality with confirmation modal across Temp (`/temp/:id`), Client (`/client/:id`), and User (`/admin/users/:id`) detail/edit pages. Ensure that a distinct danger/red "Delete" button is visible and clicking it opens a reusable, accessible confirmation modal displaying "Are you sure? This can't be undone." with "Cancel" and "Delete" action buttons. Verify that dismissing the modal via Cancel, Close (X), or Escape key cleanly aborts deletion without executing any DELETE API calls. Verify that confirming deletion triggers the respective HTTP DELETE endpoint (`/api/temps/{id}`, `/api/clients/{id}`, `/api/admin/users/{id}`), closes the modal, navigates to the respective list page (`/temp`, `/client`, `/admin/users`), displays a green success FeedbackBanner, and permanently removes the record from both database and listing tables. Verify security and guardrails including self-delete protection (400 Bad Request: "You cannot delete your own account."), 404 error handling for non-existent records, and unauthorized access protection.

### Preconditions & Setup
- Application running locally (`http://localhost:5173`)
- User authenticated with Staffing Admin credentials
- Seeded or dynamic Temp, Client, and User test records available for deletion workflows

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify Delete button presence and danger styling on Temp, Client, and User detail pages | 1. Navigate to Temp detail (`/temp/:id`).<br>2. Navigate to Client detail (`/client/:id`).<br>3. Navigate to User detail (`/admin/users/:id`). | Distinct "Delete" button styled in danger/red (`bg-red-600`) is visible on all three detail pages. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Verify clicking Delete opens confirmation modal with prompt and action buttons | 1. Navigate to detail page of Temp, Client, or User.<br>2. Click "Delete" button.<br>3. Inspect modal heading, message, and buttons. | Modal opens with role="dialog", prompt "Are you sure? This can't be undone.", and "Cancel" and "Delete" buttons. | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Verify modal dismissal via Cancel button aborts deletion without network call | 1. On detail page, click "Delete".<br>2. When modal opens, click "Cancel" button.<br>3. Inspect modal state, URL, and network calls. | Modal dismisses/hides; URL remains on detail page; no DELETE API request is made; record remains intact. | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Verify modal dismissal via Escape key and Close (X) button aborts deletion | 1. On detail page, click "Delete".<br>2. Press Escape key or click Close (X) button.<br>3. Inspect modal state. | Modal dismisses cleanly; page stays on detail view; no DELETE request executed. | State Transition Testing | Automated (PASSED) |
| TC-05 | Positive | Verify confirming Delete for Temp record deletes record, redirects to /temp, and shows banner | 1. Create/seed a Temp record.<br>2. Navigate to `/temp/:id`.<br>3. Click "Delete" and confirm deletion in modal.<br>4. Intercept DELETE `/api/temps/:id`. | DELETE request succeeds (200 OK); user redirected to `/temp`; green FeedbackBanner displays "Temp deleted successfully."; record is not found in table. | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Verify confirming Delete for Client record deletes record, redirects to /client, and shows banner | 1. Create/seed a Client record.<br>2. Navigate to `/client/:id`.<br>3. Click "Delete" and confirm deletion in modal.<br>4. Intercept DELETE `/api/clients/:id`. | DELETE request succeeds (200 OK); user redirected to `/client`; green FeedbackBanner displays "Client deleted successfully."; record is not found in table. | Equivalence Partitioning | Automated (PASSED) |
| TC-07 | Positive | Verify confirming Delete for User record deletes record, redirects to /admin/users, and shows banner | 1. Create/seed a non-admin User record.<br>2. Navigate to `/admin/users/:id`.<br>3. Click "Delete" and confirm in modal.<br>4. Intercept DELETE `/api/admin/users/:id`. | DELETE request succeeds (200 OK); user redirected to `/admin/users`; green FeedbackBanner displays "User deleted successfully."; user is not found in User Manager list. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Negative | Verify self-deletion prevention guard (400 Bad Request) on active logged-in admin user | 1. Navigate to `/admin/users/:id` for active logged-in user.<br>2. Click "Delete" and confirm.<br>3. Intercept DELETE request. | Backend returns 400 Bad Request; modal closes; page displays error banner "You cannot delete your own account."; user not redirected. | Error Handling & Security | Automated (PASSED) |
| TC-09 | Security | Verify unauthenticated DELETE requests to /api/temps, /api/clients, /api/admin/users are rejected with 401 | 1. Issue DELETE requests to the three endpoints without authentication cookie/token. | Requests are rejected with 401 Unauthorized. | Security Testing | Automated (PASSED) |
| TC-10 | Edge | Verify confirmation modal accessibility attributes (role="dialog", aria-modal="true") | 1. Open delete modal on detail page.<br>2. Inspect DOM attributes of modal container. | Modal has role="dialog", aria-modal="true". | Boundary Value Analysis | Automated (PASSED) |
| TC-11 | Negative | Verify Temp delete failure (500) closes modal and displays prominent red error banner | 1. Intercept `DELETE /api/temps/{id}` with 500 error.<br>2. Click Delete in modal. | Modal closes; page remains on `/temp/:id`; red FeedbackBanner displays "Failed to delete temp."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-12 | Negative | Verify Client delete failure (500) closes modal and displays prominent red error banner | 1. Intercept `DELETE /api/clients/{id}` with 500 error.<br>2. Click Delete in modal. | Modal closes; page remains on `/client/:id`; red FeedbackBanner displays "Failed to delete client."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-13 | Negative | Verify User delete failure (500) closes modal and displays prominent red error banner | 1. Intercept `DELETE /api/admin/users/{id}` with 500 error.<br>2. Click Delete in modal. | Modal closes; page remains on `/admin/users/:id`; red FeedbackBanner displays "Failed to delete user."; record is not deleted. | Negative & Error Handling | Automated (PASSED) |
| TC-14 | Negative | Verify Temp delete 404 Not Found displays error banner | 1. Open `/temp/:id`.<br>2. Intercept `DELETE /api/temps/{id}` with 404.<br>3. Confirm delete in modal. | Modal closes; red FeedbackBanner displays error message indicating temp not found. | Negative & Error Handling | Automated (PASSED) |
| TC-15 | Negative | Verify Client delete 404 Not Found displays error banner | 1. Open `/client/:id`.<br>2. Intercept `DELETE /api/clients/{id}` with 404.<br>3. Confirm delete in modal. | Modal closes; red FeedbackBanner displays error message indicating client not found. | Negative & Error Handling | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Dynamically created Temp record payload (`deleteConfirmationData.generateTemp`)
- Dynamically created Client record payload (`deleteConfirmationData.generateClient`)
- Dynamically created User record payload (`deleteConfirmationData.generateUser`)
- Logged-in admin account credentials & ID

### Implementation & Layered Architecture
- **Spec:** `tests/deleteConfirmationFeedback.spec.ts`
- **Page Objects:** `pages/TempDetailPage.ts`, `pages/ClientDetailPage.ts`, `pages/UserDetailPage.ts`, `pages/TempPage.ts`, `pages/ClientPage.ts`, `pages/UserManagerPage.ts`
- **Fixtures:** `authenticatedTempDetailPage`, `authenticatedClientDetailPage`, `authenticatedUserDetailPage`, `authenticatedTempPage`, `authenticatedClientPage`, `authenticatedUserManagerPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/deleteConfirmationData.ts`, `test-data/userDetailData.ts`

### Verification
- **Execution Command:** `npx playwright test tests/deleteConfirmationFeedback.spec.ts`
- **Result:** 15 passed (100% pass rate)
