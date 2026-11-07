import { test, expect } from '../fixtures/customFixtures';
import { editData } from '../test-data/specialtiesCertificationsEditData';

test.describe('CTMQ-52 - Specialties and Certifications Edit Functionality in Admin General Settings', () => {

  // ==========================================
  // Specialties Edit Scenarios
  // ==========================================

  test('TC-01 - Verify clicking an existing Specialty opens Edit Specialty modal with pre-populated details', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, ['RN'], 'Active');

    // Click on the existing specialty row to open Edit mode
    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);

    // Verify modal title, pre-populated fields, and Save Changes button
    await expect(authenticatedSpecialtiesPage.editModalTitle).toBeVisible();
    await expect(authenticatedSpecialtiesPage.editModalTitle).toHaveText(editData.specialties.editTitle);
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toHaveValue(testSpecialty);
    await expect(authenticatedSpecialtiesPage.statusSelect).toHaveValue('Active');
    await expect(authenticatedSpecialtiesPage.saveChangesButton).toBeVisible();

    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-02 - Verify Specialty Name input is disabled and non-editable in Edit mode', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, [], 'Active');

    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);

    // Verify Specialty Name is disabled and has cursor-not-allowed / non-editable styling
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toBeDisabled();
    const classAttr = await authenticatedSpecialtiesPage.specialtyNameInput.getAttribute('class');
    expect(classAttr).toContain('cursor-not-allowed');
    expect(classAttr).toContain('bg-slate-100');

    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-03 - Verify updating Specialty Status (Active to Inactive) updates record, displays banner, and refreshes table', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, [], 'Active');

    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);
    await authenticatedSpecialtiesPage.selectStatus('Inactive');
    await authenticatedSpecialtiesPage.saveEditChanges();

    // Verify modal closes and success feedback banner appears
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toContainText(editData.specialties.updateSuccess);

    // Verify table reflects Inactive status
    const statusPill = await authenticatedSpecialtiesPage.getStatusPillFor(testSpecialty);
    await expect(statusPill).toHaveText('Inactive');
  });

  test('TC-04 - Verify updating Specialty Certification Mappings updates record, displays banner, and refreshes table', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, ['RN'], 'Active');

    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);
    await authenticatedSpecialtiesPage.selectCertification('BLS');
    await authenticatedSpecialtiesPage.saveEditChanges();

    // Verify feedback banner and refreshed mappings in table
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toContainText(editData.specialties.updateSuccess);

    const mappingLocator = await authenticatedSpecialtiesPage.getCertificationMappingLocatorFor(testSpecialty);
    await expect(mappingLocator).toContainText('RN');
    await expect(mappingLocator).toContainText('BLS');
  });

  // ==========================================
  // Certifications Edit Scenarios
  // ==========================================

  test('TC-05 - Verify clicking an existing Certification opens Edit Certification modal with pre-populated details', async ({
    authenticatedCertificationsPage,
  }) => {
    const testCert = editData.certifications.generateUniqueName();
    await authenticatedCertificationsPage.createCertification(testCert, ['Cardiology'], 'Active');

    await authenticatedCertificationsPage.openEditCertModal(testCert);

    await expect(authenticatedCertificationsPage.editModalTitle).toBeVisible();
    await expect(authenticatedCertificationsPage.editModalTitle).toHaveText(editData.certifications.editTitle);
    await expect(authenticatedCertificationsPage.certNameInput).toHaveValue(testCert);
    await expect(authenticatedCertificationsPage.statusSelect).toHaveValue('Active');
    await expect(authenticatedCertificationsPage.saveChangesButton).toBeVisible();

    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-06 - Verify Certification Name input is disabled and non-editable in Edit mode', async ({
    authenticatedCertificationsPage,
  }) => {
    const testCert = editData.certifications.generateUniqueName();
    await authenticatedCertificationsPage.createCertification(testCert, [], 'Active');

    await authenticatedCertificationsPage.openEditCertModal(testCert);

    await expect(authenticatedCertificationsPage.certNameInput).toBeDisabled();
    const classAttr = await authenticatedCertificationsPage.certNameInput.getAttribute('class');
    expect(classAttr).toContain('cursor-not-allowed');
    expect(classAttr).toContain('bg-slate-100');

    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-07 - Verify updating Certification Status (Active to Inactive) updates record, displays banner, and refreshes table', async ({
    authenticatedCertificationsPage,
  }) => {
    const testCert = editData.certifications.generateUniqueName();
    await authenticatedCertificationsPage.createCertification(testCert, [], 'Active');

    await authenticatedCertificationsPage.openEditCertModal(testCert);
    await authenticatedCertificationsPage.selectStatus('Inactive');
    await authenticatedCertificationsPage.saveEditChanges();

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedCertificationsPage.feedbackBanner).toContainText(editData.certifications.updateSuccess);

    const statusPill = await authenticatedCertificationsPage.getStatusPillFor(testCert);
    await expect(statusPill).toHaveText('Inactive');
  });

  test('TC-08 - Verify updating Certification Mapped Specialties updates record, displays banner, and refreshes table', async ({
    authenticatedCertificationsPage,
  }) => {
    const testCert = editData.certifications.generateUniqueName();
    await authenticatedCertificationsPage.createCertification(testCert, ['Cardiology'], 'Active');

    await authenticatedCertificationsPage.openEditCertModal(testCert);
    await authenticatedCertificationsPage.selectSpecialty('ER');
    await authenticatedCertificationsPage.saveEditChanges();

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedCertificationsPage.feedbackBanner).toContainText(editData.certifications.updateSuccess);

    const mappingLocator = await authenticatedCertificationsPage.getMappedSpecialtiesLocatorFor(testCert);
    await expect(mappingLocator).toContainText('Cardiology');
    await expect(mappingLocator).toContainText('ER');
  });

  // ==========================================
  // Common Workflow & Edge Scenarios
  // ==========================================

  test('TC-09 - Verify dismissing Edit modal via Cancel or Close (X) leaves record unchanged', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, ['RN'], 'Active');

    // Test Cancel dismissal
    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);
    await authenticatedSpecialtiesPage.selectStatus('Inactive');
    await authenticatedSpecialtiesPage.closeModalViaCancel();

    let statusPill = await authenticatedSpecialtiesPage.getStatusPillFor(testSpecialty);
    await expect(statusPill).toHaveText('Active');

    // Test Close (X) button dismissal
    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);
    await authenticatedSpecialtiesPage.selectStatus('Inactive');
    await authenticatedSpecialtiesPage.closeModalViaCloseButton();

    statusPill = await authenticatedSpecialtiesPage.getStatusPillFor(testSpecialty);
    await expect(statusPill).toHaveText('Active');
  });

  test('TC-10a - Verify backward compatibility: Add Specialty modal opens in Create mode', async ({
    authenticatedSpecialtiesPage,
  }) => {
    await authenticatedSpecialtiesPage.openAddSpecialtyModal();
    await expect(authenticatedSpecialtiesPage.modalTitle).toBeVisible();
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toBeEditable();
    await expect(authenticatedSpecialtiesPage.statusSelect).toHaveValue('Active');
    await expect(authenticatedSpecialtiesPage.modalSaveButton).toBeVisible();
    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-10b - Verify backward compatibility: Add Certification modal opens in Create mode', async ({
    authenticatedCertificationsPage,
  }) => {
    await authenticatedCertificationsPage.openAddCertModal();
    await expect(authenticatedCertificationsPage.modalTitle).toBeVisible();
    await expect(authenticatedCertificationsPage.certNameInput).toBeEditable();
    await expect(authenticatedCertificationsPage.statusSelect).toHaveValue('Active');
    await expect(authenticatedCertificationsPage.modalSaveButton).toBeVisible();
    await authenticatedCertificationsPage.closeModalViaCancel();
  });

  test('TC-11 - Verify error banner display inside modal on API failure without closing modal', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, [], 'Active');

    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);

    // Mock API 400 failure on PUT
    await authenticatedSpecialtiesPage.page.route('**/api/admin/specialties/*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: editData.specialties.mockErrorMessage }),
        });
      } else {
        await route.continue();
      }
    });

    await authenticatedSpecialtiesPage.saveChangesButton.click();

    // Verify modal remains open, error banner is displayed, and input is preserved
    await expect(authenticatedSpecialtiesPage.modalDialog).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalErrorBanner).toBeVisible();
    await expect(authenticatedSpecialtiesPage.modalErrorBanner).toContainText(editData.specialties.mockErrorMessage);
    await expect(authenticatedSpecialtiesPage.specialtyNameInput).toHaveValue(testSpecialty);

    // Unroute before closing
    await authenticatedSpecialtiesPage.page.unroute('**/api/admin/specialties/*');
    await authenticatedSpecialtiesPage.closeModalViaCancel();
  });

  test('TC-12 - Verify unauthenticated access protection redirects /admin/specialties and /admin/certifications to /login', async ({
    specialtiesPage,
    certificationsPage,
  }) => {
    await specialtiesPage.navigate(editData.routes.specialties);
    await specialtiesPage.page.waitForURL(new RegExp(editData.routes.login));
    expect(specialtiesPage.page.url()).toContain(editData.routes.login);

    await certificationsPage.navigate(editData.routes.certifications);
    await certificationsPage.page.waitForURL(new RegExp(editData.routes.login));
    expect(certificationsPage.page.url()).toContain(editData.routes.login);
  });

  test('TC-13 - Verify clearing all mapped associations (empty mapping) and saving successfully', async ({
    authenticatedSpecialtiesPage,
  }) => {
    const testSpecialty = editData.specialties.generateUniqueName();
    await authenticatedSpecialtiesPage.createSpecialty(testSpecialty, ['RN', 'BLS'], 'Active');

    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpecialty);
    await authenticatedSpecialtiesPage.clearAllCertifications();
    await authenticatedSpecialtiesPage.saveEditChanges();

    await expect(authenticatedSpecialtiesPage.modalDialog).toBeHidden();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toBeVisible();
    await expect(authenticatedSpecialtiesPage.feedbackBanner).toContainText(editData.specialties.updateSuccess);

    const mappingLocator = await authenticatedSpecialtiesPage.getCertificationMappingLocatorFor(testSpecialty);
    await expect(mappingLocator).toHaveText('-');
  });

  test('TC-14 - Verify selecting multiple mapped associations and saving successfully', async ({
    authenticatedCertificationsPage,
  }) => {
    const testCert = editData.certifications.generateUniqueName();
    await authenticatedCertificationsPage.createCertification(testCert, [], 'Active');

    await authenticatedCertificationsPage.openEditCertModal(testCert);
    await authenticatedCertificationsPage.selectSpecialty('Cardiology');
    await authenticatedCertificationsPage.selectSpecialty('Neurology');
    await authenticatedCertificationsPage.saveEditChanges();

    await expect(authenticatedCertificationsPage.modalDialog).toBeHidden();
    await expect(authenticatedCertificationsPage.feedbackBanner).toBeVisible();
    await expect(authenticatedCertificationsPage.feedbackBanner).toContainText(editData.certifications.updateSuccess);

    const mappingLocator = await authenticatedCertificationsPage.getMappedSpecialtiesLocatorFor(testCert);
    await expect(mappingLocator).toContainText('Cardiology');
    await expect(mappingLocator).toContainText('Neurology');
  });
});
