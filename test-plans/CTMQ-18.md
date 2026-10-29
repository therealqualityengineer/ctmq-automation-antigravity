# Test Plan: CTMQ-18 - Implement Client creation, listing, details, and editing
**Jira Sub-task:** [QA Testing Antigravity](CTMQ-41)
**Status:** Automated

### Summary & Objectives
Verify full end-to-end functionality for the Client module: opening the Client Create form from '+ Add Client', persisting new Client records via backend API and database, rendering Client records in the Client list table (Full Name, Email, Status columns), opening existing Client records in read-only View mode, transitioning to Edit mode with Save/Cancel behavior, and validating proper error handling and responsive layouts.

### Preconditions & Setup
- User is authenticated with Staffing Admin role.
- PostgreSQL database is initialized and running with EF Core migration applied.
- Backend API service is reachable.

### Test Scenarios

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Navigate to Client Create form | 1. Navigate to Client list page.<br>2. Click '+ Add Client' button. | Client Create form opens with two-panel layout: Left (Full Name, Email, Address, City, State, ZIP, County) and Right (Status). | State Transition Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-02 | Positive | Create new Client successfully with valid details | 1. Fill all valid fields: Full Name, Email, Address, City, State, ZIP, County, Status.<br>2. Click 'Save'. | New Client is created, saved in PostgreSQL database, success feedback is displayed, and user is redirected to Client list/details. | Equivalence Partitioning | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-03 | Positive | Verify Client listing displays persisted records in correct columns | 1. Navigate to Client page.<br>2. Observe table columns and row data. | Client list renders columns in exact order: 1. Full Name, 2. Email, 3. Status. Newly created Client is present. | Equivalence Partitioning | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-04 | Positive | Open existing Client in read-only View mode | 1. On Client list, click on a Client name/row. | Details page opens in read-only View mode showing all saved values and an 'Edit' button. | State Transition Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-05 | Positive | Edit existing Client and save changes | 1. From View mode, click 'Edit'.<br>2. Modify Full Name and Status.<br>3. Click 'Save'. | Fields become editable on clicking Edit; Save updates record in database and displays success feedback with updated values. | State Transition Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-06 | Positive | Discard edits with Cancel button | 1. From View mode, click 'Edit'.<br>2. Modify Email or Address.<br>3. Click 'Cancel'. | Changes are discarded, fields return to read-only View mode displaying previous saved values without persisting edits. | State Transition Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-07 | Positive | Cancel Client creation | 1. Click '+ Add Client'.<br>2. Populate fields.<br>3. Click 'Cancel'. | Form closes and returns to Client list; no new record is created. | State Transition Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-08 | Positive | Verify ZIP code to County lookup / State dropdown integration | 1. On Client form, select State.<br>2. Enter a valid ZIP code. | ZIP-to-county logic behaves consistently with Temp module; county is mapped/suggested without error. | Decision Table Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-09 | Negative | Validate required fields on Create form | 1. Open Create form.<br>2. Leave required fields blank (e.g., Full Name, Email).<br>3. Click 'Save'. | Form displays clear validation error messages; submission is blocked. | Error Guessing / Negative Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-10 | Negative | Validate invalid email format | 1. Open Create form.<br>2. Enter invalid email (e.g., 'invalid-email', 'user@').<br>3. Click 'Save'. | Proper email validation error is displayed; submission is prevented. | Boundary Value Analysis | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-11 | Negative | Handle backend API failure during save | 1. Simulate API failure (network error / 500 status).<br>2. Click 'Save'. | Appropriate error banner or message is displayed; application does not crash. | Negative Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-12 | Negative | Direct unauthenticated API requests rejected | 1. Send unauthenticated GET/POST requests to `/api/clients`. | Endpoint returns 401 Unauthorized status. | Negative / Security Testing | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-13 | Edge | Verify Client list Empty State UI | 1. Navigate to Client list when no client records exist in the database. | Clean empty state message is displayed with '+ Add Client' action accessible. | Boundary Value Analysis | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-14 | Edge | Boundary length testing for text input fields | 1. Enter max allowed characters for Full Name, Address, and City.<br>2. Enter 5-digit and 9-digit (ZIP+4) codes. | Inputs handle boundary lengths cleanly without truncation errors or UI overflow. | Boundary Value Analysis | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-15 | Edge | Client list search filtering and pagination | 1. With multiple client records, type query into search bar.<br>2. Test pagination controls. | List filters accurately matching query; pagination advances correctly. | Equivalence Partitioning | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |
| TC-16 | Edge | Responsive layout check for list and two-panel form | 1. View Client list and Details form on mobile (375px) and tablet (768px). | Elements wrap cleanly, two-panel layout stacks gracefully, full width utilized. | Boundary Value Analysis | Automated ([`clientManagement.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/clientManagement.spec.ts)) |

### Required Test Data
- Valid Client payload: Full Name ("Acme Corp"), Email ("contact@acme.com"), Address ("123 Business Way"), City ("Metropolis"), State ("NY"), ZIP ("10001"), County ("New York"), Status ("Active")
- Invalid Client payloads: Blank fields, invalid email strings ("notanemail", "test@")
- Boundary strings: Max length strings, special character names

### Automation Implementation
- **Test Spec:** `tests/clientManagement.spec.ts`
- **Page Objects:** `pages/ClientPage.ts`, `pages/ClientDetailPage.ts`
- **Fixtures:** `fixtures/customFixtures.ts`
- **Test Data:** `test-data/clientData.ts`
- **Test Execution:** 16 passed / 0 failed (100% pass rate)
