# Test Plan: CTMQ-78 - Enforce mandatory fields and display red asterisk (*) on Add and Edit Temp pages
**Jira Sub-task:** [QA Testing Antigravity](CTMQ-79)
**Status:** Automated (11/11 Passed — `tests/tempMandatoryFields.spec.ts`)
**Branch:** `CTMQ-78-Testing`

### Summary & Objectives
Verify that all 10 mandatory fields (`First Name`, `Last Name`, `Cell Phone`, `Email`, `Address`, `City`, `State`, `ZIP`, `Certification`, `Specialty`) on Add Temp (`/temp/new`) and View/Edit Temp (`/temp/:id`) display a red asterisk (`*`) adjacent to their label, while non-marked fields (`County`, `Status`, `Date of Birth`, `Gender`, `Marital Status`) do not. Verify frontend and backend (`POST /api/temps`, `PUT /api/temps/{id}`) enforce required validation for all 10 mandatory fields—including `Certification` and `Specialty`—without data loss.

### Preconditions & Setup
- Authenticated as an Admin / Staffing Admin user (`qaengineer`).
- At least one active Certification with at least one mapped active Specialty exists in Admin Masters.
- At least one existing Temp record is available (or created during test setup) for Edit Temp and `PUT /api/temps/{id}` verification.

### Test Scenarios

| Scenario ID | Type | Description | Test Steps | Expected Result | Testing Technique |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Positive | Red asterisk (`*`) displayed for all 10 mandatory fields on Add Temp (`/temp/new`) | 1. Navigate to `/temp/new`.<br>2. Inspect labels for First Name, Last Name, Cell Phone, Email, Address, City, State, ZIP, Certification, and Specialty. | Each of the 10 mandatory field labels displays a visible red asterisk (`*`, `text-red-600`) immediately next to the label text. | Equivalence Partitioning |
| TC-02 | Positive | No red asterisk on non-marked fields on Add Temp (`/temp/new`) | 1. Navigate to `/temp/new`.<br>2. Inspect labels for County, Status, Date of Birth, Gender, and Marital Status. | None of the 5 non-marked fields display a red asterisk (`*`) next to their label. | Equivalence Partitioning |
| TC-03 | Positive | Red asterisk indicator parity on View/Edit Temp (`/temp/:id`) | 1. Open an existing Temp at `/temp/:id`.<br>2. Inspect labels in View mode.<br>3. Click Edit and inspect labels in Edit mode. | All 10 mandatory fields display a red asterisk (`*`) and the 5 non-marked fields do not display a red asterisk in both View and Edit modes. | State Transition Testing |
| TC-04 | Positive | Create Temp succeeds with all 10 mandatory fields populated | 1. Navigate to `/temp/new`.<br>2. Fill all 10 mandatory fields including an active Certification and a mapped active Specialty.<br>3. Submit the form. | Temp is created successfully without validation errors and persists with all submitted mandatory values. | Equivalence Partitioning |
| TC-05 | Negative | Add Temp blocks save when Certification or Specialty is unselected | 1. Navigate to `/temp/new`.<br>2. Populate the 8 text mandatory fields, leaving Certification unselected.<br>3. Attempt to submit.<br>4. Select a Certification, leave Specialty unselected, and attempt to submit. | Submission is blocked in both cases; required validation / clear feedback error is surfaced and no Temp is created. | Decision Table Testing |
| TC-06 | Negative | Add Temp blocks save when any required text field is empty | 1. Navigate to `/temp/new`.<br>2. Populate 9 of 10 mandatory fields, leaving one required text field empty (tested across First Name, Last Name, Cell Phone, Email, Address, City, State, ZIP).<br>3. Attempt to submit. | Submission is blocked on the frontend with clear validation feedback indicating the missing required field. | Error Guessing |
| TC-07 | Negative | Edit Temp blocks save and displays FeedbackBanner error when any mandatory field is cleared | 1. Open an existing Temp at `/temp/:id` and enter Edit mode.<br>2. Clear a mandatory field (e.g., First Name, Email, Certification, or Specialty).<br>3. Click Save. | Save is blocked and `FeedbackBanner` displays a clear validation error message; original persisted record remains unchanged. | State Transition Testing |
| TC-08 | Positive | Edit Temp saves cleanly when all 10 mandatory fields are valid | 1. Open an existing Temp at `/temp/:id` and enter Edit mode.<br>2. Update a valid field while keeping all 10 mandatory fields populated.<br>3. Click Save. | Record updates successfully, `FeedbackBanner` confirms save, and updated values persist on reload with zero data loss. | Equivalence Partitioning |
| TC-09 | Negative | Backend `POST /api/temps` rejects missing or blank mandatory fields | 1. Send `POST /api/temps` missing `Certification`.<br>2. Send `POST /api/temps` missing `Specialty`.<br>3. Send `POST /api/temps` with whitespace-only required text fields (e.g., `FirstName: "   "`). | Backend returns `400 Bad Request` with a clear validation error message for each invalid request. | Boundary Value Analysis |
| TC-10 | Negative | Backend `PUT /api/temps/{id}` rejects missing or blank mandatory fields without data loss | 1. Send `PUT /api/temps/{id}` with empty `Certification` or empty `Specialty` or blank required field.<br>2. Fetch `GET /api/temps/{id}`. | Backend returns `400 Bad Request` with a clear validation message, and existing Temp data remains intact. | Boundary Value Analysis |
| TC-11 | Edge | Backend rejects unmapped Specialty for selected active Certification | 1. Send `POST /api/temps` and `PUT /api/temps/{id}` with an active `Certification` paired with a `Specialty` not mapped to that Certification. | Backend returns `400 Bad Request` rejecting the invalid Certification-Specialty mapping. | Decision Table Testing |

### Automation Assets & Execution Summary
- **Spec:** `tests/tempMandatoryFields.spec.ts` (`TC-01`–`TC-11` — all 11 automated, 0 manual)
- **Page Objects Updated:** `pages/BaseTempFormPage.ts` (added `feedbackErrorBanner`, `feedbackSuccessBanner`, `getFieldLabel`, `getRequiredAsterisk`, `clearSelect`, `getTempViaApi`, `getActiveMappedCertAndSpecialtyViaApi`)
- **Test Data Added:** `test-data/tempMandatoryFieldsData.ts`
- **Verification:** `npx playwright test tests/tempMandatoryFields.spec.ts` — **11 passed (11.8s)**

### Required Test Data
- **Mandatory Field Labels (10)**: `First Name`, `Last Name`, `Cell Phone`, `Email`, `Address`, `City`, `State`, `ZIP`, `Certification`, `Specialty`
- **Non-Marked Field Labels (5)**: `County`, `Status`, `Date of Birth`, `Gender`, `Marital Status`
- **Valid Temp Payload**: Unique timestamped email, valid 10-digit phone, address/city/state/ZIP, active Certification, and mapped active Specialty.
- **Invalid Payloads**: Missing/empty/whitespace `Certification`, `Specialty`, `FirstName`, `Email`, and mismatched Certification/Specialty pair.
