# Test Plan: CTMQ-3 - Add CTMQ logo and refine Login UI
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-32)
**Status:** Automated & Verified (14 / 14 Passed - 100%)

### Summary & Objectives
Polish the existing CTMQ Login page by adding the approved CTMQ logo as a local frontend asset (`/assets/ctmq-logo.png`), aligning the UI with the supplied login mockup (centered white card, soft wave accents, responsive design), eliminating stray blinking text carets outside inputs, and verifying that authentication functionality remains robust and unchanged.

### Preconditions & Setup
- Local test environment running with frontend and backend services accessible (e.g., `http://localhost:5173`).
- Seed accounts: Active Staffing Admin user and an Inactive user.
- Clean session state (unauthenticated / anonymous session, no existing auth cookies).
- Bundled asset `/assets/ctmq-logo.png` present in frontend assets.

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Login page shows CTMQ logo in a centered card | 1. Navigate to `/login`.<br>2. Inspect logo element (src `/assets/ctmq-logo.png`, alt `CTMQ — Contractor & Talent Management`).<br>3. Inspect login card layout. | Centered white card renders with logo, Username input, masked Password input, and Log In button. Logo aspect ratio is preserved with no app header or nav. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Successful login with valid Staffing Admin credentials | 1. Navigate to `/login`.<br>2. Enter valid Staffing Admin username.<br>3. Enter valid password.<br>4. Click `Log In`. | Exactly one `POST /api/auth/login` request is dispatched with JSON payload; HTTP 200 response; browser redirects to `/`. | State Transition Testing | Automated (PASSED) |
| TC-03 | Negative | Invalid password rejection | 1. Navigate to `/login`.<br>2. Enter valid username.<br>3. Enter incorrect password.<br>4. Click `Log In`. | HTTP 401 returned; user stays on `/login`; alert displays "Invalid username or password."; Log In button re-enabled. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Negative | Unknown / non-existent username rejection | 1. Navigate to `/login`.<br>2. Enter unregistered username.<br>3. Enter any password.<br>4. Click `Log In`. | HTTP 401 returned; user stays on `/login`; generic alert "Invalid username or password." is displayed. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Negative | Required-field validation on empty form submission | 1. Navigate to `/login`.<br>2. Leave Username and Password empty.<br>3. Click `Log In`. | Submission is blocked by HTML5 required validation; no `POST /api/auth/login` network request is sent. | Boundary Value Analysis | Automated (PASSED) |
| TC-06 | Negative | Missing username validation | 1. Navigate to `/login`.<br>2. Leave Username blank.<br>3. Enter password.<br>4. Click `Log In`. | Browser blocks submission; prompts user that Username is required; no network request dispatched. | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Negative | Missing password validation | 1. Navigate to `/login`.<br>2. Enter username.<br>3. Leave Password blank.<br>4. Click `Log In`. | Browser blocks submission; prompts user that Password is required; no network request dispatched. | Boundary Value Analysis | Automated (PASSED) |
| TC-08 | Edge | Rate limit threshold enforcement (5 attempts/min) | 1. Navigate to `/login`.<br>2. Submit invalid credentials 5 times within 1 minute.<br>3. Submit a 6th invalid attempt within the same minute. | Attempts 1–5 return HTTP 401 ("Invalid username or password."); 6th attempt returns HTTP 429 ("Too many attempts — try again in a minute."). | Boundary Value Analysis | Automated (PASSED) |
| TC-09 | Positive | Submitting state and button disabled during request | 1. Navigate to `/login`.<br>2. Enter credentials and click `Log In`.<br>3. Observe button text and state while request is in-flight. | Button text changes to "Logging in…" and becomes disabled to prevent duplicate submissions until request finishes. | State Transition Testing | Automated (PASSED) |
| TC-10 | Edge | Stray caret prevention on non-editable elements | 1. Navigate to `/login`.<br>2. Click on card background, wave accents, logo, and field labels.<br>3. Observe pointer and cursor behavior. | No blinking text caret appears on non-editable areas (`select-none` applied); logo is not draggable; pointer cursor is preserved; inputs remain editable. | Error Guessing | Automated (PASSED) |
| TC-11 | Positive | Keyboard navigation and visible focus indicators | 1. Navigate to `/login`.<br>2. Press `Tab` repeatedly through controls.<br>3. Type credentials and press `Enter` in the Password field. | Focus navigates sequentially (Username -> Password -> Log In); visible focus rings appear; pressing `Enter` submits the form. | State Transition Testing | Automated (PASSED) |
| TC-12 | Edge | Responsive layout across mobile and desktop viewports | 1. Set viewport to 375x667 (mobile) and inspect card/logo.<br>2. Resize to 1280x800 (desktop) and inspect. | At 375px card fits with padding and no horizontal scroll; at 1280px card is centered with larger responsive logo. | Boundary Value Analysis | Automated (PASSED) |
| TC-13 | Negative | Deactivated / inactive account login rejection | 1. Navigate to `/login`.<br>2. Enter credentials of an inactive account.<br>3. Click `Log In`. | HTTP 401 returned; error displays "Invalid username or password."; user remains on `/login`. | Decision Table Testing | Automated (PASSED) |
| TC-14 | Negative | Server failure (500) and network disconnect recovery | 1. Intercept `POST /api/auth/login` to return HTTP 500 or simulate network error.<br>2. Attempt login.<br>3. Observe feedback and retry availability. | Error message displays "Something went wrong. Please try again."; Log In button resets to enabled state allowing retry. | Negative & Error Handling | Automated (PASSED) |

### Required Test Data
- **Valid Staffing Admin User**: `username: process.env.Staffing_USERNAME || 'qaengineer'`, `password: process.env.Staffing_PASSWORD || 'Varshini@99'`
- **Invalid User**: `username: 'invalid_user_antigravity@test.com'`, `password: 'WrongPassword!'`
- **Inactive User**: `username: 'inactive_staffing_user'`, `password: 'Password123!'`
- **Logo Asset**: `/assets/ctmq-logo.png`
- **Expected Alt Text**: `CTMQ — Contractor & Talent Management`
- **Rate Limit Window**: 5 attempts / minute / IP

### Automation Implementation & Verification Summary
- **Spec File**: `tests/login.spec.ts`
- **Page Object**: `pages/LoginPage.ts`
- **Fixtures**: `fixtures/customFixtures.ts`
- **Test Data**: `test-data/authData.ts`
- **Test Results**: 14 passed / 0 failed (4.8s)
