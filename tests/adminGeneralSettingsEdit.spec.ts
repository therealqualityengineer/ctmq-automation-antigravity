import { test, expect } from '../fixtures/customFixtures';
import { adminGeneralSettingsEditData } from '../test-data/adminGeneralSettingsEditData';

test.describe('CTMQ-53 - Admin General Settings: Edit Shifts, Order Types, and Status Options', () => {

  test('TC-01 - Verify editing Shift Option updates times, default status, displays FeedbackBanner, and updates list', async ({
    authenticatedShiftsPage,
  }) => {
    await authenticatedShiftsPage.gotoShifts();
    const shiftName = `Edit-Shift-${Date.now()}`;
    await authenticatedShiftsPage.createShift(
      shiftName,
      adminGeneralSettingsEditData.testPayloads.shiftEdit.initialStartTime,
      adminGeneralSettingsEditData.testPayloads.shiftEdit.initialEndTime,
      false
    );

    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await authenticatedShiftsPage.search(shiftName);
    const row = authenticatedShiftsPage.getShiftRow(shiftName);
    await expect(row).toBeVisible();

    // Open Edit Modal
    await authenticatedShiftsPage.openEditShiftModal(shiftName);
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.editShift
    );

    // Update times and default flag
    await authenticatedShiftsPage.updateShift(
      adminGeneralSettingsEditData.testPayloads.shiftEdit.updatedStartTime,
      adminGeneralSettingsEditData.testPayloads.shiftEdit.updatedEndTime,
      true
    );

    // Modal closes & success banner appears
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedShiftsPage.feedbackBanner).toContainText(
      adminGeneralSettingsEditData.successBanners.shiftUpdated
    );

    // Row reflects updated values with web-first assertions
    await expect(row.locator('td').nth(4)).toHaveText('Yes');
    await expect(row.locator('td').nth(2)).toContainText(
      adminGeneralSettingsEditData.testPayloads.shiftEdit.updatedStartTimeDisplay
    );
    await expect(row.locator('td').nth(3)).toContainText(
      adminGeneralSettingsEditData.testPayloads.shiftEdit.updatedEndTimeDisplay
    );
  });

  test('TC-02 - Verify editing Order Type updates status, default setting, displays FeedbackBanner, and updates list', async ({
    authenticatedOrderTypesPage,
  }) => {
    await authenticatedOrderTypesPage.gotoOrderTypes();
    const orderTypeName = `Edit-OT-${Date.now()}`;
    await authenticatedOrderTypesPage.createOrderType({
      name: orderTypeName,
      status: adminGeneralSettingsEditData.testPayloads.orderTypeEdit.statusActive,
      isDefault: 'No',
    });

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await authenticatedOrderTypesPage.search(orderTypeName);
    const row = authenticatedOrderTypesPage.getOrderTypeRow(orderTypeName);
    await expect(row).toBeVisible();

    // Open Edit Modal
    await authenticatedOrderTypesPage.openEditOrderTypeModal(orderTypeName);
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.editOrderType
    );

    // Update status to Hidden and default to Yes
    await authenticatedOrderTypesPage.updateOrderType({
      status: adminGeneralSettingsEditData.testPayloads.orderTypeEdit.statusHidden,
      isDefault: 'Yes',
    });

    // Modal closes & success banner appears
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toContainText(
      adminGeneralSettingsEditData.successBanners.orderTypeUpdated
    );

    // Row reflects updated values
    const statusPill = await authenticatedOrderTypesPage.getStatusPillFor(orderTypeName);
    await expect(statusPill).toHaveText(
      adminGeneralSettingsEditData.testPayloads.orderTypeEdit.statusHidden
    );

    const defaultIndicator = await authenticatedOrderTypesPage.getDefaultIndicatorFor(orderTypeName);
    await expect(defaultIndicator).toHaveText('Yes');
  });

  test('TC-03 - Verify editing Status Option updates description, active state, display order, displays FeedbackBanner, and updates list', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    const statusName = `Edit-SO-${Date.now()}`;
    await authenticatedStatusOptionsPage.createStatusOption(
      statusName,
      'Initial description',
      'Active'
    );

    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await authenticatedStatusOptionsPage.search(statusName);
    const row = authenticatedStatusOptionsPage.getStatusOptionRow(statusName);
    await expect(row).toBeVisible();

    // Open Edit Modal
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.editStatusOption
    );

    // Update description, active state, and display order
    await authenticatedStatusOptionsPage.updateStatusOption({
      description: adminGeneralSettingsEditData.testPayloads.statusOptionEdit.updatedDescription,
      isActive: 'Inactive',
      displayOrder: adminGeneralSettingsEditData.testPayloads.statusOptionEdit.displayOrderBoundaryMid,
    });

    // Modal closes & success banner appears
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toContainText(
      adminGeneralSettingsEditData.successBanners.statusOptionUpdated
    );

    // Row reflects updated values with web-first assertions
    await expect(row.locator('td').nth(2)).toHaveText(
      adminGeneralSettingsEditData.testPayloads.statusOptionEdit.updatedDescription
    );
    await expect(row.locator('td').nth(3)).toHaveText('No');
  });

  test('TC-04 - Verify backward compatibility: Add Shift, Add Order Type, and Add Status Option modals open in Create mode with editable names', async ({
    authenticatedShiftsPage,
    authenticatedOrderTypesPage,
    authenticatedStatusOptionsPage,
  }) => {
    // 1. Shifts: Add modal
    await authenticatedShiftsPage.gotoShifts();
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.addShift
    );
    await expect(authenticatedShiftsPage.shiftNameInput).not.toBeDisabled();
    expect(await authenticatedShiftsPage.shiftNameInput.inputValue()).toBe('');
    await authenticatedShiftsPage.closeModalViaCancel();

    // 2. Order Types: Add modal
    await authenticatedOrderTypesPage.gotoOrderTypes();
    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.addOrderType
    );
    await expect(authenticatedOrderTypesPage.nameInput).not.toBeDisabled();
    expect(await authenticatedOrderTypesPage.nameInput.inputValue()).toBe('');
    await authenticatedOrderTypesPage.closeModalViaCancel();

    // 3. Status Options: Add modal
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalTitle).toHaveText(
      adminGeneralSettingsEditData.modalTitles.addStatusOption
    );
    await expect(authenticatedStatusOptionsPage.statusNameInput).not.toBeDisabled();
    expect(await authenticatedStatusOptionsPage.statusNameInput.inputValue()).toBe('');
    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-05 - Verify entity names are immutable / disabled in Edit mode across Shifts, Order Types, and Status Options modals', async ({
    authenticatedShiftsPage,
    authenticatedOrderTypesPage,
    authenticatedStatusOptionsPage,
  }) => {
    // 1. Shift: Verify disabled name in Edit mode
    await authenticatedShiftsPage.gotoShifts();
    await authenticatedShiftsPage.openEditShiftModalByRow(0);
    await expect(authenticatedShiftsPage.shiftNameInput).toBeDisabled();
    await expect(authenticatedShiftsPage.shiftNameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.cursorNotAllowed
    );
    await expect(authenticatedShiftsPage.shiftNameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.bgDisabled
    );
    await authenticatedShiftsPage.closeModalViaCancel();

    // 2. Order Type: Verify disabled name in Edit mode
    await authenticatedOrderTypesPage.gotoOrderTypes();
    await authenticatedOrderTypesPage.openEditOrderTypeModalByRow(0);
    await expect(authenticatedOrderTypesPage.nameInput).toBeDisabled();
    await expect(authenticatedOrderTypesPage.nameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.cursorNotAllowed
    );
    await expect(authenticatedOrderTypesPage.nameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.bgDisabled
    );
    await authenticatedOrderTypesPage.closeModalViaCancel();

    // 3. Status Option: Verify disabled name in Edit mode
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    await authenticatedStatusOptionsPage.openEditStatusOptionModalByRow(0);
    await expect(authenticatedStatusOptionsPage.statusNameInput).toBeDisabled();
    await expect(authenticatedStatusOptionsPage.statusNameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.cursorNotAllowed
    );
    await expect(authenticatedStatusOptionsPage.statusNameInput).toHaveClass(
      adminGeneralSettingsEditData.immutableFieldClasses.bgDisabled
    );
    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-06 - Verify Shift edit validation blocks submission when required times are cleared', async ({
    authenticatedShiftsPage,
  }) => {
    await authenticatedShiftsPage.gotoShifts();
    await authenticatedShiftsPage.openEditShiftModalByRow(0);
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();

    // Clear start time
    await authenticatedShiftsPage.startTimeInput.fill('');
    await authenticatedShiftsPage.saveModal();

    // Modal remains visible and required error message appears
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(
      authenticatedShiftsPage.modalDialog.getByText(/Start Time is required/i)
    ).toBeVisible();

    await authenticatedShiftsPage.closeModalViaCancel();
  });

  test('TC-07 - Verify Status Option edit validation prevents invalid display order values', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    await authenticatedStatusOptionsPage.openEditStatusOptionModalByRow(0);
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();

    // Enter negative display order (violating min="0")
    await authenticatedStatusOptionsPage.fillDisplayOrder(-10);
    await authenticatedStatusOptionsPage.saveModal();

    // Modal remains open and blocked by HTML5 or validation rule
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();
    const isOrderInvalid = await authenticatedStatusOptionsPage.isFieldInvalid(
      authenticatedStatusOptionsPage.statusDisplayOrderInput
    );
    expect(isOrderInvalid).toBe(true);

    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-08 - Verify dismissing Edit modal via Cancel or Close (X) discards changes without updating records', async ({
    authenticatedShiftsPage,
    authenticatedOrderTypesPage,
    authenticatedStatusOptionsPage,
  }) => {
    // 1. Shift: Modify Start Time then Cancel
    await authenticatedShiftsPage.gotoShifts();
    const shiftName = `Discard-Shift-${Date.now()}`;
    await authenticatedShiftsPage.createShift(shiftName, '08:00 AM', '04:00 PM', false);
    await authenticatedShiftsPage.openEditShiftModal(shiftName);
    await authenticatedShiftsPage.fillStartTime('11:00 AM');
    await authenticatedShiftsPage.closeModalViaCancel();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    const originalStartTime = await authenticatedShiftsPage.getStartTimeFor(shiftName);
    expect(originalStartTime).not.toContain('11:00');

    // 2. Order Type: Modify Status then dismiss via Close (X)
    await authenticatedOrderTypesPage.gotoOrderTypes();
    const orderTypeName = `Discard-OT-${Date.now()}`;
    await authenticatedOrderTypesPage.createOrderType({ name: orderTypeName, status: 'Active' });
    await authenticatedOrderTypesPage.openEditOrderTypeModal(orderTypeName);
    await authenticatedOrderTypesPage.selectStatus('Hidden');
    await authenticatedOrderTypesPage.closeModalViaCloseButton();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    const statusPill = await authenticatedOrderTypesPage.getStatusPillFor(orderTypeName);
    await expect(statusPill).toHaveText('Active');

    // 3. Status Option: Modify Description then Cancel
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    const statusName = `Discard-SO-${Date.now()}`;
    await authenticatedStatusOptionsPage.createStatusOption(statusName, 'Original Description');
    await authenticatedStatusOptionsPage.search(statusName);
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await authenticatedStatusOptionsPage.fillDescription('Unsaved Alteration');
    await authenticatedStatusOptionsPage.closeModalViaCancel();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    const currentDesc = await authenticatedStatusOptionsPage.getStatusDescriptionFor(statusName);
    expect(currentDesc).toBe('Original Description');
  });

  test('TC-09 - Verify Status Option Display Order boundary values (0, 999) persist accurately', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await authenticatedStatusOptionsPage.gotoStatusOptions();
    const statusName = `Boundary-SO-${Date.now()}`;
    await authenticatedStatusOptionsPage.createStatusOption(statusName, 'Boundary test');

    // Filter by name so it is isolated
    await authenticatedStatusOptionsPage.search(statusName);

    // Test minimum boundary (0)
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await authenticatedStatusOptionsPage.updateStatusOption({
      displayOrder: adminGeneralSettingsEditData.testPayloads.statusOptionEdit.displayOrderBoundaryMin,
    });
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Verify persisted value in modal
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await expect(authenticatedStatusOptionsPage.statusDisplayOrderInput).toHaveValue('0');
    await authenticatedStatusOptionsPage.closeModalViaCancel();

    // Test high boundary (999)
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await authenticatedStatusOptionsPage.updateStatusOption({
      displayOrder: adminGeneralSettingsEditData.testPayloads.statusOptionEdit.displayOrderBoundaryHigh,
    });
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Verify persisted value in modal
    await authenticatedStatusOptionsPage.openEditStatusOptionModal(statusName);
    await expect(authenticatedStatusOptionsPage.statusDisplayOrderInput).toHaveValue('999');
    await authenticatedStatusOptionsPage.closeModalViaCancel();
  });

  test('TC-10 - Verify toggling Default flag between Yes and No for Shifts and Order Types persists accurately', async ({
    authenticatedShiftsPage,
    authenticatedOrderTypesPage,
  }) => {
    // 1. Shift: Toggle Default No -> Yes -> No
    await authenticatedShiftsPage.gotoShifts();
    const shiftName = `Toggle-Shift-${Date.now()}`;
    await authenticatedShiftsPage.createShift(shiftName, '08:00 AM', '04:00 PM', false);
    await authenticatedShiftsPage.search(shiftName);
    const shiftRow = authenticatedShiftsPage.getShiftRow(shiftName);
    await expect(shiftRow.locator('td').nth(4)).toHaveText('No');

    // Toggle to Yes
    await authenticatedShiftsPage.openEditShiftModal(shiftName);
    await authenticatedShiftsPage.setDefaultShift(true);
    await authenticatedShiftsPage.saveModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();
    await expect(shiftRow.locator('td').nth(4)).toHaveText('Yes');

    // Toggle back to No
    await authenticatedShiftsPage.openEditShiftModal(shiftName);
    await authenticatedShiftsPage.setDefaultShift(false);
    await authenticatedShiftsPage.saveModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();
    await expect(shiftRow.locator('td').nth(4)).toHaveText('No');

    // 2. Order Type: Toggle Default No -> Yes -> No
    await authenticatedOrderTypesPage.gotoOrderTypes();
    const orderTypeName = `Toggle-OT-${Date.now()}`;
    await authenticatedOrderTypesPage.createOrderType({ name: orderTypeName, isDefault: 'No' });
    await authenticatedOrderTypesPage.search(orderTypeName);
    const indicatorBefore = await authenticatedOrderTypesPage.getDefaultIndicatorFor(orderTypeName);
    await expect(indicatorBefore).toHaveText('No');

    // Toggle to Yes
    await authenticatedOrderTypesPage.openEditOrderTypeModal(orderTypeName);
    await authenticatedOrderTypesPage.selectDefault('Yes');
    await authenticatedOrderTypesPage.saveModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();
    const indicatorYes = await authenticatedOrderTypesPage.getDefaultIndicatorFor(orderTypeName);
    await expect(indicatorYes).toHaveText('Yes');

    // Toggle back to No
    await authenticatedOrderTypesPage.openEditOrderTypeModal(orderTypeName);
    await authenticatedOrderTypesPage.selectDefault('No');
    await authenticatedOrderTypesPage.saveModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();
    const indicatorNo = await authenticatedOrderTypesPage.getDefaultIndicatorFor(orderTypeName);
    await expect(indicatorNo).toHaveText('No');
  });
});
