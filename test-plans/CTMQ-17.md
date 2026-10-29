# Test Plan: CTMQ-17 - Add Client tab and + Add Client button
**Jira Sub-task:** [QA Testing Antigravity](CTMQ-40)
**Status:** Automated

### Summary & Objectives
Verify the addition of the primary navigation tab 'Client' next to 'Temp', navigating to a dedicated placeholder page with active tab indication, and the inclusion of a visual-only '+ Add Client' button matching the existing '+ Add Temp' button design and positioning. Ensure existing navigation, authentication, and core application features remain intact.

### Preconditions & Setup
- User is authenticated with Staffing Admin role.
- User is on the application dashboard/home page.

### Test Scenarios

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify Primary Navigation tab order and presence | 1. Log in as Staffing Admin.<br>2. Observe the main navigation bar. | Navigation tabs are displayed in exact order: Home \| Temp \| Client \| Admin. | Equivalence Partitioning | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-02 | Positive | Verify navigation to Client page and active tab indicator | 1. Click on the 'Client' tab in navigation.<br>2. Check URL route and tab styling. | URL navigates to dedicated Client route, Client placeholder page renders, and Client tab has active styling. | State Transition Testing | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-03 | Positive | Verify '+ Add Client' button rendering and visual styling | 1. Navigate to Client page.<br>2. Inspect '+ Add Client' button appearance and placement. | Button is positioned consistently near the top, featuring blue background, white text, plus icon, rounded corners matching '+ Add Temp'. | Equivalence Partitioning | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-04 | Positive | Verify '+ Add Client' button interaction | 1. On Client page, click '+ Add Client' button.<br>2. Observe application response. | Clicking button transitions cleanly to the client creation form. | Exploratory / Behavior Verification | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-05 | Positive | Verify header components remain intact on Client page | 1. On Client page, verify logo, signed-in username, Logout button, and Admin submenu. | All standard header components are visible, properly positioned, and functional. | Regression Testing | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-06 | Negative | Verify unauthenticated route access protection | 1. Log out or open incognito window.<br>2. Attempt direct navigation to Client page URL. | Direct access is blocked and user is redirected to Login page. | Negative / Security Testing | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-07 | Edge | Verify responsive layout on mobile/tablet viewports | 1. Resize viewport to tablet (768px) and mobile (375px).<br>2. Check Client tab and button layout. | Layout conforms responsively without horizontal overflow or clipped buttons. | Boundary Value Analysis | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |
| TC-08 | Positive | Verify switching between navigation tabs | 1. Click Home -> Temp -> Client -> Admin -> Client.<br>2. Verify active states. | Active tab state transitions cleanly across all navigation items. | State Transition Testing | Automated ([`clientNavigation.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientNavigation.spec.ts)) |

### Required Test Data
- Valid Staffing Admin credentials
- Viewport dimensions: Desktop (1280x720), Tablet (768x1024), Mobile (375x667)

### Automation Implementation
- **Test Spec:** `tests/clientNavigation.spec.ts`
- **Page Objects:** `pages/NavigationPage.ts`, `pages/ClientPage.ts`
- **Fixtures:** `fixtures/customFixtures.ts`
- **Test Data:** `test-data/clientNavData.ts`
- **Test Execution:** 8 passed / 0 failed (100% pass rate)
