import { test, expect } from '../fixtures/customFixtures';
import { adminModalSubmitResetData } from '../test-data/adminModalSubmitResetData';

test.describe('CTMQ-54 - Modal Submit Button Reset and Form Reusability in Admin General Settings', () => {

  test('TC-01 - Verify Shifts modal submit button resets to "Save" and remains enabled after successful save', async ({
    authenticatedShiftsPage,
  }) => {
    const shiftNameA = `${adminModalSubmitResetData.testPayloads.shifts.first.namePrefix}${Date.now()}`;
    await authenticatedShiftsPage.createShift(
      shiftNameA,
      adminModalSubmitResetData.testPayloads.shifts.first.startTime,
      adminModalSubmitResetData.testPayloads.shifts.first.endTime
    );

    // Initial save closes modal and displays success feedback
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();

    // Reopen Add Shift modal
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();

    // Verify submit button is enabled, clickable, and not stuck in "Saving..."
    await expect(authenticatedShiftsPage.modalSaveButton).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedShiftsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedShiftsPage.modalSaveButton).toHaveText(adminModalSubmitResetData.submitButtonText.shifts);

    // Verify subsequent shift can be saved immediately without page reload
    const shiftNameB = `${adminModalSubmitResetData.testPayloads.shifts.second.namePrefix}${Date.now()}`;
    await authenticatedShiftsPage.fillShiftName(shiftNameB);
    await authenticatedShiftsPage.fillStartTime(adminModalSubmitResetData.testPayloads.shifts.second.startTime);
    await authenticatedShiftsPage.fillEndTime(adminModalSubmitResetData.testPayloads.shifts.second.endTime);
    await authenticatedShiftsPage.saveModal();

    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();

    // Verify second shift is persisted in table via search
    await authenticatedShiftsPage.search(shiftNameB);
    await expect(authenticatedShiftsPage.getShiftRow(shiftNameB)).toBeVisible();
  });

  test('TC-02 - Verify Order Types modal submit button resets to "Save" and remains enabled after successful save', async ({
    authenticatedOrderTypesPage,
  }) => {
    const otNameA = `${adminModalSubmitResetData.testPayloads.orderTypes.first.namePrefix}${Date.now()}`;
    await authenticatedOrderTypesPage.createOrderType({
      name: otNameA,
      status: adminModalSubmitResetData.testPayloads.orderTypes.first.status,
      isDefault: adminModalSubmitResetData.testPayloads.orderTypes.first.isDefault,
    });

    // Initial save closes modal and displays feedback banner
    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    // Reopen Add Order Type modal
    await authenticatedOrderTypesPage.openAddOrderTypeModal();
    await expect(authenticatedOrderTypesPage.modalDialog).toBeVisible();

    // Verify submit button is enabled and not stuck in "Saving..."
    await expect(authenticatedOrderTypesPage.modalSaveButton).toBeVisible();
    await expect(authenticatedOrderTypesPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedOrderTypesPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedOrderTypesPage.modalSaveButton).toHaveText(adminModalSubmitResetData.submitButtonText.orderTypes);

    // Verify subsequent order type can be saved immediately
    const otNameB = `${adminModalSubmitResetData.testPayloads.orderTypes.second.namePrefix}${Date.now()}`;
    await authenticatedOrderTypesPage.fillOrderTypeName(otNameB);
    await authenticatedOrderTypesPage.selectStatus(adminModalSubmitResetData.testPayloads.orderTypes.second.status);
    await authenticatedOrderTypesPage.selectDefault(adminModalSubmitResetData.testPayloads.orderTypes.second.isDefault);
    await authenticatedOrderTypesPage.saveModal();

    await expect(authenticatedOrderTypesPage.modalDialog).toBeHidden();
    await expect(authenticatedOrderTypesPage.feedbackBanner).toBeVisible();

    // Verify second order type is persisted in table via search
    await authenticatedOrderTypesPage.search(otNameB);
    await expect(authenticatedOrderTypesPage.getOrderTypeRow(otNameB)).toBeVisible();
  });

  test('TC-03 - Verify Status Options modal submit button resets to "Save" and remains enabled after successful save', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const soNameA = `${adminModalSubmitResetData.testPayloads.statusOptions.first.namePrefix}${Date.now()}`;
    await authenticatedStatusOptionsPage.createStatusOption(
      soNameA,
      adminModalSubmitResetData.testPayloads.statusOptions.first.description
    );

    // Initial save closes modal and displays feedback banner
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Reopen Add Status Option modal
    await authenticatedStatusOptionsPage.openAddStatusOptionModal();
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeVisible();

    // Verify submit button is enabled and not stuck in "Saving..."
    await expect(authenticatedStatusOptionsPage.modalSaveButton).toBeVisible();
    await expect(authenticatedStatusOptionsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedStatusOptionsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedStatusOptionsPage.modalSaveButton).toHaveText(adminModalSubmitResetData.submitButtonText.statusOptions);

    // Verify subsequent status option can be saved immediately
    const soNameB = `${adminModalSubmitResetData.testPayloads.statusOptions.second.namePrefix}${Date.now()}`;
    await authenticatedStatusOptionsPage.fillStatusName(soNameB);
    await authenticatedStatusOptionsPage.fillStatusDescription(adminModalSubmitResetData.testPayloads.statusOptions.second.description);
    await authenticatedStatusOptionsPage.saveModal();

    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();
    await expect(authenticatedStatusOptionsPage.feedbackBanner).toBeVisible();

    // Verify second status option is persisted in table via search
    await authenticatedStatusOptionsPage.search(soNameB);
    await expect(authenticatedStatusOptionsPage.getStatusOptionRow(soNameB)).toBeVisible();
  });

  test('TC-04 - Verify Certifications modal submit button resets to "Save" and remains enabled after successful save', async ({
    authenticatedCertificationsPage,
  }) => {
    const certNameA = `${adminModalSubmitResetData.testPayloads.certifications.first.namePrefix}${Date.now()}`;
    await authenticatedCertificationsPage.createCertification(certNameA);

    // Initial save closes modal and displays feedback banner
    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();

    // Reopen Add Certification modal
    await authenticatedCertificationsPage.openAddCertModal();
    await expect(authenticatedCertificationsPage.modalDialog).toBeVisible();

    // Verify submit button is enabled and not stuck in "Saving..."
    await expect(authenticatedCertificationsPage.modalSaveButton).toBeVisible();
    await expect(authenticatedCertificationsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedCertificationsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedCertificationsPage.modalSaveButton).toHaveText(adminModalSubmitResetData.submitButtonText.certifications);

    // Verify subsequent certification can be saved immediately
    const certNameB = `${adminModalSubmitResetData.testPayloads.certifications.second.namePrefix}${Date.now()}`;
    await authenticatedCertificationsPage.fillCertName(certNameB);
    await authenticatedCertificationsPage.saveModal();

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();

    // Verify second certification is persisted in table via search
    await authenticatedCertificationsPage.search(certNameB);
    await expect(authenticatedCertificationsPage.getCertRow(certNameB)).toBeVisible();
  });

  test('TC-05 - Verify Specialties modal submit button resets to "Save" and remains enabled after successful save', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const specNameA = `${adminModalSubmitResetData.testPayloads.specialties.first.namePrefix}${Date.now()}`;
    await authenticatedSpecialtiesPage.createSpecialty(specNameA);

    // Initial save closes modal and displays feedback banner
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();

    // Reopen Add Specialty modal
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();

    // Verify submit button is enabled and not stuck in "Saving..."
    await expect(authenticatedSpecialtiesPage.modalSaveButton).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedSpecialtiesPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedSpecialtiesPage.modalSaveButton).toHaveText(adminModalSubmitResetData.submitButtonText.specialties);

    // Verify subsequent specialty can be saved immediately
    const specNameB = `${adminModalSubmitResetData.testPayloads.specialties.second.namePrefix}${Date.now()}`;
    await authenticatedSpecialtiesPage.fillSpecialtyName(specNameB);
    await authenticatedSpecialtiesPage.saveModal();

    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();

    // Verify second specialty is persisted in table via search
    await authenticatedSpecialtiesPage.search(specNameB);
    await expect(authenticatedSpecialtiesPage.getSpecialtyRow(specNameB)).toBeVisible();
  });

  test('TC-06 - Verify modal dismissal via Cancel or Close (X) preserves enabled "Save" button state on reopen', async ({
    authenticatedShiftsPage,
  }) => {
    // Open modal and dismiss via Cancel
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await authenticatedShiftsPage.fillShiftName('Discard Test Shift');
    await authenticatedShiftsPage.closeModalViaCancel();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();

    // Reopen and verify submit button is ready and inputs are clean
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedShiftsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await expect(authenticatedShiftsPage.shiftNameInput).toHaveValue('');

    // Partially fill and dismiss via Close (X)
    await authenticatedShiftsPage.fillShiftName('Close Button Test');
    await authenticatedShiftsPage.closeModalViaCloseButton();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();

    // Reopen and verify clean state
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedShiftsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);
    await authenticatedShiftsPage.closeModalViaCloseButton();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
  });

  test('TC-07 - Verify validation failure does not permanently lock the modal submit button', async ({
    authenticatedShiftsPage,
  }) => {
    // Open modal and submit empty form to trigger required field validation
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await authenticatedShiftsPage.saveModal();

    // Error is displayed, but submit button remains enabled and clickable
    await expect(authenticatedShiftsPage.modalRequiredFieldError).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedShiftsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);

    // Correct form fields and submit successfully
    const validShiftName = `Recover-Shift-${Date.now()}`;
    await authenticatedShiftsPage.fillShiftName(validShiftName);
    await authenticatedShiftsPage.fillStartTime('10:00 AM');
    await authenticatedShiftsPage.fillEndTime('06:00 PM');
    await authenticatedShiftsPage.saveModal();

    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    await expect(authenticatedShiftsPage.feedbackBanner).toBeVisible();

    // Search and verify in table
    await authenticatedShiftsPage.search(validShiftName);
    await expect(authenticatedShiftsPage.getShiftRow(validShiftName)).toBeVisible();
  });

  test('TC-08 - Verify rapid consecutive open and close toggles do not corrupt submit button state', async ({
    authenticatedShiftsPage,
  }) => {
    // Rapidly toggle Add modal open and close
    for (let i = 0; i < 3; i++) {
      await authenticatedShiftsPage.openAddShiftModal();
      await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
      await authenticatedShiftsPage.closeModalViaCloseButton();
      await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
    }

    // Open modal a 4th time and verify submit button remains enabled and functional
    await authenticatedShiftsPage.openAddShiftModal();
    await expect(authenticatedShiftsPage.modalDialog).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeVisible();
    await expect(authenticatedShiftsPage.modalSaveButton).toBeEnabled();
    await expect(authenticatedShiftsPage.modalSaveButton).not.toHaveText(adminModalSubmitResetData.savingStatePattern);

    await authenticatedShiftsPage.closeModalViaCancel();
    await expect(authenticatedShiftsPage.modalDialog).toBeHidden();
  });

});
