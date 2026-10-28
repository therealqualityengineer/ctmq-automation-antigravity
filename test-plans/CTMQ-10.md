# Test Plan: CTMQ-10 - Make the CTMQ application full-width across all pages
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-37)
**Status:** Automated & Verified (18 / 18 Passed - 100%)

### Summary & Objectives
Verify that the CTMQ application utilizes the full available browser viewport across all existing and future pages (Home, Temp, Admin / User Manager, Add User, Edit User, Add Temp), removing narrow centered column wrappers and arbitrary max-width constraints (such as 896px capping). Ensure that the top navigation header aligns the logo and main navigation tabs to the far left, while positioning the user profile and logout actions at the far right. Validate that lists, tables, forms, and secondary navigation (Admin -> User Manager) span the available viewport width smoothly and adapt responsively across multiple screen sizes (ultrawide, standard desktop, tablet, and mobile) without horizontal overflow or clipped data columns.

### Preconditions & Setup
- Deployed or local CTMQ application running frontend and backend services.
- Active Staffing Admin user account credentials.
- Test browser supporting multiple viewport dimensions (Playwright / Chromium).
- Pre-seeded users and temp records to validate full-width data tables and lists.

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Header Layout: Left-aligned logo and primary navigation tabs | 1. Log in as Staffing Admin.<br>2. Inspect the top application header. | CTMQ logo and primary tabs (Home, Temp, Admin) are positioned flush to the left of the header with consistent padding. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Header Layout: Right-aligned user profile and Logout action | 1. Log in as Staffing Admin.<br>2. Inspect the right side of the header. | The logged-in user name and Logout action button are aligned flush to the right side of the header. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Home Page full-width viewport utilization | 1. Navigate to Home page (`/`).<br>2. Inspect container widths and margins. | Page content spans full viewport width; no artificial max-width constraints (e.g., 896px/1024px) or excessive empty lateral margins are applied. | Boundary Value Analysis | Automated (PASSED) |
| TC-04 | Positive | Temp Page and records table full-width expansion | 1. Navigate to Temp module (`/temp`).<br>2. Inspect table container and grid width. | Temp records table and action bars expand across the full available content width. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Admin / User Manager table full-width expansion | 1. Navigate to Admin / User Manager (`/admin/users`).<br>2. Inspect User Manager table and search/filter bar. | User list table, search bar, and action controls span the full viewport width with uniform page padding. | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Add / Edit User forms full-width container expansion | 1. Navigate to Add User (`/admin/users/new`) and Edit User (`/admin/users/:id/edit`).<br>2. Inspect form wrapper width. | Form containers span full width of available content area without being capped at 896px (preventing CTMQ-27 regression). | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Positive | Add / Edit Temp forms full-width container layout | 1. Navigate to Add Temp (`/temp/new`).<br>2. Inspect two-box form layout and container. | Form sections utilize the full available width with consistent padding and spacing. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Admin secondary navigation / submenu behavior | 1. Navigate to Admin module.<br>2. Verify User Manager submenu tab appearance and behavior. | Admin secondary navigation persists, renders consistently across the full-width layout, and navigates correctly. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Tab navigation and active state retention | 1. Switch between Home, Temp, and Admin tabs.<br>2. Verify layout transitions and active indicators. | Full-width shell remains intact across navigation; active tab styles reflect current location accurately. | State Transition Testing | Automated (PASSED) |
| TC-10 | Positive | User logout execution from full-width header | 1. Click Logout in the top-right header.<br>2. Verify authentication state and redirect. | User session is terminated; application redirects to `/login`. | State Transition Testing | Automated (PASSED) |
| TC-11 | Negative | Absence of hardcoded max-width constraint on wide screens | 1. Load application on standard desktop (1440x900) and ultrawide (1920x1080+).<br>2. Check main content container computed width. | Content container computed width exceeds 1200px and matches viewport width minus standard padding (no `max-w-4xl` or `max-w-5xl` constraint). | Boundary Value Analysis | Automated (PASSED) |
| TC-12 | Negative | Absence of horizontal overflow on standard desktop viewports | 1. Navigate across Home, Temp, Admin, and Form pages at 1280px, 1440px, and 1920px widths.<br>2. Inspect body `scrollWidth` vs `clientWidth`. | `document.body.scrollWidth` equals `document.body.clientWidth`; no unexpected horizontal scrollbar appears. | Boundary Value Analysis | Automated (PASSED) |
| TC-13 | Negative | Unauthenticated login view layout isolation | 1. Log out or open an unauthenticated session.<br>2. Navigate to `/login`. | Login page renders appropriate centered authentication card without exposing full-width authenticated shell controls. | Equivalence Partitioning | Automated (PASSED) |
| TC-14 | Edge | Responsive layout adaptation at Tablet viewport (768px) | 1. Set viewport to 768x1024.<br>2. Inspect header, navigation tabs, and content area. | Header and content adapt gracefully; elements wrap or scale cleanly without horizontal clipping or broken layouts. | Boundary Value Analysis | Automated (PASSED) |
| TC-15 | Edge | Responsive layout adaptation at Mobile viewport (375px) | 1. Set viewport to 375x667.<br>2. Inspect header controls, logo, user info, and main content. | Header controls remain accessible without overlapping or unintended overflow. | Boundary Value Analysis | Automated (PASSED) |
| TC-16 | Edge | Table responsiveness and column access at narrow viewports | 1. Set viewport to narrow width (e.g. 768px / 600px).<br>2. Inspect User Manager and Temp data tables. | Tables accommodate smaller widths via horizontal scrolling within the table wrapper or responsive wrapping, without clipping columns off-screen (preventing CTMQ-31 regression). | Boundary Value Analysis | Automated (PASSED) |
| TC-17 | Edge | Ultrawide screen layout scaling (2560x1440) | 1. Set viewport to 2560x1440.<br>2. Verify alignment of header and content elements. | Header elements remain anchored to extremes (logo/nav left, user/logout right); tables and content stretch fluidly without visual anomalies. | Boundary Value Analysis | Automated (PASSED) |
| TC-18 | Edge | Dynamic viewport resizing responsiveness | 1. Start at 1920px width.<br>2. Dynamically resize window down to 375px and back up to 1920px.<br>3. Verify layout stability. | Fluid layout responds in real time without getting stuck in intermediate broken layouts. | State Transition Testing | Automated (PASSED) |

### Required Test Data
- **Staffing Admin Account**: Valid credentials (`qaengineer` / active admin role).
- **Test Viewports**:
  - Ultrawide: 2560 x 1440
  - Desktop Standard: 1920 x 1080, 1440 x 900, 1280 x 720
  - Tablet: 768 x 1024
  - Mobile: 375 x 667
- **Module Routes**:
  - Home: `/`
  - Temp: `/temp`
  - Add Temp: `/temp/new`
  - Admin / Users: `/admin/users`
  - Add User: `/admin/users/new`

### Automation Implementation & Verification Summary
- **Spec File**: `tests/layoutFullWidth.spec.ts`
- **Page Objects**: `pages/LayoutPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/layoutData.ts`
- **Branch**: `CTMQ-10-QA-Testing`
- **Test Results**: 18 passed / 0 failed (4.4s) - 100% Pass Rate
