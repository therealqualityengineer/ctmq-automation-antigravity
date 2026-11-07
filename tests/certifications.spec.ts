import { test, expect } from '../fixtures/customFixtures';
import { certificationsData } from '../test-data/certificationsData';

test.describe('CTMQ-47 - Certifications Management under Admin General Settings', () => {
  test('TC-01 - Verify navigation to Certifications page from Admin General Settings card', async ({
    authenticatedAdminPage,
  }) => {
    await expect(authenticatedAdminPage.certificationsLink).toBeVisible();
    await authenticatedAdminPage.certificationsLink.click();

    await authenticatedAdminPage.page.waitForURL(new RegExp(certificationsData.routes.certifications));
    expect(authenticatedAdminPage.page.url()).toContain(certificationsData.routes.certifications);
  });

  test('TC-02 - Verify Certifications page layout, AppShell navigation, and centered "+ Add Certification" button', async ({
    authenticatedCertificationsPage,
  }) => {
    // AppShell navigation checks
    await expect(authenticatedCertificationsPage.primaryNav).toBeVisible();
    expect(await authenticatedCertificationsPage.isAdminTabActive()).toBe(true);
    await expect(authenticatedCertificationsPage.adminSubNav).toBeVisible();

    // Page Heading & Controls
    await expect(authenticatedCertificationsPage.heading).toHaveText(certificationsData.pageHeading);
    await expect(authenticatedCertificationsPage.addCertButton).toBeVisible();
    expect(await authenticatedCertificationsPage.isAddCertButtonCentered()).toBe(true);
  });

  test('TC-03 - Verify Certifications table structure, columns, and status pills', async ({
    authenticatedCertificationsPage,
  }) => {
    await expect(authenticatedCertificationsPage.table).toBeVisible();

    // Verify Table Headers
    const headerTexts = await authenticatedCertificationsPage.tableHeaders.allInnerTexts();
    const normalizedHeaders = headerTexts.map((h) => h.trim().toUpperCase());
    for (const expectedHeader of certificationsData.tableHeaders) {
      expect(normalizedHeaders).toContain(expectedHeader.toUpperCase());
    }

    // Verify row counts and status pill
    const rowCount = await authenticatedCertificationsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstStatusPill = await authenticatedCertificationsPage.getStatusPillFor(
      certificationsData.defaultCertifications[0].name
    );
    await expect(firstStatusPill).toBeVisible();
    await expect(firstStatusPill).toHaveText(certificationsData.status.active);
  });

  test('TC-04 - Verify search filtering by certification name and mapped specialties', async ({
    authenticatedCertificationsPage,
  }) => {
    // Filter by certification name
    await authenticatedCertificationsPage.search('BLS');
    const blsRow = authenticatedCertificationsPage.getCertRow('BLS');
    await expect(blsRow).toBeVisible();

    // Reset / clear search restores list
    await authenticatedCertificationsPage.clearSearch();
    const totalRows = await authenticatedCertificationsPage.tableRows.count();
    expect(totalRows).toBeGreaterThanOrEqual(1);
  });

  test('TC-05 - Verify pagination controls and page boundary button states', async ({
    authenticatedCertificationsPage,
  }) => {
    await expect(authenticatedCertificationsPage.paginationContainer).toBeVisible();
    await expect(authenticatedCertificationsPage.paginationText).toContainText(/Page \d+ of \d+ \(\d+ total\)/);

    // Bound checks for page 1
    await expect(authenticatedCertificationsPage.previousPageButton).toBeDisabled();
  });

  test('TC-06 - Verify Add Certification modal display, default fields, and dismissal via Cancel & close (X)', async ({
    authenticatedCertificationsPage,
  }) => {
    // Open modal
    await authenticatedCertificationsPage.openAddCertModal();
    await expect(authenticatedCertificationsPage.modalDialog).toBeVisible();
    await expect(authenticatedCertificationsPage.modalTitle).toHaveText(certificationsData.modal.title);
    await expect(authenticatedCertificationsPage.certNameInput).toBeVisible();
    await expect(authenticatedCertificationsPage.specialtiesDropdownButton).toBeVisible();
    await expect(authenticatedCertificationsPage.statusSelect).toHaveValue(certificationsData.status.active);
    await expect(authenticatedCertificationsPage.modalCancelButton).toBeVisible();
    await expect(authenticatedCertificationsPage.modalSaveButton).toBeVisible();

    // Dismiss via close (X)
    await authenticatedCertificationsPage.closeModalViaCloseButton();
    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();

    // Reopen and dismiss via Cancel
    await authenticatedCertificationsPage.openAddCertModal();
    await expect(authenticatedCertificationsPage.modalDialog).toBeVisible();
    await authenticatedCertificationsPage.closeModalViaCancel();
    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
  });

  test('TC-07 - Verify Mapped Specialties multi-select populated with active specialties', async ({
    authenticatedCertificationsPage,
  }) => {
    await authenticatedCertificationsPage.openAddCertModal();
    await authenticatedCertificationsPage.toggleSpecialtiesDropdown();

    // Verify specialties options are populated
    const specialtyOption = authenticatedCertificationsPage.getSpecialtyCheckbox('Cardiology');
    await expect(specialtyOption).toBeVisible();

    // Select and deselect
    await authenticatedCertificationsPage.selectSpecialty('Cardiology');
    await expect(specialtyOption).toBeChecked();

    await authenticatedCertificationsPage.deselectSpecialty('Cardiology');
    await expect(specialtyOption).not.toBeChecked();

    await authenticatedCertificationsPage.toggleSpecialtiesDropdown();
    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-08 - Verify successful creation of a new Certification with mapped specialties and active status', async ({
    authenticatedCertificationsPage,
  }) => {
    const certName = `${certificationsData.testPayloads.validWithMapping.namePrefix}${Date.now()}`;
    const specialties = certificationsData.testPayloads.validWithMapping.specialties;

    await authenticatedCertificationsPage.createCertification(
      certName,
      specialties,
      certificationsData.testPayloads.validWithMapping.status
    );

    // Modal closes
    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();

    // Success banner appears
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedCertificationsPage.feedbackBanner).toContainText(
      certificationsData.validationMessages.createSuccess
    );

    // Verify row in table
    const certRow = authenticatedCertificationsPage.getCertRow(certName);
    await expect(certRow).toBeVisible();

    // Verify mapped specialties text and active status pill
    const mappingText = await authenticatedCertificationsPage.getMappedSpecialtiesFor(certName);
    for (const spec of specialties) {
      expect(mappingText).toContain(spec);
    }

    const statusPill = await authenticatedCertificationsPage.getStatusPillFor(certName);
    await expect(statusPill).toHaveText(certificationsData.status.active);
  });

  test('TC-09 - Verify creation of Certification without mapped specialties and inactive status', async ({
    authenticatedCertificationsPage,
  }) => {
    const certName = `${certificationsData.testPayloads.validWithoutMapping.namePrefix}${Date.now()}`;

    await authenticatedCertificationsPage.createCertification(
      certName,
      [],
      certificationsData.testPayloads.validWithoutMapping.status
    );

    // Modal closes & banner appears
    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();

    // Verify row in table
    const certRow = authenticatedCertificationsPage.getCertRow(certName);
    await expect(certRow).toBeVisible();

    // Verify unmapped display ("-" or empty) and inactive status pill
    const mappingText = await authenticatedCertificationsPage.getMappedSpecialtiesFor(certName);
    expect(mappingText === '-' || mappingText === '').toBe(true);

    const statusPill = await authenticatedCertificationsPage.getStatusPillFor(certName);
    await expect(statusPill).toHaveText(certificationsData.status.inactive);
  });

  test('TC-10 - Verify creation of Certification with single mapped specialty', async ({
    authenticatedCertificationsPage,
  }) => {
    const certName = `${certificationsData.testPayloads.validWithSingleMapping.namePrefix}${Date.now()}`;
    const specialties = certificationsData.testPayloads.validWithSingleMapping.specialties;

    await authenticatedCertificationsPage.createCertification(
      certName,
      specialties,
      certificationsData.testPayloads.validWithSingleMapping.status
    );

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();

    const certRow = authenticatedCertificationsPage.getCertRow(certName);
    await expect(certRow).toBeVisible();

    const mappingText = await authenticatedCertificationsPage.getMappedSpecialtiesFor(certName);
    expect(mappingText).toContain(specialties[0]);
  });

  test('TC-11 - Verify client-side required field validation when submitting empty Certification Name', async ({
    authenticatedCertificationsPage,
  }) => {
    await authenticatedCertificationsPage.openAddCertModal();
    await authenticatedCertificationsPage.saveModal();

    // Validation error shown and modal remains open
    await expect(authenticatedCertificationsPage.modalRequiredFieldError).toBeVisible();
    await expect(authenticatedCertificationsPage.modalRequiredFieldError).toHaveText(
      certificationsData.validationMessages.nameRequired
    );
    await expect(authenticatedCertificationsPage.modalDialog).toBeVisible();

    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-12 - Verify 409 Conflict duplicate certification name validation (case-insensitive)', async ({
    authenticatedCertificationsPage,
  }) => {
    await authenticatedCertificationsPage.openAddCertModal();
    // Use lower-case existing name to test case-insensitive duplicate check
    await authenticatedCertificationsPage.fillCertName(
      certificationsData.testPayloads.duplicateNameCaseInsensitive
    );
    await authenticatedCertificationsPage.saveModal();

    // Conflict error appears and modal remains open
    await expect(authenticatedCertificationsPage.modalConflictError).toBeVisible();
    await expect(authenticatedCertificationsPage.modalConflictError).toHaveText(
      certificationsData.validationMessages.duplicateConflict
    );
    await expect(authenticatedCertificationsPage.modalDialog).toBeVisible();

    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-13 - Verify unauthenticated access protection for /admin/certifications', async ({
    certificationsPage,
  }) => {
    // Navigate without authentication
    await certificationsPage.navigate(certificationsData.routes.certifications);
    await certificationsPage.page.waitForURL(new RegExp(certificationsData.routes.login));

    expect(certificationsPage.page.url()).toContain(certificationsData.routes.login);
    await expect(certificationsPage.heading).toBeHidden();
  });

  test('TC-14 - Verify Certification Name maximum character length boundary (100 characters) and direct URL stability', async ({
    authenticatedCertificationsPage,
  }) => {
    const cert100Char = certificationsData.testPayloads.generate100CharName(Date.now());
    expect(cert100Char.length).toBe(100);

    await authenticatedCertificationsPage.createCertification(
      cert100Char,
      [],
      certificationsData.status.active as 'Active'
    );

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();

    // Direct reload to verify persistence and stability
    await authenticatedCertificationsPage.reloadPage();
    const certRow = authenticatedCertificationsPage.getCertRow(cert100Char);
    await expect(certRow).toBeVisible();
  });
});
