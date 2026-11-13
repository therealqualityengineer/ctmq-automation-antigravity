# Test Plan: CTMQ-72 - [Admin] Certification and Specialty mapping is not bidirectional: Mapped specialties in Certifications do not reflect under /admin/specialties

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-73)
**Status:** Automated & Verified (15/15 Passed - 100%)

### Summary & Objectives
Validate bidirectional relational integrity and synchronization between Certifications (`/admin/certifications`) and Specialties (`/admin/specialties`) in the Admin General Settings module. Ensure that Many-to-Many associations established from either the Certifications or Specialties configuration views immediately reflect reciprocally in both data tables (under `MAPPED SPECIALTIES` and `CERTIFICATION MAPPING`), persist across updates and page refreshes, properly handle unmapping fallback (`-`), and maintain UI stability under edge boundary conditions.

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated with role: Admin / QA Engineer (`qaengineer`)
- Target Admin Master routes: `/admin/certifications` and `/admin/specialties`
- Baseline seeded master entities available (e.g., `Cardiology`, `Emergency Medicine`, `Pediatrics`, `ACLS`, `BLS`)

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify presence and labeling of mapping columns in both Admin tables | 1. Log in as Admin (`qaengineer`).<br>2. Navigate to `/admin/certifications`.<br>3. Verify table header contains "MAPPED SPECIALTIES".<br>4. Navigate to `/admin/specialties`.<br>5. Verify table header contains "CERTIFICATION MAPPING". | Both data tables display the respective mapping column headers with correct terminology and alignment. | Equivalence Partitioning | Automated (PASSED) |
| TC-02 | Positive | Verify reciprocal mapping reflection on Specialties table when mapping via Certification creation | 1. Navigate to `/admin/certifications`.<br>2. Click "+ Add Certification".<br>3. Enter unique Certification name (e.g., `ACLS-BioTest-01`) and select Specialty `Cardiology`.<br>4. Save Certification.<br>5. Verify `Cardiology` appears under `MAPPED SPECIALTIES` on `/admin/certifications`.<br>6. Navigate to `/admin/specialties`.<br>7. Locate `Cardiology` row in table. | The `Cardiology` row on `/admin/specialties` displays `ACLS-BioTest-01` under `CERTIFICATION MAPPING` instead of showing a hyphen (`-`). | State Transition Testing | Automated (PASSED) |
| TC-03 | Positive | Verify reciprocal mapping reflection on Certifications table when mapping via Specialty creation | 1. Navigate to `/admin/specialties`.<br>2. Click "+ Add Specialty".<br>3. Enter unique Specialty name (e.g., `Neurology-BioTest-01`) and map Certification `BLS`.<br>4. Save Specialty.<br>5. Verify `BLS` appears under `CERTIFICATION MAPPING` on `/admin/specialties`.<br>6. Navigate to `/admin/certifications`.<br>7. Locate `BLS` row in table. | The `BLS` row on `/admin/certifications` displays `Neurology-BioTest-01` under `MAPPED SPECIALTIES`. | State Transition Testing | Automated (PASSED) |
| TC-04 | Positive | Verify multi-mapping (Many-to-Many) display on Specialties view | 1. Map multiple Certifications to a single Specialty.<br>2. Navigate to `/admin/specialties`.<br>3. Inspect the `CERTIFICATION MAPPING` column. | All associated certifications are listed cleanly under `CERTIFICATION MAPPING`. | Decision Table Testing | Automated (PASSED) |
| TC-05 | Positive | Verify multi-mapping (Many-to-Many) display on Certifications view | 1. Map a single Certification to multiple Specialties.<br>2. Navigate to `/admin/certifications`.<br>3. Inspect `MAPPED SPECIALTIES` column. | All mapped specialties are listed clearly under `MAPPED SPECIALTIES`. | Decision Table Testing | Automated (PASSED) |
| TC-06 | Positive | Verify bidirectional synchronization when updating / editing Certification mappings | 1. Open an existing Certification in edit mode.<br>2. Add a new Specialty and remove an existing Specialty.<br>3. Save changes.<br>4. Inspect `/admin/certifications` table.<br>5. Navigate to `/admin/specialties`. | `/admin/certifications` reflects updated specialties; on `/admin/specialties`, new Specialty displays the certification and removed Specialty no longer references it. | State Transition Testing | Automated (PASSED) |
| TC-07 | Positive | Verify bidirectional synchronization when updating / editing Specialty mappings | 1. Open an existing Specialty in edit mode.<br>2. Add a new Certification association and remove an existing Certification association.<br>3. Save changes.<br>4. Inspect `/admin/specialties` table.<br>5. Navigate to `/admin/certifications`. | Both views reflect the synchronized associations immediately. | State Transition Testing | Automated (PASSED) |
| TC-08 | Positive | Verify unmapped records display fallback placeholder hyphen ("-") | 1. Create a new Specialty without assigning any Certification mapping.<br>2. Create a new Certification without assigning any Specialty mapping.<br>3. Inspect both data tables. | Specialties table displays `-` under `CERTIFICATION MAPPING`; Certifications table displays `-` under `MAPPED SPECIALTIES`. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Positive | Verify dissociation/unmapping resets reciprocal view to fallback hyphen ("-") | 1. Edit a Certification that is solely mapped to a single Specialty.<br>2. Remove the Specialty mapping and save.<br>3. Navigate to `/admin/specialties` and inspect the previously mapped Specialty row. | The Specialty row's `CERTIFICATION MAPPING` updates from the certification name to hyphen (`-`). | State Transition Testing | Automated (PASSED) |
| TC-10 | Positive | Verify mapping persistence across browser reload and re-navigation | 1. Establish bidirectional mapping between a Certification and Specialty.<br>2. Hard-refresh browser on `/admin/certifications`.<br>3. Navigate to `/admin/specialties` and refresh. | Bidirectional mapping associations persist accurately across page reloads and cache resets. | State Transition Testing | Automated (PASSED) |
| TC-11 | Negative | Verify inactive Specialty/Certification mapping handling in data tables | 1. Deactivate an active Certification that has mapped Specialties.<br>2. Navigate to `/admin/specialties`.<br>3. Observe `CERTIFICATION MAPPING` display for the affected Specialty. | Inactive certification is retained and displayed without UI errors or table crash. | State Transition Testing / Negative | Automated (PASSED) |
| TC-12 | Negative | Verify unauthenticated access protection for Admin mapping pages | 1. Log out or open an unauthenticated session.<br>2. Attempt direct navigation to `/admin/certifications` and `/admin/specialties`. | User is redirected to `/login`; unauthorized access to master configurations and mapping data is prevented. | Security / Negative Testing | Automated (PASSED) |
| TC-13 | Edge | Verify UI handling of long entity names in mapping columns | 1. Create a Certification with a 50+ character name and map it to a Specialty.<br>2. Inspect `/admin/specialties` data table row. | UI handles long string values gracefully without breaking table layout or overflowing row borders. | Boundary Value Analysis | Automated (PASSED) |
| TC-14 | Edge | Verify search and filtering compatibility with mapped values | 1. On `/admin/specialties`, enter a mapped Certification name into the table search filter.<br>2. On `/admin/certifications`, enter a mapped Specialty name into the table search filter. | Table search filtering returns matching records based on mapped values. | Equivalence Partitioning | Automated (PASSED) |
| TC-15 | Edge | Verify rapid sequential mapping updates maintain state consistency | 1. In rapid succession, associate and dissociate multiple Specialties with a Certification.<br>2. Save each intermediate state.<br>3. Inspect `/admin/specialties` and `/admin/certifications`. | Backend handles state synchronization without race conditions; final state matches latest UI save. | Concurrency / State Transition | Automated (PASSED) |

### Required Test Data
- Valid Admin credentials (`qaengineer` / password)
- Target routes: `/admin/certifications`, `/admin/specialties`
- Dynamic test data names: Unique timestamped/randomized strings for Certifications and Specialties
- Seeded multi-mapping pairs for testing Many-to-Many associations
- Fallback indicator check: `"-"`

### Implementation & Layered Architecture
- **Spec:** [`tests/adminBidirectionalMapping.spec.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/tests/adminBidirectionalMapping.spec.ts)
- **Page Objects:** [`pages/CertificationsPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/CertificationsPage.ts), [`pages/SpecialtiesPage.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/pages/SpecialtiesPage.ts)
- **Fixtures:** `authenticatedCertificationsPage`, `authenticatedSpecialtiesPage`, `certificationsPage`, `specialtiesPage` in [`fixtures/customFixtures.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/fixtures/customFixtures.ts)
- **Test Data:** [`test-data/adminBidirectionalMappingData.ts`](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/test-data/adminBidirectionalMappingData.ts)

### Verification
- **Execution Command:** `npx playwright test tests/adminBidirectionalMapping.spec.ts`
- **Result:** 15 passed (15.9s) - 100% Pass Rate
