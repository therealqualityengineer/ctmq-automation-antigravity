# Test Plan: CTMQ-7 - Add Temp tab between Home and Admin
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-35)
**Status:** Automated & Verified (12 / 12 Passed - 100%)

### Summary & Objectives
Verify the addition of the "Temp" tab to CTMQ's authenticated primary horizontal navigation, positioned strictly between "Home" and "Admin". Ensure the tab follows React Router navigation conventions, routes to a minimal placeholder page inside the existing AppShell, displays active tab styling when selected, and preserves all existing navigation (Home, Admin, User Manager), header elements, logo, and session/logout behavior without regression or introduction of unapproved UI elements.

### Preconditions & Setup
- Deployed or local CTMQ application running frontend and backend services.
- Authenticated session with a valid user (e.g. Staffing Admin).
- Unauthenticated browser session for access control verification.

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Primary navigation tab order and visibility | 1. Log in to CTMQ.<br>2. Inspect the top primary navigation bar. | Navigation bar displays tabs horizontally in the exact order: **Home \| Temp \| Admin**. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Temp tab navigation to minimal placeholder | 1. Click the "Temp" tab in the primary navigation. | Browser navigates to the Temp route (e.g. `/temp`); displays minimal placeholder heading/message within AppShell. | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Active tab visual styling on Temp tab | 1. Navigate to the Temp placeholder page.<br>2. Inspect tab styling. | Temp tab displays active/selected styling matching Home and Admin active states; Home and Admin tabs show inactive state. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Non-regression: Home tab navigation | 1. From the Temp page, click the "Home" tab. | Browser navigates to `/`; Home page content renders; Home tab shows active styling. | State Transition Testing | Automated (PASSED) |
| TC-05 | Positive | Non-regression: Admin tab and User Manager navigation | 1. From the Temp page, click "Admin" (or Admin → User Manager). | Browser navigates to User Manager (`/admin/users`); Admin tab displays active styling; User Manager workflows function unchanged. | State Transition Testing | Automated (PASSED) |
| TC-06 | Positive | Header and AppShell layout preservation | 1. Navigate to Temp placeholder page.<br>2. Inspect header elements. | CTMQ header, logo, authenticated user identity display, and Logout action remain intact; no left sidebar is introduced. | Equivalence Partitioning | Automated (PASSED) |
| TC-07 | Negative | Route protection for unauthenticated access | 1. In an unauthenticated session, navigate directly to Temp route. | User is redirected to `/login` with return URL; Temp page is not accessible. | Boundary Value Analysis | Automated (PASSED) |
| TC-08 | Negative | Exclusion of unauthorized sidebar navigation | 1. Inspect Temp placeholder page elements. | No left sidebar navigation or unauthorized controls are rendered. | Error Guessing | Automated (PASSED) |
| TC-09 | Positive | Direct URL deep linking for authenticated user | 1. In an authenticated session, enter Temp route URL directly in browser address bar. | Temp placeholder page loads directly with Temp tab active in the primary navigation. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Edge | Viewport responsiveness and layout integrity | 1. Resize viewport across supported desktop, tablet, and mobile widths. | Navigation bar and Temp placeholder remain usable and properly aligned without overlapping, horizontal clipping, or layout breaks. | Boundary Value Analysis | Automated (PASSED) |
| TC-11 | Edge | Session logout from Temp page | 1. On Temp placeholder page, click Logout. | Session is terminated; user is redirected to `/login`; attempting to navigate back via browser does not restore authenticated state. | State Transition Testing | Automated (PASSED) |
| TC-12 | Edge | Browser Back and Forward navigation | 1. Navigate Home → Temp → Admin.<br>2. Click browser Back button.<br>3. Click browser Forward button. | Browser Back returns to Temp page with Temp tab active; Forward returns to Admin page with Admin tab active; URL and UI state remain synchronized. | State Transition Testing | Automated (PASSED) |

### Required Test Data
- **Authenticated User**: Valid Staffing Admin credentials (`qaengineer`).
- **Target Route**: `/temp`.
- **Navigation Order**: `["Home", "Temp", "Admin"]`.

### Automation Implementation & Verification Summary
- **Spec File**: `tests/tempNavigation.spec.ts`
- **Page Objects**: `pages/NavigationPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/tempNavData.ts`
- **Branch**: `CTMQ7-&-9`
- **Test Results**: 12 passed / 0 failed (3.6s) - 100% Pass Rate
