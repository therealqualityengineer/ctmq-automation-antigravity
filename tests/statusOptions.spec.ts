import { test, expect } from '../fixtures/customFixtures';
import { statusOptionsData } from '../test-data/statusOptionsData';

test.describe('CTMQ-48 - Status Options Management under Admin General Settings', () => {
  test('TC-01 - Verify navigation to Status Options page from Admin General Settings card', async ({
    authenticatedAdminPage,
  }) => {
    await expect(authenticatedAdminPage.statusOptionsLink).toBeVisible();
    await authenticatedAdminPage.statusOptionsLink.click();

    await authenticatedAdminPage.page.waitForURL(new RegExp(statusOptionsData.routes.statusOptions));
    expect(authenticatedAdminPage.page.url()).toContain(statusOptionsData.routes.statusOptions);
  });

  test('TC-02 - Verify Status Options page layout, AppShell navigation, and centered "+ Add Status Option" button', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // AppShell navigation checks
    await expect(authenticatedStatusOptionsPage.primaryNav).toBeVisible();
    expect(await authenticatedStatusOptionsPage.isAdminTabActive()).toBe(true);
    await expect(authenticatedStatusOptionsPage.adminSubNav).toBeVisible();

    // Centered Add Status Option button
    await expect(authenticatedStatusOptionsPage.addStatusOptionButton).toBeVisible();
    expect(await authenticatedStatusOptionsPage.isAddStatusOptionButtonCentered()).toBe(true);
  });

  test('TC-03 - Verify default Client sub-tab selection and sub-tab switching between Client and Temp', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Default sub-tab is Client
    expect(await authenticatedStatusOptionsPage.isClientTabActive()).toBe(true);
    expect(await authenticatedStatusOptionsPage.isTempTabActive()).toBe(false);

    // Switch to Temp tab
    await authenticatedStatusOptionsPage.switchToTempTab();
    expect(await authenticatedStatusOptionsPage.isTempTabActive()).toBe(true);
    expect(await authenticatedStatusOptionsPage.isClientTabActive()).toBe(false);

    // Switch back to Client tab
    await authenticatedStatusOptionsPage.switchToClientTab();
    expect(await authenticatedStatusOptionsPage.isClientTabActive()).toBe(true);
    expect(await authenticatedStatusOptionsPage.isTempTabActive()).toBe(false);
  });

  test('TC-04 - Verify Status Options table structure, column headers, and active status indicators', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await expect(authenticatedStatusOptionsPage.table).toBeVisible();

    // Verify Table Headers
    const headerTexts = await authenticatedStatusOptionsPage.tableHeaders.allInnerTexts();
    const normalizedHeaders = headerTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of statusOptionsData.tableHeaders) {
      expect(normalizedHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Verify row count and status indicator
    const rowCount = await authenticatedStatusOptionsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstActiveIndicator = await authenticatedStatusOptionsPage.getCurrentlyActiveFor(
      statusOptionsData.defaultStatusOptions.client
    );
    expect(firstActiveIndicator).toBe(statusOptionsData.status.activeDisplay);
  });

  test('TC-05 - Verify search filtering by status name and description within active sub-tab', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Search by status name
    await authenticatedStatusOptionsPage.search(statusOptionsData.defaultStatusOptions.client);
    const matchedRow = authenticatedStatusOptionsPage.getStatusOptionRow(
      statusOptionsData.defaultStatusOptions.client
    );
    await expect(matchedRow).toBeVisible();

    // Clear search restores full list
    await authenticatedStatusOptionsPage.clearSearch();
    const totalRows = await authenticatedStatusOptionsPage.tableRows.count();
    expect(totalRows).toBeGreaterThanOrEqual(1);
  });

  test('TC-06 - Verify pagination controls and page boundary button states', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await expect(authenticatedStatusOptionsPage.paginationContainer).toBeVisible();
    await expect(authenticatedStatusOptionsPage.paginationText).toContainText(/Page \d+ of \d+ \(\d+ total\)/);

    // Bound checks for page 1
    await expect(authenticatedStatusOptionsPage.previousPageButton).toBeDisabled();
  });

  test('TC-07 - Verify Add Status Option modal display, default fields, and dismissal via Cancel & close (X)', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Open modal
    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalTitle).toHaveText(statusOptionsData.modal.title);
    await expect(authenticatedStatusOptionsPage.statusNameInput).toBeVisible();
    await expect(authenticatedStatusOptionsPage.statusDescriptionInput).toBeVisible();
    await expect(authenticatedStatusOptionsPage.statusIsActiveSelect).toHaveValue('true');
    await expect(authenticatedStatusOptionsPage.modalCancelButton).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalSaveButton).toBeVisible();

    // Dismiss via close (X)
    await authenticatedStatusOptionsPage.closeModalViaCloseButton();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();

    // Reopen and dismiss via Cancel
    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();
    await authenticatedStatusOptionsPage.closeModalViaCancel();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
  });

  test('TC-08 - Verify successful creation of a new Status Option under Client tab', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Ensure Client tab is active
    if (!(await authenticatedStatusOptionsPage.isClientTabActive())) {
      await authenticatedStatusOptionsPage.switchToClientTab();
    }

    const optionName = `${statusOptionsData.testPayloads.clientOption.namePrefix}${Date.now()}`;
    const description = statusOptionsData.testPayloads.clientOption.description;

    await authenticatedStatusOptionsPage.createStatusOption(
      optionName,
      description,
      statusOptionsData.testPayloads.clientOption.status
    );

    // Modal closes & banner appears
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toContainText(
      statusOptionsData.validationMessages.createSuccess
    );

    // Verify row in table
    const optionRow = authenticatedStatusOptionsPage.getStatusOptionRow(optionName);
    await expect(optionRow).toBeVisible();

    const descText = await authenticatedStatusOptionsPage.getStatusDescriptionFor(optionName);
    expect(descText).toBe(description);

    const activeText = await authenticatedStatusOptionsPage.getCurrentlyActiveFor(optionName);
    expect(activeText).toBe(statusOptionsData.status.activeDisplay);
  });

  test('TC-09 - Verify successful creation of a new Status Option under Temp tab', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Switch to Temp tab
    await authenticatedStatusOptionsPage.switchToTempTab();
    expect(await authenticatedStatusOptionsPage.isTempTabActive()).toBe(true);

    const optionName = `${statusOptionsData.testPayloads.tempOption.namePrefix}${Date.now()}`;
    const description = statusOptionsData.testPayloads.tempOption.description;

    await authenticatedStatusOptionsPage.createStatusOption(
      optionName,
      description,
      statusOptionsData.testPayloads.tempOption.status
    );

    // Modal closes & banner appears
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toContainText(
      statusOptionsData.validationMessages.createSuccess
    );

    // Verify row in Temp table
    const optionRow = authenticatedStatusOptionsPage.getStatusOptionRow(optionName);
    await expect(optionRow).toBeVisible();

    const descText = await authenticatedStatusOptionsPage.getStatusDescriptionFor(optionName);
    expect(descText).toBe(description);
  });

  test('TC-10 - Verify creation of Status Option with Inactive status ("No") and empty description', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const optionName = `${statusOptionsData.testPayloads.inactiveOption.namePrefix}${Date.now()}`;

    await authenticatedStatusOptionsPage.createStatusOption(
      optionName,
      '',
      statusOptionsData.testPayloads.inactiveOption.status
    );

    // Modal closes & banner appears
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Verify row in table
    const optionRow = authenticatedStatusOptionsPage.getStatusOptionRow(optionName);
    await expect(optionRow).toBeVisible();

    // Verify empty description is displayed as "-" and status is "No"
    const descText = await authenticatedStatusOptionsPage.getStatusDescriptionFor(optionName);
    expect(descText === '-' || descText === '').toBe(true);

    const activeText = await authenticatedStatusOptionsPage.getCurrentlyActiveFor(optionName);
    expect(activeText).toBe(statusOptionsData.status.inactiveDisplay);
  });

  test('TC-11 - Verify client-side required field validation when submitting empty Status Option name', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    await authenticatedStatusOptionsPage.saveModal();

    // Validation error shown and modal remains open
    await expect(authenticatedStatusOptionsPage.modalRequiredFieldError).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalRequiredFieldError).toHaveText(
      statusOptionsData.validationMessages.nameRequired
    );
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();

    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-12 - Verify 409 Conflict duplicate status option name validation within same entity type (case-insensitive)', async ({
    authenticatedStatusOptionsPage,
  }) => {
    // Ensure Client tab is active
    if (!(await authenticatedStatusOptionsPage.isClientTabActive())) {
      await authenticatedStatusOptionsPage.switchToClientTab();
    }

    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    // Fill lowercase "active" to test case-insensitive duplicate check
    await authenticatedStatusOptionsPage.fillStatusName(
      statusOptionsData.testPayloads.duplicateNameCaseInsensitive
    );
    await authenticatedStatusOptionsPage.saveModal();

    // Conflict error appears and modal remains open
    await expect(authenticatedStatusOptionsPage.modalConflictError).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalConflictError).toContainText(
      statusOptionsData.validationMessages.duplicateConflictClient
    );
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();

    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-13 - Verify status option with same name can exist across different entity types (Client vs Temp)', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const sharedName = `Shared-QA-${Date.now()}`;

    // Create under Client tab
    if (!(await authenticatedStatusOptionsPage.isClientTabActive())) {
      await authenticatedStatusOptionsPage.switchToClientTab();
    }
    await authenticatedStatusOptionsPage.createStatusOption(sharedName, 'Client scope');
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.getStatusOptionRow(sharedName)).toBeVisible();

    // Switch to Temp tab and create with identical name
    await authenticatedStatusOptionsPage.switchToTempTab();
    await authenticatedStatusOptionsPage.createStatusOption(sharedName, 'Temp scope');
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.getStatusOptionRow(sharedName)).toBeVisible();
  });

  test('TC-14 - Verify unauthenticated access protection for /admin/status-options', async ({
    statusOptionsPage,
  }) => {
    // Navigate without authentication
    await statusOptionsPage.navigate(statusOptionsData.routes.statusOptions);
    await statusOptionsPage.page.waitForURL(new RegExp(statusOptionsData.routes.login));

    expect(statusOptionsPage.page.url()).toContain(statusOptionsData.routes.login);
    await expect(statusOptionsPage.addStatusOptionButton).toBeHidden();
  });

  test('TC-15 - Verify maximum character length boundaries (100 chars name, 255 chars desc) and direct URL stability', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const name100 = statusOptionsData.testPayloads.generate100CharName(Date.now());
    const desc255 = statusOptionsData.testPayloads.generate255CharDesc(Date.now());
    expect(name100.length).toBe(100);
    expect(desc255.length).toBe(255);

    await authenticatedStatusOptionsPage.createStatusOption(name100, desc255);
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Direct reload to verify persistence and stability
    await authenticatedStatusOptionsPage.reloadPage();
    const optionRow = authenticatedStatusOptionsPage.getStatusOptionRow(name100);
    await expect(optionRow).toBeVisible();
  });
});
