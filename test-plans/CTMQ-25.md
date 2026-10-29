# Test Plan: CTMQ-25 - [CTMQ-9] County keeps previous ZIP's county when ZIP is changed, cleared or unknown
**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-42)
**Status:** Automated (6/6 Passing)

### Summary & Objectives
Verify that the County field on the Temp details form behaves as a non-editable field that strictly synchronizes with the ZIP code. Entering a valid ZIP auto-fills the correct county, changing the ZIP updates the county dynamically, and clearing or entering an unknown/invalid ZIP resets the county to "None" rather than retaining stale county data or reverting to an editable free-text input.

### Preconditions & Setup
- System running locally at `http://localhost:5173/`
- User authenticated with role: Staffing Admin
- User navigated to Add Temp page (`/temp/new`) via fixture `authenticatedAddTempPage`

### Test Scenarios & Automation Status

| Scenario ID | Type | Description | Status | Spec / Location | Testing Technique |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Auto-populate County when valid ZIP is entered | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | Equivalence Partitioning |
| TC-02 | Positive | Dynamically update County when ZIP is changed to another valid ZIP | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | State Transition Testing |
| TC-03 | Negative | Enforce non-editable County field and prevent manual free-text typing | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | Negative Testing / Error Guessing |
| TC-04 | Negative | Reset County to 'None' when ZIP is cleared | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | State Transition Testing |
| TC-05 | Edge | Reset County to 'None' when an unknown/unmapped ZIP is entered | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | Boundary Value Analysis |
| TC-06 | Edge | Handle incomplete ZIP code entry | Automated | [tempCountyZipSync.spec.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/tempCountyZipSync.spec.ts) | Boundary Value Analysis |

### Implementation & Layered Architecture
- **Spec**: `tests/tempCountyZipSync.spec.ts`
- **Page Object**: `pages/AddTempPage.ts` (`getSelectedCountyText`, `isCountyFieldEditable`, `fillZip`, `clearZip`)
- **Fixture**: `authenticatedAddTempPage` in `fixtures/customFixtures.ts`
- **Test Data**: `test-data/countyZipSyncData.ts`

### Required Test Data
- `validZip1`: `'02108'` -> `expectedCounty1`: `'Suffolk County'`
- `validZip2`: `'01001'` -> `expectedCounty2`: `'Hampden County'`
- `unknownZip`: `'00000'`
- `incompleteZip`: `'021'`
- `defaultCounty`: `'None'`

### Verification
- **Command**: `npx playwright test tests/tempCountyZipSync.spec.ts`
- **Result**: 6 passed (100% pass rate)
