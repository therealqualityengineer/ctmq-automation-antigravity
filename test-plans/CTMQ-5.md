# Test Plan: CTMQ-5 - Add and style the + Add User button
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-33)
**Status:** Automated & Verified (14 / 14 Passed - 100%)

### Summary & Objectives
Add and verify the `+ Add User` button on the Admin → User Manager page (`/admin/users`), adhering strictly to the visual specifications, centered layout placement above the User Manager heading, Tailwind styling (blue background, rounded corners, white text with plus icon, hover state), responsive behavior across mobile and desktop viewports, and zero regression to existing navigation, search, pagination, and user edit flows.

### Preconditions & Setup
- Local test environment running frontend and backend services (e.g., `http://localhost:5173`).
- Seed accounts: Active Staffing Admin user (`qaengineer`).
- Authenticated session for Admin pages; unauthenticated state for route protection tests.
- Navigated to Admin → User Manager (`/admin/users`).

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | `+ Add User` button visibility and location on User Manager page | 1. Log in as Staffing Admin.<br>2. Navigate to Admin → User Manager (`/admin/users`).<br>3. Inspect the placement of the `+ Add User` button. | Button is visible, horizontally centered in its own row above the "User Manager" heading, search controls, and table. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Button icon and text content verification | 1. Navigate to `/admin/users`.<br>2. Inspect the content of the `+ Add User` button. | Button contains an SVG plus icon with `aria-hidden="true"` on the left, followed by the text "Add User", aligned with comfortable spacing. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Button visual styling and theme adherence | 1. Navigate to `/admin/users`.<br>2. Inspect computed CSS / Tailwind classes of the button. | Button has blue background (`bg-blue-600`), white text/icon, rounded corners (`rounded-lg`), padding `px-4 py-2`, font semibold (`text-sm font-semibold`), and subtle shadow (`shadow-sm`). | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Button hover state styling | 1. Navigate to `/admin/users`.<br>2. Hover mouse pointer over the `+ Add User` button.<br>3. Move mouse pointer away. | Background smoothly transitions to darker blue (`bg-blue-700`) on hover and reverts to `bg-blue-600` on mouse leave. Text and icon remain white. | State Transition Testing | Automated (PASSED) |
| TC-05 | Positive | Keyboard navigation and accessibility | 1. Navigate to `/admin/users`.<br>2. Press `Tab` through navigation elements until reaching page content.<br>3. Inspect accessible name and focus indicator. | The button is the first focusable element in page content (accessible name "Add User"). Pressing Tab advances focus sequentially. | State Transition Testing | Automated (PASSED) |
| TC-06 | Negative | Route protection redirects unauthenticated users | 1. Log out or start unauthenticated session.<br>2. Attempt direct navigation to `/admin/users`. | Access is denied; browser redirects to `/login`; User Manager page and `+ Add User` button are not displayed. | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Negative | Non-regression: Header, PrimaryNav, and AdminSubNav integrity | 1. Navigate to `/admin/users`.<br>2. Verify header logo, user name, and logout button.<br>3. Verify PrimaryNav items (Home, Temp, Client, Admin) and Admin submenu (User Manager). | Header and navigation bars render properly without displacement or overlap; User Manager is highlighted as active submenu item. | State Transition Testing | Automated (PASSED) |
| TC-08 | Negative | Non-regression: User Manager search functionality | 1. Navigate to `/admin/users`.<br>2. Enter an existing username in the search input.<br>3. Click `Search`.<br>4. Clear search input and click `Search` again. | Search executes correctly; filtered rows match search term; resetting restores full user list; `+ Add User` button remains in place without distortion. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Negative | Non-regression: User table, row navigation & pagination | 1. Navigate to `/admin/users`.<br>2. Verify table columns (Full Name, User Name, Title, Role, Status, Modified, E-Mail).<br>3. Click a user row.<br>4. Return to `/admin/users` and test pagination. | Table renders all columns; clicking a row navigates to `/admin/users/:id`; pagination controls function normally. | Decision Table Testing | Automated (PASSED) |
| TC-10 | Negative | Non-regression: Search with no matching users | 1. Navigate to `/admin/users`.<br>2. Enter non-existent user query (e.g., `nonexistent-user-xyz`).<br>3. Click `Search`. | Table displays "No users found." message; footer indicates 0 total; `+ Add User` button remains centered and unaffected. | Negative & Error Handling | Automated (PASSED) |
| TC-11 | Edge | Responsive layout at tablet viewport (768px width) | 1. Set viewport to 768x1024.<br>2. Navigate to `/admin/users`.<br>3. Verify button placement and adjacent controls. | Button remains centered on its own row without clipping or overlapping AdminSubNav, heading, or search controls. | Boundary Value Analysis | Automated (PASSED) |
| TC-12 | Edge | Responsive layout at mobile viewport (375px width) | 1. Set viewport to 375x667.<br>2. Navigate to `/admin/users`.<br>3. Verify button placement and responsiveness. | Button remains centered above heading; text label and icon fit comfortably within viewport without horizontal layout breakage. | Boundary Value Analysis | Automated (PASSED) |
| TC-13 | Edge | Layout coexistence with feedback banner | 1. Save an edited user to trigger feedback state or navigate with success message.<br>2. Observe layout on `/admin/users`. | Feedback banner ("User saved successfully.") renders centered at the top; `+ Add User` button renders cleanly below it without overlapping. | State Transition Testing | Automated (PASSED) |
| TC-14 | Edge | Button behavior boundary isolation (no unintended mutations) | 1. Navigate to `/admin/users`.<br>2. Inspect network activity while interacting with page.<br>3. Verify button does not trigger rogue API mutations or backend errors. | Button adheres strictly to CTMQ-5 scope; no extraneous backend API calls or unhandled exceptions occur. | Error Guessing | Automated (PASSED) |

### Required Test Data
- **Staffing Admin User**: `username: process.env.Staffing_USERNAME || 'qaengineer'`, `password: process.env.Staffing_PASSWORD || 'Varshini@99'`
- **Target URL**: `/admin/users`
- **Button Label**: `Add User` (with SVG icon)
- **Styling Classes**: `bg-blue-600`, `hover:bg-blue-700`, `rounded-lg`, `px-4`, `py-2`, `text-white`
- **Viewports**: Desktop (1280x800), Tablet (768x1024), Mobile (375x667)

### Automation Implementation & Verification Summary
- **Spec File**: `tests/userManagerAddUserButton.spec.ts`
- **Page Object**: `pages/UserManagerPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/userManagerData.ts`
- **Branch**: `CTMQ-5-QA-Testing`
- **Test Results**: 14 passed / 0 failed (6.7s) - 100% Pass Rate
