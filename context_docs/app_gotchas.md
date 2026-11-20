# Application Quirks, Timing & RCA Gotchas Memory Bank

This living register records practical DOM quirks, timing workarounds, locator patterns, and Root Cause Analysis (RCA) findings discovered during test automation and exploratory probing.

> [!IMPORTANT]
> **Continuous Learning Rule**:
> - **ScriptAgent**: Before writing tests or running RCA, review this file to avoid re-debugging known application quirks.
> - **After RCA / Probe Verification**: When a test failure or DOM inspection reveals a new trick or timing fix, append it here and link the corresponding `scratch/probe-*.ts` script if one was used.

---

## 1. Authentication & Session Persistence
- **Symptom / Quirk**: Navigating directly to protected routes (e.g. `/admin`, `/temps`) triggers redirect to `/login` if session storage/cookies are invalid.
- **Solution**:
  - Fixtures and probe scripts read `.auth_cookies.json` to inject session cookies before `page.goto()`.
  - If redirect to `/login` occurs, submit credentials (`qaengineer` / `Varshini@99`), wait for `page.waitForURL(/\/(?!login).*/)`, and serialize updated cookies back to `.auth_cookies.json`.
- **Reference Probe**: [scratch/probe-client-auth.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-client-auth.ts)

---

## 2. Table Loading & Async Data Rows
- **Symptom / Quirk**: Tables (e.g. Temps, Clients, Status Options, Certifications, Specialties) render an initial empty state or skeleton loader before `tbody tr` rows are rendered via API fetch. Additionally, querying `tableHeaders.allInnerTexts()` immediately upon page load can return an empty array (`[]`) before the table component mounts its `<thead>`.
- **Solution**:
  - Avoid raw `expect(page.locator('tbody tr')).toHaveCount(N)` immediately after page load.
  - Wait for network idle or wait for the skeleton/loading spinner to detach: `await expect(page.locator('.loading-indicator')).toHaveCount(0)`.
  - Always enforce web-first assertion on table and first header before evaluating column headers: `await expect(pageObject.table).toBeVisible()` and `await expect(pageObject.tableHeaders.first()).toBeVisible()`.
  - Alternatively, use `await page.locator('tbody tr').first().waitFor({ state: 'visible' })` before evaluating row counts or cell text.
- **Reference Probes**:
  - [scratch/probe-tbody-loading.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-tbody-loading.ts)
  - [scratch/probe-data-rows.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-data-rows.ts)

---

## 3. Admin Status Options & Modal Dialogs
- **Symptom / Quirk**: "Add Status Option" button opens a modal dialog (`[role="dialog"]`). Form input fields inside the modal may not be instantly focusable due to CSS transition/animation.
- **Solution**:
  - Always wait for dialog visibility: `await expect(page.getByRole('dialog')).toBeVisible()`.
  - Scope inputs directly to dialog locator: `const dialog = page.getByRole('dialog'); await dialog.getByLabel('Name').fill(...)`.
  - When closing, verify dialog detaches (`toBeHidden()`) before asserting table row additions.
- **Reference Probes**:
  - [scratch/probe-status-options.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-status-options.ts)
  - [scratch/probe-status-options-create.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-status-options-create.ts)
  - [scratch/probe-status-options-duplicate.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-status-options-duplicate.ts)

---

## 4. Delete Confirmations & Cascade Warnings
- **Symptom / Quirk**: Clicking delete on an entity triggers an asynchronous confirmation modal. Attempting to delete an item linked to active temps shows a non-dismissible or specific error modal.
- **Solution**:
  - Capture both modal states: confirm dialog (`getByRole('dialog')`) and error toast/modal (`.error-modal`).
  - Always wait for modal to finish transition before interacting with the "Confirm Delete" button.
- **Reference Probes**:
  - [scratch/probe-delete-ctmq-55.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-delete-ctmq-55.ts)
  - [scratch/probe-error-modal.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-error-modal.ts)

---

## 5. Form Field Validation & HTML5 Validity State
- **Symptom / Quirk**: Some forms use native browser HTML5 validation (`:invalid`, `checkValidity()`), while others use custom React/Vue error text below the input.
- **Solution**:
  - Leverage `BasePage.isFieldInvalid(locator)` to inspect both native validity states (`validity.valueMissing`, `validity.typeMismatch`) and visible DOM error messages.
  - Do not use arbitrary sleeps to wait for validations; trigger blur by pressing `Tab` (`BasePage.pressTab()`).
- **Reference Probes**:
  - [scratch/probe-temp-validations.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-temp-validations.ts)
  - [scratch/probe-shift-edit-validation.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-shift-edit-validation.ts)

---

## 6. Fixture Chaining & Multi-Page Test Navigation
- **Symptom / Quirk**: Injecting multiple authenticated page fixtures (e.g., `authenticatedSpecialtiesPage`, `authenticatedShiftsPage`, `authenticatedOrderTypesPage`) into the same test function causes Playwright fixture initialization chaining on the shared `page` instance. The test begins on whichever route was initialized last (e.g., `/admin/status-options`), causing locators belonging to previously initialized fixtures to timeout or fail with `element not found`.
- **Solution**:
  - In cross-page comparison or multi-page verification tests, inject a single primary authenticated fixture (e.g., `authenticatedShiftsPage`) to establish the authenticated session, and pass unauthenticated Page Objects (e.g., `specialtiesPage`, `certificationsPage`, `orderTypesPage`, `statusOptionsPage`).
  - Sequentially navigate to each page (`await pageObj.gotoXYZ()`), wait explicitly for key landmarks (`await expect(pageObj.heading).toBeVisible()`), and then execute assertions.
  - Additionally, avoid calling unawaited `locator.count()` during page transitions because `count()` resolves immediately without auto-waiting; always enforce web-first assertion (e.g., `await expect(pageObj.heading).toBeVisible()`) prior to counting semantic elements.
