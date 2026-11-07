# Test Plan: CTMQ-50 - Implement Order Types management under Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-62)
**Status:** Automated & Verified (16/16 Passed - 100%)

### Summary & Objectives
Validate the end-to-end functionality of Order Types management under Admin General Settings (`/admin/order-types`). Verify navigation from the Admin landing page (`/admin`) General Settings card to `/admin/order-types`, preserving AppShell navigation with active Admin tab and AdminSubNav. Validate page structure including centered "+ Add Order Type" button, category sub-tabs ("Per Diem Order Types" and "Long Term Order Types"), keyword search filtering within active tab, dynamic table column structures, status badges (Active/Hidden), and pagination controls. Validate the Add Order Type modal dialog: title ("Order Type"), dynamic form fields per active category sub-tab (Order Type Name, Shift Order Type Default dropdown for Long Term, Status selector, Default toggles), dismissal via close (X) / Cancel, client-side required field validation for empty name, 409 Conflict duplicate name detection (case-insensitive) per category, 100-character name boundary, and successful creation workflows with table refresh and success FeedbackBanner. Verify route protection redirecting unauthenticated users to `/login`, and page refresh / direct navigation stability.

### Preconditions & Setup
- System running locally (`http://localhost:5173/admin/order-types` accessible)
- User is authenticated with role: Staffing Admin
- Per Diem and Long Term order types present in database or seeded

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify navigation to Order Types page from Admin General Settings card | 1. Log in as Staffing Admin.<br>2. Navigate to `/admin`.<br>3. Click "Order Types" link under General Settings card. | Browser navigates cleanly to `/admin/order-types`; page loads without errors. | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Order Types page layout, AppShell navigation, centered "+ Add Order Type" button, and default active sub-tab | 1. Navigate to `/admin/order-types`.<br>2. Inspect PrimaryNav, AdminSubNav, top controls, and sub-tabs. | AppShell renders with "Admin" primary tab active and AdminSubNav visible; centered "+ Add Order Type" button is displayed; "Per Diem Order Types" tab is active by default. | Equivalence Partitioning | Automated (PASSED) |
| TC-03 | Positive | Verify Per Diem Order Types table headers, columns, status badges, and default indicators | 1. On "Per Diem Order Types" tab, inspect table headers and rows. | Table renders columns: "#", "Order Type Name", "Status", and "Order Form Default". Status displays Active (green) or Hidden (gray). Default displays Yes (green) or No (neutral). | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify sub-tab switching between Per Diem Order Types and Long Term Order Types | 1. On Order Types page, click "Long Term Order Types" tab.<br>2. Observe tab state, table columns, and pagination.<br>3. Click "Per Diem Order Types" tab. | Active tab switches; table data and columns update to Long Term category; pagination resets to page 1; switching back restores Per Diem list. | State Transition Testing | Automated (PASSED) |
| TC-05 | Positive | Verify Long Term Order Types table headers, columns, status badges, and Shift Order Type Default display | 1. Switch to "Long Term Order Types" tab.<br>2. Inspect table headers and rows. | Table renders columns: "#", "Order Type Name", "Shift Order Type Default", "Status", and "LT Order Form Default". Shift Order Type Default displays mapped name or "-" / "(No order type)". | Equivalence Partitioning | Automated (PASSED) |
| TC-06 | Positive | Verify search filtering by order type name within active sub-tab and search reset | 1. Enter existing order type name in search input and click Search.<br>2. Verify filtered rows.<br>3. Clear search and submit. | Table filters dynamically to matching records within the selected tab; resets pagination to page 1; clearing search restores full category list. | Equivalence Partitioning | Automated (PASSED) |
| TC-07 | Positive | Verify pagination controls and boundary button disabled states on Order Types list | 1. Observe pagination indicator ("Page X of Y (N total)").<br>2. Click Next page button.<br>3. Click Previous page button. | Pagination divides records accurately; Previous button is disabled on page 1; Next button is disabled on last page; current page indicator updates. | Boundary Value Analysis | Automated (PASSED) |
| TC-08 | Positive | Verify Add Order Type modal display, title ("Order Type"), dynamic fields on Per Diem tab, and dismissal via Close (X) | 1. On "Per Diem Order Types" tab, click "+ Add Order Type".<br>2. Verify modal title, subtext "* indicates required field", and fields.<br>3. Click Close (X) button. | Modal opens with title "Order Type", Order Type Name *, Status (Active/Hidden, default Active), Order Form Default (Yes/No, default No); Close (X) dismisses modal without saving. | State Transition Testing | Automated (PASSED) |
| TC-09 | Positive | Verify Add Order Type modal dynamic fields on Long Term tab including Shift Order Type Default dropdown | 1. Switch to "Long Term Order Types" tab.<br>2. Click "+ Add Order Type" button.<br>3. Inspect modal fields and Shift Order Type Default dropdown options. | Modal displays Order Type Name *, Shift Order Type Default dropdown (with "(No order type)" and active Per Diem options), Status, and LT Order Form Default toggle; dismiss modal. | Equivalence Partitioning | Automated (PASSED) |
| TC-10 | Positive | Verify successful creation of Per Diem Order Type with default settings | 1. On "Per Diem Order Types" tab, open modal.<br>2. Enter unique Order Type Name.<br>3. Keep Status as "Active" and Order Form Default as "No".<br>4. Click "Save Order Type". | Modal closes; new record is created in PostgreSQL; table refreshes showing new order type with Active status and No default; success FeedbackBanner appears. | State Transition Testing | Automated (PASSED) |
| TC-11 | Positive | Verify successful creation of Per Diem Order Type with Order Form Default: Yes and Hidden status | 1. On "Per Diem Order Types" tab, open modal.<br>2. Enter unique Order Type Name.<br>3. Set Status to "Hidden" and Order Form Default to "Yes".<br>4. Click "Save Order Type". | Modal closes; record persists; table displays Hidden status (gray) and Yes default (green); success FeedbackBanner is displayed. | Equivalence Partitioning | Automated (PASSED) |
| TC-12 | Positive | Verify successful creation of Long Term Order Type with Shift Order Type Default mapping | 1. On "Long Term Order Types" tab, open modal.<br>2. Enter unique Order Type Name.<br>3. Select an available Shift Order Type Default option.<br>4. Set Status to "Active" and LT Order Form Default to "No".<br>5. Click "Save Order Type". | Modal closes; new Long Term order type persists; table refreshes showing mapped Shift Order Type Default and Active status; success FeedbackBanner appears. | State Transition Testing | Automated (PASSED) |
| TC-13 | Negative | Verify client-side required field validation when submitting empty Order Type Name | 1. Open Add Order Type modal.<br>2. Leave Order Type Name blank.<br>3. Click "Save Order Type". | Submission is blocked; client-side validation error is displayed; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-14 | Negative | Verify 409 Conflict duplicate order type name validation within same category (case-insensitive) | 1. Open Add Order Type modal.<br>2. Enter an existing order type name under current category.<br>3. Click "Save Order Type". | API returns 409 Conflict; inline error is clearly displayed in modal indicating duplicate name; modal remains open. | Error Guessing / Negative | Automated (PASSED) |
| TC-15 | Negative | Verify unauthenticated access protection redirects `/admin/order-types` to `/login` | 1. Clear session/auth tokens or open unauthenticated context.<br>2. Directly navigate to `/admin/order-types`. | Access is blocked; user is redirected to `/login`; administrative order types data is not rendered. | Security / Negative Testing | Automated (PASSED) |
| TC-16 | Edge | Verify Order Type Name max length boundary (100 characters) and direct URL / page refresh stability | 1. Open modal and enter a 100-character valid string in Order Type Name and save.<br>2. Directly reload `/admin/order-types` and test browser back/forward. | 100-character order type name persists successfully; direct URL navigation and page refresh maintain AppShell and table state without errors. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Route: `/admin/order-types`
- New Per Diem Order Type Names: Unique test strings (e.g., `PD-QA-1`, `PD-Custom-QA-1`)
- New Long Term Order Type Names: Unique test strings (e.g., `LT-QA-1`)
- Duplicate Order Type Name for 409 check (e.g., existing Per Diem / Long Term name)
- 100-character boundary name string

### Implementation & Layered Architecture
- **Spec:** `tests/orderTypes.spec.ts`
- **Page Object:** `pages/OrderTypesPage.ts`
- **Fixtures:** `orderTypesPage`, `authenticatedOrderTypesPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/orderTypesData.ts`

### Verification
- **Command:** `npx playwright test tests/orderTypes.spec.ts`
- **Result:** 16 passed (9.2s) - 100% Pass Rate
