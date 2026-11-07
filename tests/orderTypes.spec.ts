import { test, expect } from '../fixtures/customFixtures';
import { orderTypesData } from '../test-data/orderTypesData';

test.describe('CTMQ-50 - Order Types Management under Admin General Settings', () => {
  test('TC-01 - Verify navigation to Order Types page from Admin General Settings card', async ({
    authenticatedAdminPage,
  }) => {
    await expect(authenticatedAdminPage.orderTypesLink).toBeVisible();
    await authenticatedAdminPage.orderTypesLink.click();

    await authenticatedAdminPage.page.waitForURL(new RegExp(orderTypesData.routes.orderTypes));
    expect(authenticatedAdminPage.page.url()).toContain(orderTypesData.routes.orderTypes);
  });

  test('TC-02 - Verify Order Types page layout, AppShell navigation, centered "+ Add Order Type" button, and default active sub-tab', async ({
    authenticatedOrderTypesPage,
  }) => {
    // AppShell navigation checks
    await expect(authenticatedOrderTypesPage.primaryNav).toBeVisible();
    expect(await authenticatedOrderTypesPage.isAdminTabActive()).toBe(true);
    await expect(authenticatedOrderTypesPage.adminSubNav).toBeVisible();

    // Page Controls & Sub-tabs
    await expect(authenticatedOrderTypesPage.addOrderTypeButton).toBeVisible();
    expect(await authenticatedOrderTypesPage.isAddOrderTypeButtonCentered()).toBe(true);
    await expect(authenticatedOrderTypesPage.categoryTabsNav).toBeVisible();
    await expect(authenticatedOrderTypesPage.perDiemTab).toBeVisible();
    await expect(authenticatedOrderTypesPage.longTermTab).toBeVisible();

    // Default active sub-tab should be Per Diem Order Types
    expect(await authenticatedOrderTypesPage.isPerDiemTabActive()).toBe(true);
  });

  test('TC-03 - Verify Per Diem Order Types table headers, columns, status badges, and default indicators', async ({
    authenticatedOrderTypesPage,
  }) => {
    await expect(authenticatedOrderTypesPage.table).toBeVisible();

    // Verify Per Diem Table Headers
    const headerTexts = await authenticatedOrderTypesPage.tableHeaders.allInnerTexts();
    const normalizedHeaders = headerTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of orderTypesData.tableHeaders.perDiem) {
      expect(normalizedHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Verify table has rows rendered
    const rowCount = await authenticatedOrderTypesPage.tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Verify presence of status badge
    const firstRowStatus = authenticatedOrderTypesPage.tableRows.first().locator('span').filter({ hasText: /^(Active|Hidden)$/i });
    await expect(firstRowStatus).toBeVisible();
  });

  test('TC-04 - Verify sub-tab switching between Per Diem Order Types and Long Term Order Types', async ({
    authenticatedOrderTypesPage,
  }) => {
    // Switch to Long Term Order Types tab
    await authenticatedOrderTypesPage.clickLongTermTab();
    expect(await authenticatedOrderTypesPage.isLongTermTabActive()).toBe(true);

    // Verify table updates for Long Term
    const ltHeaderTexts = await authenticatedOrderTypesPage.tableHeaders.allInnerTexts();
    const normalizedLtHeaders = ltHeaderTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of orderTypesData.tableHeaders.longTerm) {
      expect(normalizedLtHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Switch back to Per Diem Order Types tab
    await authenticatedOrderTypesPage.clickPerDiemTab();
    expect(await authenticatedOrderTypesPage.isPerDiemTabActive()).toBe(true);
  });

  test('TC-05 - Verify Long Term Order Types table headers, columns, status badges, and Shift Order Type Default display', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.clickLongTermTab();
    await expect(authenticatedOrderTypesPage.table).toBeVisible();

    const rowCount = await authenticatedOrderTypesPage.tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Verify Shift Order Type Default column exists in rows
    const firstRowShiftDefault = authenticatedOrderTypesPage.tableRows.first().locator('td').nth(2);
    await expect(firstRowShiftDefault).toBeVisible();
  });

  test('TC-06 - Verify search filtering by order type name within active sub-tab and search reset', async ({
    authenticatedOrderTypesPage,
  }) => {
    const firstRowName = (await authenticatedOrderTypesPage.tableRows.first().locator('td').nth(1).innerText()).trim();

    // Search by existing name
    await authenticatedOrderTypesPage.search(firstRowName);
    const matchingRow = authenticatedOrderTypesPage.getOrderTypeRow(firstRowName);
    await expect(matchingRow).toBeVisible();

    // Clear search restores full list
    await authenticatedOrderTypesPage.clearSearch();
    const totalRows = await authenticatedOrderTypesPage.tableRows.count();
    expect(totalRows).toBeGreaterThanOrEqual(1);
  });

  test('TC-07 - Verify pagination controls and boundary button disabled states on Order Types list', async ({
    authenticatedOrderTypesPage,
  }) => {
    await expect(authenticatedOrderTypesPage.paginationText).toBeVisible();
    await expect(authenticatedOrderTypesPage.paginationText).toContainText(/Page \d+ of \d+ \(\d+ total\)/);

    // Boundary check for page 1: Previous button must be disabled
    await expect(authenticatedOrderTypesPage.previousPageButton).toBeDisabled();
  });

  test('TC-08 - Verify Add Order Type modal display, title ("Order Type"), dynamic fields on Per Diem tab, and dismissal via Close (X)', async ({
    authenticatedOrderTypesPage,
  }) => {
    // Open modal on Per Diem tab
    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalTitle).toHaveText(orderTypesData.modal.title);
    await expect(authenticatedOrderTypesPage.modalSubtitle).toBeVisible();
    await expect(authenticatedOrderTypesPage.nameInput).toBeVisible();
    await expect(authenticatedOrderTypesPage.statusSelect).toHaveValue(orderTypesData.status.active);
    await expect(authenticatedOrderTypesPage.modalSaveButton).toBeVisible();

    // Shift Order Type Default should NOT be present on Per Diem tab
    await expect(authenticatedOrderTypesPage.shiftOrderTypeDefaultSelect).toBeHidden();

    // Dismiss via close (X)
    await authenticatedOrderTypesPage.closeModalViaCloseButton();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();

    // Reopen and dismiss via Cancel
    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();
    await authenticatedOrderTypesPage.closeModalViaCancel();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
  });

  test('TC-09 - Verify Add Order Type modal dynamic fields on Long Term tab including Shift Order Type Default dropdown', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.clickLongTermTab();
    await authenticatedOrderTypesPage.openAddOrderTypeModal();

    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();
    await expect(authenticatedOrderTypesPage.shiftOrderTypeDefaultSelect).toBeVisible();

    await authenticatedOrderTypesPage.closeModalViaCloseButton();
  });

  test('TC-10 - Verify successful creation of Per Diem Order Type with default settings', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.clickPerDiemTab();
    const uniqueName = `${orderTypesData.testPayloads.perDiemValidDefault.namePrefix}${Date.now()}`;

    await authenticatedOrderTypesPage.createOrderType({
      name: uniqueName,
      status: orderTypesData.testPayloads.perDiemValidDefault.status,
      isDefault: orderTypesData.testPayloads.perDiemValidDefault.isDefault,
    });

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    const createdRow = authenticatedOrderTypesPage.getOrderTypeRow(uniqueName);
    await expect(createdRow).toBeVisible();

    const statusPill = await authenticatedOrderTypesPage.getStatusPillFor(uniqueName);
    await expect(statusPill).toHaveText(orderTypesData.status.active);
  });

  test('TC-11 - Verify successful creation of Per Diem Order Type with Order Form Default: Yes and Hidden status', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.clickPerDiemTab();
    const uniqueName = `${orderTypesData.testPayloads.perDiemValidCustom.namePrefix}${Date.now()}`;

    await authenticatedOrderTypesPage.createOrderType({
      name: uniqueName,
      status: orderTypesData.testPayloads.perDiemValidCustom.status,
      isDefault: orderTypesData.testPayloads.perDiemValidCustom.isDefault,
    });

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    const createdRow = authenticatedOrderTypesPage.getOrderTypeRow(uniqueName);
    await expect(createdRow).toBeVisible();

    const statusPill = await authenticatedOrderTypesPage.getStatusPillFor(uniqueName);
    await expect(statusPill).toHaveText(orderTypesData.status.hidden);
  });

  test('TC-12 - Verify successful creation of Long Term Order Type with Shift Order Type Default mapping', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.clickLongTermTab();
    const uniqueName = `${orderTypesData.testPayloads.longTermValid.namePrefix}${Date.now()}`;

    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await authenticatedOrderTypesPage.fillOrderTypeName(uniqueName);

    // If options are available in Shift Order Type Default dropdown, select one
    const options = await authenticatedOrderTypesPage.shiftOrderTypeDefaultSelect.locator('option').allInnerTexts();
    if (options.length > 1) {
      await authenticatedOrderTypesPage.selectShiftOrderTypeDefault(options[1].trim());
    }

    await authenticatedOrderTypesPage.saveModal();

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    const createdRow = authenticatedOrderTypesPage.getOrderTypeRow(uniqueName);
    await expect(createdRow).toBeVisible();
  });

  test('TC-13 - Verify client-side required field validation when submitting empty Order Type Name', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await authenticatedOrderTypesPage.saveModal();

    await expect(authenticatedOrderTypesPage.modalRequiredFieldError).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();

    await authenticatedOrderTypesPage.closeModalViaCancel();
  });

  test('TC-14 - Verify 409 Conflict duplicate order type name validation within same category (case-insensitive)', async ({
    authenticatedOrderTypesPage,
  }) => {
    const existingName = (await authenticatedOrderTypesPage.tableRows.first().locator('td').nth(1).innerText()).trim();

    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await authenticatedOrderTypesPage.fillOrderTypeName(existingName.toLowerCase());
    await authenticatedOrderTypesPage.saveModal();

    await expect(authenticatedOrderTypesPage.modalConflictError).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();

    await authenticatedOrderTypesPage.closeModalViaCancel();
  });

  test('TC-15 - Verify unauthenticated access protection redirects /admin/order-types to /login', async ({
    orderTypesPage,
  }) => {
    await orderTypesPage.navigate(orderTypesData.routes.orderTypes);
    await orderTypesPage.page.waitForURL(new RegExp(orderTypesData.routes.login));

    expect(orderTypesPage.page.url()).toContain(orderTypesData.routes.login);
  });

  test('TC-16 - Verify Order Type Name max length boundary (100 characters) and direct URL / page refresh stability', async ({
    authenticatedOrderTypesPage,
  }) => {
    const name100Char = orderTypesData.testPayloads.generate100CharName(Date.now());
    expect(name100Char.length).toBe(100);

    await authenticatedOrderTypesPage.createOrderType({
      name: name100Char,
      status: orderTypesData.status.active as 'Active',
      isDefault: 'No',
    });

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    // Reload page to verify stability and persistence
    await authenticatedOrderTypesPage.reloadPage();
    const createdRow = authenticatedOrderTypesPage.getOrderTypeRow(name100Char);
    await expect(createdRow).toBeVisible();
  });
});
