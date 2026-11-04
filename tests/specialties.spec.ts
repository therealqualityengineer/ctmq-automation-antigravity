import { test, expect } from '../fixtures/customFixtures';
import { specialtiesData } from '../test-data/specialtiesData';

test.describe('CTMQ-46 - Specialties Management under Admin General Settings', () => {
  test('TC-01 - Verify navigation to Specialties page from Admin General Settings card', async ({
    authenticatedAdminPage,
  }) => {
    await expect(authenticatedAdminPage.specialtiesLink).toBeVisible();
    await authenticatedAdminPage.specialtiesLink.click();

    await authenticatedAdminPage.page.waitForURL(new RegExp(specialtiesData.routes.specialties));
    expect(authenticatedAdminPage.page.url()).toContain(specialtiesData.routes.specialties);
  });

  test('TC-02 - Verify Specialties page layout, AppShell navigation, and centered "+ Add Specialty" button', async ({
    authenticatedSpecialtiesPage,
  }) => {
    // AppShell navigation checks
    await expect(authenticatedSpecialtiesPage.primaryNav).toBeVisible();
    expect(await authenticatedSpecialtiesPage.isAdminTabActive()).toBe(true);
    await expect(authenticatedSpecialtiesPage.adminSubNav).toBeVisible();

    // Page Heading & Controls
    await expect(authenticatedSpecialtiesPage.heading).toHaveText(specialtiesData.pageHeading);
    await expect(authenticatedSpecialtiesPage.addSpecialtyButton).toBeVisible();
    expect(await authenticatedSpecialtiesPage.isAddSpecialtyButtonCentered()).toBe(true);
  });

  test('TC-03 - Verify Specialties table structure, columns, and status pills', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await expect(authenticatedSpecialtiesPage.table).toBeVisible();

    // Verify Table Headers
    const headerTexts = await authenticatedSpecialtiesPage.tableHeaders.allInnerTexts();
    const normalizedHeaders = headerTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of specialtiesData.tableHeaders) {
      expect(normalizedHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Verify row counts and status pill
    const rowCount = await authenticatedSpecialtiesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstStatusPill = await authenticatedSpecialtiesPage.getStatusPillFor(
      specialtiesData.defaultSpecialties[0].name
    );
    await expect(firstStatusPill).toBeVisible();
    await expect(firstStatusPill).toHaveText(specialtiesData.status.active);
  });

  test('TC-04 - Verify search filtering by specialty name and certification mapping', async ({
    authenticatedSpecialtiesPage,
  }) => {
    // Filter by specialty name
    await authenticatedSpecialtiesPage.search('Cardiology');
    const cardiologyRow = authenticatedSpecialtiesPage.getSpecialtyRow('Cardiology');
    await expect(cardiologyRow).toBeVisible();

    // Filter by certification mapping
    await authenticatedSpecialtiesPage.search('RN');
    const rnRow = authenticatedSpecialtiesPage.getSpecialtyRow('ER');
    await expect(rnRow).toBeVisible();

    // Reset / clear search restores full list
    await authenticatedSpecialtiesPage.clearSearch();
    const totalRows = await authenticatedSpecialtiesPage.tableRows.count();
    expect(totalRows).toBeGreaterThanOrEqual(3);
  });

  test('TC-05 - Verify pagination controls and page boundary button states', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await expect(authenticatedSpecialtiesPage.paginationContainer).toBeVisible();
    await expect(authenticatedSpecialtiesPage.paginationText).toContainText(/Page \d+ of \d+ \(\d+ total\)/);

    // Bound checks for page 1
    await expect(authenticatedSpecialtiesPage.previousPageButton).toBeDisabled();
  });

  test('TC-06 - Verify Add Specialty modal display, default fields, and dismissal via Cancel & close (X)', async ({
    authenticatedSpecialtiesPage,
  }) => {
    // Open modal
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalTitle).toHaveText(specialtiesData.modal.title);
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toBeVisible();
    await expect(authenticatedSpecialtiesPage.certMappingDropdownButton).toBeVisible();
    await expect(authenticatedSpecialtiesPage.statusSelect).toHaveValue(specialtiesData.status.active);
    await expect(authenticatedSpecialtiesPage.modalCancelButton).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalSaveButton).toBeVisible();

    // Dismiss via close (X)
    await authenticatedSpecialtiesPage.closeModalViaCloseButton();
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();

    // Reopen and dismiss via Cancel
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();
    await authenticatedSpecialtiesPage.closeModalViaCancel();
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
  });

  test('TC-07 - Verify Certification Mapping multi-select populated with active certifications', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();

    await authenticatedSpecialtiesPage.toggleCertificationDropdown();
    await expect(authenticatedSpecialtiesPage.certMappingDropdownMenu).toBeVisible();

    const blsCheckbox = authenticatedSpecialtiesPage.getCertCheckbox('BLS');
    const rnCheckbox = authenticatedSpecialtiesPage.getCertCheckbox('RN');
    await expect(blsCheckbox).toBeVisible();
    await expect(rnCheckbox).toBeVisible();

    // Select multiple certifications
    await blsCheckbox.check();
    await rnCheckbox.check();
    expect(await blsCheckbox.isChecked()).toBe(true);
    expect(await rnCheckbox.isChecked()).toBe(true);

    // Deselect one option
    await blsCheckbox.uncheck();
    expect(await blsCheckbox.isChecked()).toBe(false);
    expect(await rnCheckbox.isChecked()).toBe(true);

    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-08 - Verify successful creation of a new Specialty with mapped certifications and active status', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const uniqueName = `${specialtiesData.testPayloads.validWithMapping.namePrefix}${Date.now()}`;
    await authenticatedSpecialtiesPage.createSpecialty(
      uniqueName,
      specialtiesData.testPayloads.validWithMapping.certifications,
      specialtiesData.testPayloads.validWithMapping.status
    );

    // Verify modal dismissed and feedback banner
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toContainText(
      specialtiesData.validationMessages.createSuccess
    );

    // Verify record in table
    const createdRow = authenticatedSpecialtiesPage.getSpecialtyRow(uniqueName);
    await expect(createdRow).toBeVisible();

    const certText = await authenticatedSpecialtiesPage.getCertificationMappingFor(uniqueName);
    expect(certText).toContain('BLS');
    expect(certText).toContain('RN');

    const statusPill = await authenticatedSpecialtiesPage.getStatusPillFor(uniqueName);
    await expect(statusPill).toHaveText(specialtiesData.status.active);
  });

  test('TC-09 - Verify creation of Specialty without certification mapping', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const uniqueName = `${specialtiesData.testPayloads.validWithoutMapping.namePrefix}${Date.now()}`;
    await authenticatedSpecialtiesPage.createSpecialty(
      uniqueName,
      [],
      specialtiesData.testPayloads.validWithoutMapping.status
    );

    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();

    const createdRow = authenticatedSpecialtiesPage.getSpecialtyRow(uniqueName);
    await expect(createdRow).toBeVisible();

    const certText = await authenticatedSpecialtiesPage.getCertificationMappingFor(uniqueName);
    expect(certText === '-' || certText === '').toBe(true);
  });

  test('TC-10 - Verify client-side required field validation when submitting empty Specialty Name', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await authenticatedSpecialtiesPage.fillSpecialtyName('');
    await authenticatedSpecialtiesPage.saveModal();

    await expect(authenticatedSpecialtiesPage.modalRequiredFieldError).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalRequiredFieldError).toHaveText(
      specialtiesData.validationMessages.nameRequired
    );
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();

    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-11 - Verify 409 Conflict duplicate specialty name validation (case-insensitive)', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await authenticatedSpecialtiesPage.fillSpecialtyName(
      specialtiesData.testPayloads.duplicateNameCaseInsensitive
    );
    await authenticatedSpecialtiesPage.saveModal();

    await expect(authenticatedSpecialtiesPage.modalConflictError).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalConflictError).toHaveText(
      specialtiesData.validationMessages.duplicateConflict
    );
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();

    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-12 - Verify Specialty Name maximum character length boundary (100 characters)', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toHaveAttribute('maxlength', '100');

    const boundaryName = specialtiesData.testPayloads.generate100CharName(Date.now());
    expect(boundaryName.length).toBe(100);

    await authenticatedSpecialtiesPage.fillSpecialtyName(boundaryName);
    await authenticatedSpecialtiesPage.saveModal();

    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();

    const createdRow = authenticatedSpecialtiesPage.getSpecialtyRow(boundaryName);
    await expect(createdRow).toBeVisible();
  });

  test('TC-13 - Verify unauthenticated access protection for /admin/specialties', async ({
    specialtiesPage,
  }) => {
    await specialtiesPage.navigate(specialtiesData.routes.specialties);
    await specialtiesPage.page.waitForURL(new RegExp(specialtiesData.routes.login));
    expect(specialtiesPage.page.url()).toContain(specialtiesData.routes.login);
  });

  test('TC-14 - Verify direct URL navigation, browser refresh, and back/forward navigation stability', async ({
    authenticatedSpecialtiesPage,
  }) => {
    // Direct navigation
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await expect(authenticatedSpecialtiesPage.heading).toBeVisible();

    // Page refresh
    await authenticatedSpecialtiesPage.reloadPage();
    await expect(authenticatedSpecialtiesPage.heading).toBeVisible();
    await expect(authenticatedSpecialtiesPage.table).toBeVisible();

    // Navigate to Admin and then back
    await authenticatedSpecialtiesPage.navigate(specialtiesData.routes.admin);
    await authenticatedSpecialtiesPage.page.waitForURL(new RegExp(specialtiesData.routes.admin));
    expect(authenticatedSpecialtiesPage.page.url()).toContain(specialtiesData.routes.admin);

    await authenticatedSpecialtiesPage.goBack();
    await authenticatedSpecialtiesPage.page.waitForURL(new RegExp(specialtiesData.routes.specialties));
    expect(authenticatedSpecialtiesPage.page.url()).toContain(specialtiesData.routes.specialties);
    await expect(authenticatedSpecialtiesPage.heading).toBeVisible();
  });
});
