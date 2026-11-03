# Test Plan: CTMQ-45 - Add General Settings section to Admin landing page

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-58)
**Status:** Automated & Verified (10/10 Passed - 100%)

### Summary & Objectives
Verify the addition of the "General Settings" card section on the left side of the Admin landing page (`/admin`). Validate card container styling (outer border, rounded corners), header banner styling (light gray background, centered uppercase "GENERAL SETTINGS" title, divider), body subsection header ("General" in bold), and the exact sequence of 5 setting items (Certifications, Specialties, Shifts, Order Types, Status Options). Verify interactive link aesthetics (blue font, pointer cursor, hover underline) and safe placeholder click behavior (no broken routes or page crashes). Validate that existing primary navigation (active Admin tab) and AdminSubNav (User Manager link) remain fully functional and intact across standard desktop and laptop viewports.

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin` accessible)
- User is authenticated with role: Staffing Admin
- User is on the application dashboard or directly accessing `/admin`

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify General Settings card container layout and placement on Admin landing page | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Inspect page body layout. | "General Settings" section is positioned in the left column/side of the page body enclosed within a bordered card container with rounded corners. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Verify General Settings card header bar styling and uppercase title | 1. Navigate to `/admin`.<br>2. Inspect the card header of the General Settings section. | Header bar has a light gray background (`bg-slate-200`), displays centered uppercase title "GENERAL SETTINGS", and is separated by a border/divider (`border-b`). | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify General subsection header in card body | 1. Navigate to `/admin`.<br>2. Inspect the content within the General Settings card body. | A bold subsection header labeled "General" is visibly rendered at the top of the card body. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify vertical sequence and text of all 5 setting items | 1. Navigate to `/admin`.<br>2. Inspect the items listed under the "General" subsection. | Exactly 5 items are displayed in vertical order:<br>1. Certifications<br>2. Specialties<br>3. Shifts<br>4. Order Types<br>5. Status Options. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify link aesthetics and interactive styling for all setting items | 1. Navigate to `/admin`.<br>2. Inspect styling and hover over each of the 5 setting items. | All 5 items are styled as interactive links with blue text (`text-blue-600`), pointer cursor on hover (`cursor-pointer`), and underline styling on hover (`hover:underline`). | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Verify safe placeholder click behavior without broken routes or unhandled errors | 1. Navigate to `/admin`.<br>2. Sequentially click each of the 5 setting placeholder links (Certifications, Specialties, Shifts, Order Types, Status Options). | Clicking placeholder links navigates cleanly to target administrative routes without 404/500 errors or unhandled exceptions; returning to `/admin` renders General Settings intact. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify Admin navigation integrity (AdminSubNav and primary Admin tab) | 1. Navigate to `/admin`.<br>2. Verify top-level PrimaryNav and horizontal AdminSubNav. | Top-level "Admin" tab remains styled as active. AdminSubNav bar remains visible displaying "User Manager" link that navigates to `/admin/users`. | State Transition Testing | Automated (PASSED) |
| TC-08 | Negative | Verify unauthenticated access protection for Admin landing page | 1. Log out or clear authentication session.<br>2. Attempt direct navigation to `/admin`. | Access is denied; user is redirected to `/login`, and General Settings card is not exposed to unauthenticated users. | Negative / Security Testing | Automated (PASSED) |
| TC-09 | Edge | Verify page refresh and direct URL navigation stability | 1. Directly navigate to `/admin` via browser address bar.<br>2. Trigger a full browser page refresh. | Page loads cleanly without layout shift or styling degradation; General Settings card, header, subsection, and items remain intact. | State Transition Testing | Automated (PASSED) |
| TC-10 | Edge | Verify responsive layout across standard screen widths | 1. Navigate to `/admin`.<br>2. Resize viewport across standard desktop (`1280px`, `1440px`) and laptop (`1024px`) screen widths. | "General Settings" card remains left-aligned and overall Admin page layout adapts cleanly without overflow or disruption to the AppShell. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin user credentials
- Target Route: `/admin`
- Setting Items List: `['Certifications', 'Specialties', 'Shifts', 'Order Types', 'Status Options']`
- Viewports: Desktop (`1280x800`, `1440x900`), Laptop (`1024x768`)

### Implementation & Layered Architecture
- **Spec:** [tests/adminGeneralSettings.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminGeneralSettings.spec.ts)
- **Page Object:** [pages/AdminPage.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/AdminPage.ts)
- **Fixtures:** `authenticatedAdminPage`, `adminPage` in [fixtures/customFixtures.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [test-data/adminGeneralSettingsData.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminGeneralSettingsData.ts)

### Verification
- **Command:** `npx playwright test tests/adminGeneralSettings.spec.ts`
- **Result:** 10 passed (6.7s) - 100% Pass Rate
