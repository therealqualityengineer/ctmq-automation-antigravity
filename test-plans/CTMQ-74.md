# Test Plan: CTMQ-74 - [Admin] Missing page heading/title on Shifts, Order Types, and Status Options pages

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-76)
**Status:** Automated & Verified (12/12 Passed - 100%)

### Summary & Objectives
Validate the implementation and consistent visual rendering of top-level page headings (`<h1>`) across the Admin General Settings module: Shifts (`/admin/shifts`), Order Types (`/admin/order-types`), and Status Options (`/admin/status-options`). Ensure that each page renders a prominent, semantically correct title matching the typography, styling (`text-xl font-semibold text-slate-900`), and layout hierarchy of reference pages (`/admin/specialties` and `/admin/certifications`), maintaining responsive layout integrity, tab persistence, and access control.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated with role: Admin / QA Engineer (`qaengineer`)
- Target Admin Master routes:
  - `/admin/shifts`
  - `/admin/order-types`
  - `/admin/status-options`
- Reference Admin Master routes:
  - `/admin/specialties`
  - `/admin/certifications`

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify presence and text content of page heading on Shifts page | 1. Log in as Admin (`qaengineer`).<br>2. Navigate to `/admin/shifts`.<br>3. Inspect the primary page heading element. | An `<h1>` heading with text "Shifts" (or "Shift Options") is visibly rendered. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Verify presence and text content of page heading on Order Types page | 1. Log in as Admin (`qaengineer`).<br>2. Navigate to `/admin/order-types`.<br>3. Inspect the primary page heading element. | An `<h1>` heading with text "Order Types" is visibly rendered. | Equivalence Partitioning |
| TC-03 | Positive | Verify presence and text content of page heading on Status Options page | 1. Log in as Admin (`qaengineer`).<br>2. Navigate to `/admin/status-options`.<br>3. Inspect the primary page heading element. | An `<h1>` heading with text "Status Options" is visibly rendered. | Equivalence Partitioning |
| TC-04 | Positive | Verify typography and styling consistency with reference admin pages | 1. Navigate to `/admin/specialties` and record heading styling attributes (`text-xl`, `font-semibold`, `text-slate-900`).<br>2. Navigate to `/admin/shifts`, `/admin/order-types`, and `/admin/status-options`.<br>3. Compare heading font size, weight, and color against reference. | All three target pages exhibit identical typography and styling matching Specialties and Certifications. | UI Consistency / Visual Testing | Automated (PASSED) |
| TC-05 | Positive | Verify structural layout and placement above action controls / search bar | 1. Navigate to `/admin/shifts`.<br>2. Inspect relative positioning of heading, Add button, feedback banner, and search input. | Heading is positioned above or aligned cleanly with header controls without collision or overlapping. | Layout Inspection | Automated (PASSED) |
| TC-06 | Positive | Verify page heading persistence across category tab switching on Order Types page | 1. Navigate to `/admin/order-types`.<br>2. Switch between different category tabs (e.g., Clinical, Non-Clinical, etc.).<br>3. Verify heading visibility and text. | "Order Types" heading remains fixed, visible, and stable during and after category tab switching. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify page heading persistence across entity tab switching on Status Options page | 1. Navigate to `/admin/status-options`.<br>2. Switch between "Client" and "Temp" status option tabs.<br>3. Verify heading visibility and text. | "Status Options" heading remains fixed, visible, and stable during and after tab transitions. | State Transition Testing | Automated (PASSED) |
| TC-08 | Positive | Verify page heading persistence across browser reload and re-navigation | 1. Navigate to each target route (`/admin/shifts`, `/admin/order-types`, `/admin/status-options`).<br>2. Perform hard browser refresh.<br>3. Verify heading state. | Headings persist immediately on initial render without flashing, delays, or disappearing. | State Transition Testing | Automated (PASSED) |
| TC-09 | Negative | Verify unauthenticated access redirection and heading non-disclosure | 1. Open an unauthenticated session.<br>2. Attempt direct navigation to `/admin/shifts`, `/admin/order-types`, and `/admin/status-options`. | Access is blocked; user is redirected to `/login`, and no admin headings or content are leaked. | Security / Negative Testing | Automated (PASSED) |
| TC-10 | Negative | Verify non-admin role access restrictions | 1. Log in as a non-admin user (e.g., Recruiter / Temp / Client).<br>2. Attempt navigation to target admin routes. | User is redirected or presented with an unauthorized/forbidden access screen; admin pages/headings are inaccessible. | Authorization / Role-based Access | Automated (PASSED) |
| TC-11 | Edge | Verify responsive layout and heading positioning across viewports | 1. Navigate to target pages.<br>2. Resize viewport to Mobile (375x667), Tablet (768x1024), and Desktop (1280x800).<br>3. Verify heading placement and responsiveness. | Heading scales responsively without text truncating awkwardly, wrapping into overlapping elements, or pushing controls offscreen. | Boundary Value Analysis | Automated (PASSED) |
| TC-12 | Edge | Verify single primary semantic landmark (h1) per page for accessibility | 1. Inspect DOM structure on `/admin/shifts`, `/admin/order-types`, and `/admin/status-options`.<br>2. Count level-1 headings (`<h1>` / `role="heading"` level 1). | Each page contains exactly one primary `<h1>` heading ensuring accessibility standard compliance (WCAG 2.1 Info & Relationships). | Accessibility / Semantic Structure | Automated (PASSED) |

### Required Test Data
- Admin credentials (`qaengineer` / valid password)
- Non-admin test credentials (unauthorized role test)
- Target routes: `/admin/shifts`, `/admin/order-types`, `/admin/status-options`
- Reference routes: `/admin/specialties`, `/admin/certifications`
- Expected heading text strings: `"Shifts"` (or `"Shift Options"`), `"Order Types"`, `"Status Options"`, `"Specialties"`, `"Certifications"`
- Responsive viewport dimensions: Mobile (`375x667`), Tablet (`768x1024`), Desktop (`1280x800`)

### Implementation & Layered Architecture
- **Spec:** [`tests/adminPageHeadings.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminPageHeadings.spec.ts)
- **Page Objects:**
  - [`pages/BasePage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/BasePage.ts) (`getElementTagName`, `getElementClassName`, `getElementComputedStyles`, `getElementBoundingBox`, `getHeadingCount`)
  - [`pages/ShiftsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/ShiftsPage.ts) (`heading`, `getHeadingText`)
  - [`pages/OrderTypesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/OrderTypesPage.ts) (`heading`, `getHeadingText`, `clickLongTermTab`, `clickPerDiemTab`)
  - [`pages/StatusOptionsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/StatusOptionsPage.ts) (`heading`, `getHeadingText`, `switchToTempTab`, `switchToClientTab`)
  - [`pages/SpecialtiesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/SpecialtiesPage.ts) (`heading`, `getHeadingText`)
  - [`pages/CertificationsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/CertificationsPage.ts) (`heading`, `getHeadingText`)
- **Fixtures:** `authenticatedShiftsPage`, `authenticatedOrderTypesPage`, `authenticatedStatusOptionsPage`, `shiftsPage`, `orderTypesPage`, `statusOptionsPage`, `specialtiesPage`, `certificationsPage` in [`fixtures/customFixtures.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [`test-data/adminHeadingsData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminHeadingsData.ts)

### Verification
- **Execution Command:** `npx playwright test tests/adminPageHeadings.spec.ts`
- **Result:** 12 passed (7.0s) - 100% Pass Rate