- **Reference Probes**:
  - [scratch/probe-admin-headings.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-admin-headings.ts)
  - [scratch/probe-admin-headings-layout.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-admin-headings-layout.ts)

---

## 7. Dynamic Status Options & Temp/Client Status Length Constraint (`CTMQ-75`)
- **Symptom / Quirk**:
  1. While `/api/admin/status-options` allows status option names up to 100 characters, the backend `Temp` and `Client` create/update DTOs enforce `[MaxLength(16)]` on the `Status` field. Submitting a status string longer than 16 characters to `POST`/`PUT /api/temps` or `/api/clients` triggers a `400` ASP.NET model validation error (`The field Status must be a string or array type with a maximum length of '16'.`) prior to reaching the controller's dynamic `status_options` validation.
  2. On `/temp/new`, `/temp/:id`, `/client/new`, and `/client/:id`, `#status` `<option>` elements are populated asynchronously via `GET /api/admin/status-options?entityType={Temp|Client}&status=Active&pageSize=500`. When viewing or editing a record whose assigned status was later inactivated (`isActive: false`), the UI dynamically appends the record's existing status option to `#status` so the value is preserved.
- **Solution**:
  - Keep custom status option names used in Temp/Client E2E and API validation tests `<= 16` characters (via `statusOptionsData.dynamicDropdowns.generateShortStatus(prefix)`).
  - Wait for `networkidle` and first `<option>` attachment inside `BaseTempFormPage.getStatusOptionTexts()` / `getSelectedStatus()` and `ClientDetailPage.getStatusOptionTexts()` / `getSelectedStatus()` before reading option texts or selected values.
- **Reference Probe**:
  - [scratch/probe-dynamic-status-options.ts](file:///Users/arunramalingam/Documents/GitHub/ctmq-automation-antigravity/scratch/probe-dynamic-status-options.ts)

---

## 8. Admin Certifications `mappedSpecialties` API Shape & `FieldRow` Required Asterisk (`CTMQ-78` & `CTMQ-80`)
- **Symptom / Quirk**:
  1. `GET /api/admin/certifications` returns `mappedSpecialties` as a comma-separated string (e.g. `"Cardiology, Pediatrics"` or `""`) rather than a JSON array, and uses `status: "Active" | "Inactive"`. Calling `.filter()` directly on `cert.mappedSpecialties` throws a `TypeError`.
  2. On `/temp/new`, `/temp/:id`, `/client/new`, and `/client/:id`, mandatory field labels render their red asterisk via `FieldRow` as `<span class="ml-0.5 text-red-600" aria-hidden="true">*</span>` inside the label element.
  3. In parallel Playwright runs (`2 workers`), asserting raw `totalCount` before and after a Zero Data Loss test can observe transient test entities created/cleaned up by a sibling worker.
- **Solution**:
  - Use `BaseTempFormPage.getActiveMappedCertAndSpecialtyViaApi()` (which normalizes both comma-separated strings and arrays and filters active records) to dynamically select valid mapped Certification/Specialty pairs.
  - Use `BasePage.getFieldLabel(label)` and `BasePage.getRequiredAsterisk(label)` (shared across `BaseTempFormPage` and `ClientDetailPage`) for asserting red asterisk presence/absence across Add and Edit Temp/Client pages.
  - When verifying Zero Data Loss via list endpoints in parallel worker suites, compare baseline permanent record IDs (filtering out transient worker-prefixed test records) rather than raw `totalCount`.

---

## 9. User Management `FeedbackBanner` Tag (`<p role="alert">`) & Native HTML5 `required` (`CTMQ-82`)
- **Symptom / Quirk**:
  1. On `/admin/users/new` and `/admin/users/:id`, `FeedbackBanner` renders as `<p role="alert">` (or `<p role="status">`) rather than `<div role="alert">`. Locators scoped strictly to `div[role="alert"]` fail to match error banners on User pages.
  2. On `/admin/users/new`, the 5 mandatory `<input>` elements carry the HTML5 `required` attribute, which intercepts empty form submission via browser-native validity before React's `handleSubmit()` runs unless either whitespace is entered or `form.noValidate = true` (`AddUserPage.disableNativeFormValidation()`) is set when testing React's custom `FeedbackBanner` and inline `<p class="mt-1 text-xs text-red-700">` error messages.
- **Solution**:
  - Use `page.locator('[role="alert"], [role="status"]').first()` for `feedbackBanner` on both `AddUserPage` and `UserDetailPage`.
  - Use `AddUserPage.disableNativeFormValidation()` when verifying React's dual `FeedbackBanner` + inline field error messages across all 5 mandatory fields on `/admin/users/new`.

---

## 10. How to Add New Learnings Here
When you complete RCA on a failed test or discover an application quirk:
1. Provide a clear **Symptom / Quirk** description.
2. Provide the verified **Solution / Workaround** implemented in Page Objects or fixtures.
3. Link the diagnostic script in `scratch/` (e.g. `[scratch/probe-<feature>.ts](file:///...)`).
