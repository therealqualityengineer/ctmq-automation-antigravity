# Test Plan: CTMQ-52 - Implement Edit functionality for Specialties and Certifications in Admin General Settings

**Jira Sub-task:** [QA Testing Antigravity](https://therealqualityengineer.atlassian.net/browse/CTMQ-66)
**Status:** Automated & Verified (15/15 Passed - 100%)

### Summary & Objectives
Validate the Edit functionality for Specialties (`/admin/specialties`) and Certifications (`/admin/certifications`) within Admin General Settings. Ensure that clicking an existing record row or name link opens the edit modal pre-populated with established details. Verify that the Name field is disabled/read-only across both modals to prevent accidental modification of established names, while mapped associations (multi-select dropdown) and Status ("Active" / "Inactive") remain editable. Validate successful save workflows triggering the corresponding `PUT` endpoints (`/api/admin/specialties/{id}` and `/api/admin/certifications/{id}`), displaying success feedback banners (`FeedbackBanner`), closing the modal, and refreshing the table list with updated mappings and statuses. Verify modal dismissal via Cancel / Close (X) discards changes without updating records, error handling displays an error banner without losing inputs or closing the modal, and backward compatibility is preserved for Add mode ("+ Add Specialty" / "+ Add Certification").

### Preconditions & Setup
- System running locally (`http://localhost:5173`)
- User is authenticated as Staffing Admin
- Seeded specialties and certifications exist in the database (e.g. Registered Nurse, BLS, ACLS, etc.)

### Test Scenarios & Execution Results

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique | Automation & Run Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Verify clicking an existing Specialty opens Edit Specialty modal with pre-populated details | 1. Navigate to `/admin/specialties`.<br>2. Click on an existing specialty row/name.<br>3. Inspect modal title, fields, and action button. | Modal opens with title "Edit Specialty"; Name input is pre-populated with specialty name; Mappings and Status match existing record; Action button reads "Save Changes" (or "Save"). | State Transition Testing | Automated (PASSED) |
| TC-02 | Positive | Verify Specialty Name input is disabled and non-editable in Edit mode | 1. Open Edit Specialty modal for an existing record.<br>2. Attempt to type into or edit the Specialty Name input. | Specialty Name input is disabled (`disabled`, `bg-slate-100`, `cursor-not-allowed`) and cannot be focused or modified. | Boundary Value Analysis | Automated (PASSED) |
| TC-03 | Positive | Verify updating Specialty Status (Active to Inactive) updates record, displays banner, and refreshes table | 1. Open Edit Specialty modal for an active specialty.<br>2. Change Status to "Inactive".<br>3. Click "Save Changes". | `PUT /api/admin/specialties/{id}` succeeds (200 OK); modal closes; green success FeedbackBanner "Specialty updated successfully." is displayed; table row displays updated Inactive status. | Equivalence Partitioning | Automated (PASSED) |
| TC-04 | Positive | Verify updating Specialty Certification Mappings updates record, displays banner, and refreshes table | 1. Open Edit Specialty modal.<br>2. Add or remove certification mappings from the multi-select dropdown.<br>3. Click "Save Changes". | Modal closes; success FeedbackBanner appears; table row displays updated certification mappings list. | Equivalence Partitioning | Automated (PASSED) |
| TC-05 | Positive | Verify clicking an existing Certification opens Edit Certification modal with pre-populated details | 1. Navigate to `/admin/certifications`.<br>2. Click on an existing certification row/name.<br>3. Inspect modal title, fields, and action button. | Modal opens with title "Edit Certification"; Name input is pre-populated with certification name; Mappings and Status match existing record; Action button reads "Save Changes" (or "Save"). | State Transition Testing | Automated (PASSED) |
| TC-06 | Positive | Verify Certification Name input is disabled and non-editable in Edit mode | 1. Open Edit Certification modal for an existing record.<br>2. Attempt to type into or edit the Certification Name input. | Certification Name input is disabled (`disabled`, `bg-slate-100`, `cursor-not-allowed`) and cannot be focused or modified. | Boundary Value Analysis | Automated (PASSED) |
| TC-07 | Positive | Verify updating Certification Status (Active to Inactive) updates record, displays banner, and refreshes table | 1. Open Edit Certification modal for an active certification.<br>2. Change Status to "Inactive".<br>3. Click "Save Changes". | `PUT /api/admin/certifications/{id}` succeeds (200 OK); modal closes; green success FeedbackBanner "Certification updated successfully." is displayed; table row displays updated Inactive status. | Equivalence Partitioning | Automated (PASSED) |
| TC-08 | Positive | Verify updating Certification Mapped Specialties updates record, displays banner, and refreshes table | 1. Open Edit Certification modal.<br>2. Add or remove specialty mappings from the multi-select dropdown.<br>3. Click "Save Changes". | Modal closes; success FeedbackBanner appears; table row displays updated mapped specialties list. | Equivalence Partitioning | Automated (PASSED) |
| TC-09 | Positive | Verify dismissing Edit modal via Cancel or Close (X) leaves record unchanged | 1. Open Edit modal for a specialty or certification.<br>2. Modify Status or Mappings.<br>3. Click Cancel or Close (X) button. | Modal closes without submitting `PUT` request; record in table retains original status and mappings. | State Transition Testing | Automated (PASSED) |
| TC-10a | Positive | Verify backward compatibility: Add Specialty modal opens in Create mode | 1. On `/admin/specialties`, click "+ Add Specialty".<br>2. Check title, editable Name, default "Active". | Modal opens with "Add Specialty" title, editable Name field, default "Active" status, and "Save" button. | Equivalence Partitioning | Automated (PASSED) |
| TC-10b | Positive | Verify backward compatibility: Add Certification modal opens in Create mode | 1. On `/admin/certifications`, click "+ Add Certification".<br>2. Check title, editable Name, default "Active". | Modal opens with "Add Certification" title, editable Name field, default "Active" status, and "Save" button. | Equivalence Partitioning | Automated (PASSED) |
| TC-11 | Negative | Verify error banner display inside modal on API failure without closing modal | 1. Open Edit modal for specialty or certification.<br>2. Trigger a simulated API error (or network error).<br>3. Click Save Changes. | Modal remains open; error banner displays failure message; form inputs are preserved without data loss. | Negative & Error Handling | Automated (PASSED) |
| TC-12 | Negative | Verify unauthenticated access protection redirects `/admin/specialties` and `/admin/certifications` to `/login` | 1. Navigate to `/admin/specialties` and `/admin/certifications` without auth session. | Direct access is blocked; browser redirects to `/login`. | Security Testing | Automated (PASSED) |
| TC-13 | Edge | Verify clearing all mapped associations (empty mapping) and saving successfully | 1. Open Edit modal for an item with mappings.<br>2. Remove all mapped associations.<br>3. Click "Save Changes". | Record updates with empty mapping (or "-"); table displays "-" or empty mapping; success banner appears. | Boundary Value Analysis | Automated (PASSED) |
| TC-14 | Edge | Verify selecting multiple mapped associations and saving successfully | 1. Open Edit modal.<br>2. Select multiple mappings in the dropdown.<br>3. Click "Save Changes". | Record updates with multiple comma-separated mappings; table displays all selected mappings accurately. | Boundary Value Analysis | Automated (PASSED) |

### Required Test Data
- Valid Staffing Admin credentials
- Target Routes: `/admin/specialties`, `/admin/certifications`
- Existing Specialty records with Active/Inactive statuses
- Existing Certification records with Active/Inactive statuses
- Mapping associations for multi-select tests

### Implementation & Layered Architecture
- **Spec:** `tests/specialtiesCertificationsEdit.spec.ts`
- **Page Objects:** `pages/SpecialtiesPage.ts`, `pages/CertificationsPage.ts`
- **Fixtures:** `authenticatedSpecialtiesPage`, `authenticatedCertificationsPage`, `specialtiesPage`, `certificationsPage` in `fixtures/customFixtures.ts`
- **Test Data:** `test-data/specialtiesCertificationsEditData.ts`, `test-data/specialtiesData.ts`, `test-data/certificationsData.ts`

### Verification
- **Execution Command:** `npx playwright test tests/specialtiesCertificationsEdit.spec.ts`
- **Result:** 15 passed (100% pass rate)
