import { test, expect } from '../fixtures/customFixtures';
import { shiftsData } from '../test-data/shiftsData';

test.describe('CTMQ-49 - Shifts Management under Admin General Settings', () => {
  test('TC-01 - Verify navigation to Shifts page from Admin General Settings card', async ({
    authenticatedAdminPage,
  }) => {
    await expect(authenticatedAdminPage.shiftsLink).toBeVisible();
    await authenticatedAdminPage.shiftsLink.click();

    await authenticatedAdminPage.page.waitForURL(new RegExp(shiftsData.routes.shifts));
    expect(authenticatedAdminPage.page.url()).toContain(shiftsData.routes.shifts);
  });

  test('TC-02 - Verify Shifts page layout, AppShell navigation, and centered "+ Add Shift Option" button', async ({
    authenticatedShiftsPage,
  }) => {
    // AppShell navigation checks
    await expect(authenticatedShiftsPage.primaryNav).toBeVisible();
    expect(await authenticatedShiftsPage.isAdminTabActive()).toBe(true);
    await expect(authenticatedShiftsPage.adminSubNav).toBeVisible();

    // Page Controls
    await expect(authenticatedShiftsPage.addShiftButton).toBeVisible();
    expect(await authenticatedShiftsPage.isAddShiftButtonCentered()).toBe(true);
    await expect(authenticatedShiftsPage.searchInput).toBeVisible();
    await expect(authenticatedShiftsPage.searchButton).toBeVisible();
  });

  test('TC-03 - Verify Shifts table structure, columns, and Default Shift indicator', async ({
    authenticatedShiftsPage,
  }) => {
    await expect(authenticatedShiftsPage.table).toBeVisible();

    // Verify Table Headers
    const headerTexts = await authenticatedShiftsPage.tableHeaders.allInnerTexts();
    const normalizedHeaders = headerTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of shiftsData.tableHeaders) {
      expect(normalizedHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Verify row counts and Default Shift values ("Yes" / "No")
    const rowCount = await authenticatedShiftsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRowDefaultShift = await authenticatedShiftsPage.getDefaultShiftValueFor(
      shiftsData.defaultShifts[0].name
    );
    expect(firstRowDefaultShift === 'Yes' || firstRowDefaultShift === 'No').toBe(true);
  });

  test('TC-04 - Verify search filtering by Shift Name and search reset', async ({
    authenticatedShiftsPage,
  }) => {
    // Filter by existing shift name
    await authenticatedShiftsPage.search(shiftsData.defaultShifts[0].name);
    const shiftRow = authenticatedShiftsPage.getShiftRow(shiftsData.defaultShifts[0].name);
    await expect(shiftRow).toBeVisible();

    // Reset / clear search restores list
    await authenticatedShiftsPage.clearSearch();
    const totalRows = await authenticatedShiftsPage.tableRows.count();
    expect(totalRows).toBeGreaterThanOrEqual(1);
  });

  test('TC-05 - Verify pagination controls and page boundary button states', async ({
    authenticatedShiftsPage,
  }) => {
    await expect(authenticatedShiftsPage.paginationContainer).toBeVisible();
    await expect(authenticatedShiftsPage.paginationText).toContainText(/Page \d+ of \d+/);

    // Bound checks for page 1
    await expect(authenticatedShiftsPage.previousPageButton).toBeDisabled();
  });

  test('TC-06 - Verify Add Shift Option modal display, default fields, and dismissal via close (X) / Cancel', async ({
    authenticatedShiftsPage,
  }) => {
    // Open modal
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalTitle).toHaveText(shiftsData.modal.title);
    await expect(authenticatedShiftsPage.shiftNameInput).toBeVisible();
    await expect(authenticatedShiftsPage.startTimeInput).toBeVisible();
    await expect(authenticatedShiftsPage.endTimeInput).toBeVisible();
    await expect(authenticatedShiftsPage.defaultShiftSelect).toHaveValue('false');
    await expect(authenticatedShiftsPage.modalSaveButton).toBeVisible();

    // Dismiss via close (X)
    await authenticatedShiftsPage.closeModalViaCloseButton();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();

    // Reopen and dismiss via Cancel
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await authenticatedShiftsPage.closeModalViaCancel();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
  });

  test('TC-07 - Verify successful creation of a new non-default Shift Option', async ({
    authenticatedShiftsPage,
  }) => {
    const shiftName = `${shiftsData.testPayloads.validNonDefault.namePrefix}${Date.now()}`;
    const startTime = shiftsData.testPayloads.validNonDefault.startTime;
    const endTime = shiftsData.testPayloads.validNonDefault.endTime;

    await authenticatedShiftsPage.createShift(
      shiftName,
      startTime,
      endTime,
      shiftsData.testPayloads.validNonDefault.isDefault
    );

    // Modal closes
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();

    // Success banner appears
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedShiftsPage.feedbackBanner).toContainText(
      shiftsData.validationMessages.createSuccess
    );

    // Verify row in table
    const shiftRow = authenticatedShiftsPage.getShiftRow(shiftName);
    await expect(shiftRow).toBeVisible();

    // Verify Default Shift column displays "No"
    const defaultShiftVal = await authenticatedShiftsPage.getDefaultShiftValueFor(shiftName);
    expect(defaultShiftVal).toBe('No');
  });

  test('TC-08 - Verify successful creation of a new default Shift Option', async ({
    authenticatedShiftsPage,
  }) => {
    const shiftName = `${shiftsData.testPayloads.validDefault.namePrefix}${Date.now()}`;
    const startTime = shiftsData.testPayloads.validDefault.startTime;
    const endTime = shiftsData.testPayloads.validDefault.endTime;

    await authenticatedShiftsPage.createShift(
      shiftName,
      startTime,
      endTime,
      shiftsData.testPayloads.validDefault.isDefault
    );

    // Modal closes & banner appears
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();

    // Verify row in table
    await authenticatedShiftsPage.search(shiftName);
    const shiftRow = authenticatedShiftsPage.getShiftRow(shiftName);
    await expect(shiftRow).toBeVisible();

    // Verify Default Shift column displays "Yes"
    const defaultShiftVal = await authenticatedShiftsPage.getDefaultShiftValueFor(shiftName);
    expect(defaultShiftVal).toBe('Yes');
  });

  test('TC-09 - Verify client-side required field validation when submitting empty Shift Name, Start Time, or End Time', async ({
    authenticatedShiftsPage,
  }) => {
    await authenticatedShiftsPage.openAddShiftModal();

    // Leave required fields empty and click Save
    await authenticatedShiftsPage.saveModal();

    // Modal remains visible and required error is shown or HTML5 validation blocks
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();

    const isNameInvalid = await authenticatedShiftsPage.isFieldInvalid(
      authenticatedShiftsPage.shiftNameInput
    );
    const isStartTimeInvalid = await authenticatedShiftsPage.isFieldInvalid(
      authenticatedShiftsPage.startTimeInput
    );
    const isEndTimeInvalid = await authenticatedShiftsPage.isFieldInvalid(
      authenticatedShiftsPage.endTimeInput
    );
    const isErrorVisible = await authenticatedShiftsPage.modalRequiredFieldError
      .isVisible()
      .catch(() => false);

    expect(isNameInvalid || isStartTimeInvalid || isEndTimeInvalid || isErrorVisible).toBe(true);

    await authenticatedShiftsPage.closeModalViaCancel();
  });

  test('TC-10 - Verify 409 Conflict duplicate shift name validation (case-insensitive)', async ({
    authenticatedShiftsPage,
  }) => {
    await authenticatedShiftsPage.openAddShiftModal();

    await authenticatedShiftsPage.fillShiftName(shiftsData.testPayloads.duplicateNameCaseInsensitive);
    await authenticatedShiftsPage.fillStartTime('08:00 AM');
    await authenticatedShiftsPage.fillEndTime('04:00 PM');
    await authenticatedShiftsPage.saveModal();

    // Modal remains open and conflict error appears
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalConflictError).toBeVisible();

    await authenticatedShiftsPage.closeModalViaCancel();
  });

  test('TC-11 - Verify unauthenticated access protection for /admin/shifts', async ({
    shiftsPage,
    context,
  }) => {
    // Clear cookies/session
    await context.clearCookies();

    // Directly navigate to /admin/shifts
    await shiftsPage.gotoShifts();

    // Redirected to login
    await shiftsPage.page.waitForURL(new RegExp(shiftsData.routes.login));
    expect(shiftsPage.page.url()).toContain(shiftsData.routes.login);
  });

  test('TC-12 - Verify Shift Name maximum character length boundary (100 characters) and direct URL stability', async ({
    authenticatedShiftsPage,
  }) => {
    const longName = shiftsData.testPayloads.generate100CharName(Date.now().toString().slice(-4));

    await authenticatedShiftsPage.createShift(
      longName,
      '09:00 AM',
      '05:00 PM',
      false
    );

    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await authenticatedShiftsPage.search(longName);
    const row = authenticatedShiftsPage.getShiftRow(longName);
    await expect(row).toBeVisible();

    // Direct reload and verify stability
    await authenticatedShiftsPage.reloadPage();
    await authenticatedShiftsPage.search(longName);
    await expect(authenticatedShiftsPage.getShiftRow(longName)).toBeVisible();
  });
});
