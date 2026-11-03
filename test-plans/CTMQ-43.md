# Test Plan: CTMQ-43 - Introduce Admin landing page and route User Manager through Admin sub-navigation

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-44)
**Status:** Automated & Verified (10/10 Passed - 100%)

### Summary & Objectives
Verify the introduction of the dedicated Admin landing page (`/admin`) and the routing of User Manager functionality through a horizontal Admin sub-navigation bar (`AdminSubNav`). Ensure that clicking the top-level Admin navigation tab routes to `/admin` instead of directly to `/admin/users`, that the Admin sub-navigation displays the "User Manager" sub-tab across all admin routes, that active link styling accurately reflects current location across both primary and sub-navigation levels, and that all existing user management features (user search, list, creation, editing, self-deactivation guard, feedback banners) remain fully intact.

### Preconditions & Setup
- System running locally at `http://localhost:5173/`
- User is authenticated with role: Staffing Admin
- User is on the application dashboard or logged in

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify top-level Admin primary nav navigates to /admin landing page | 1. Log in as Staffing Admin.<br>2. Click on 'Admin' in the primary navigation bar. | URL changes to `/admin`. Admin landing page is rendered inside authenticated `AppShell`. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Admin landing page shell and content rendering | 1. Navigate to `/admin`.<br>2. Observe page layout and content. | Authenticated `AppShell` renders with Header, PrimaryNav, and AdminSubNav. Content area is cleanly rendered without errors or broken components. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify Admin sub-navigation bar renders across all admin routes | 1. Navigate to `/admin`.<br>2. Navigate to `/admin/users`.<br>3. Navigate to `/admin/users/new`. | Horizontal `AdminSubNav` renders below `PrimaryNav` on `/admin` and all child routes, displaying the 'User Manager' sub-tab. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify clicking User Manager sub-tab navigates to /admin/users | 1. From `/admin`, click 'User Manager' in `AdminSubNav`. | URL updates to `/admin/users`. User Manager page renders with user list, search bar, and Add User button. | State Transition Testing | Automated (PASSED) |
| TC-05 | Positive | Verify active styling on top-level Admin tab across all admin routes | 1. Navigate to `/admin`.<br>2. Navigate to `/admin/users`.<br>3. Navigate to `/admin/users/new`.<br>4. Navigate to `/admin/users/:id`. | 'Admin' tab in `PrimaryNav` maintains active styling across all `/admin` routes and child routes. | Decision Table Testing | Automated (PASSED) |
| TC-06 | Positive | Verify active styling on User Manager sub-tab | 1. Navigate to `/admin`.<br>2. Navigate to `/admin/users`.<br>3. Navigate to `/admin/users/new`.<br>4. Navigate to `/admin/users/:id`. | 'User Manager' in `AdminSubNav` is NOT active on `/admin`, but IS active on `/admin/users`, `/admin/users/new`, and `/admin/users/:id`. | Decision Table Testing | Automated (PASSED) |
| TC-07 | Positive | Verify User Manager existing functionality preservation | 1. On `/admin/users`, perform user search.<br>2. Click 'Add User' and verify Add User form (`/admin/users/new`).<br>3. View/edit an existing user (`/admin/users/:id`).<br>4. Verify self-deactivation guard and feedback banners. | All User Manager flows, validations, and messaging remain fully operational without regression. | Regression Testing | Automated (PASSED) |
| TC-08 | Negative | Verify unauthenticated route protection for /admin and sub-routes | 1. Log out or clear authentication tokens.<br>2. Attempt direct navigation to `/admin` and `/admin/users`. | Direct access is denied; user is redirected to `/login`. | Negative / Security Testing | Automated (PASSED) |
| TC-09 | Edge | Verify direct URL navigation, browser refresh, and back/forward navigation | 1. Directly enter URL `/admin` and press Enter.<br>2. Refresh browser on `/admin` and `/admin/users`.<br>3. Click back and forward browser buttons between `/admin` and `/admin/users`. | Pages render cleanly, state is maintained, and active navigation indicators remain correct after refresh and history traversal. | State Transition Testing | Automated (PASSED) |
| TC-10 | Edge | Verify responsive layout across viewports | 1. Resize viewport to tablet (768px) and mobile (375px).<br>2. Check `PrimaryNav`, `AdminSubNav`, and content area. | Navigation and sub-navigation render responsively without clipping, overflow, or broken styling. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Viewport dimensions: Desktop (`1280x720`), Tablet (`768x1024`), Mobile (`375x667`)
- Admin URLs: `/admin`, `/admin/users`, `/admin/users/new`

### Implementation & Layered Architecture
- **Spec:** [tests/adminNavigation.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminNavigation.spec.ts)
- **Page Object:** [pages/AdminPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/AdminPage.ts), [pages/NavigationPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/NavigationPage.ts)
- **Fixtures:** `adminPage`, `authenticatedAdminPage` registered in [fixtures/customFixtures.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [test-data/adminNavData.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminNavData.ts)

### Verification
- **Command:** `npx playwright test tests/adminNavigation.spec.ts`
- **Result:** 10 passed (7.3s) - 100% Pass Rate
