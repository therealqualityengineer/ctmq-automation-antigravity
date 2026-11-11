import { test, expect } from '../fixtures/customFixtures';
import { tempCertSpecialtyData } from '../test-data/tempCertSpecialtyData';
import { addTempData } from '../test-data/addTempData';
import { authData } from '../test-data/authData';

test.describe('CTMQ-70 - Add Certification and Specialty fields in Temp page Suite', () => {

  test.beforeAll(async ({ request }) => {
    // Authenticate API request context
    await request.post('/api/auth/login', {
      data: {
        username: authData.validUser.username,
        password: authData.validUser.password,
      },
    });

    // Seed Active Specialty: Cardiology
    await request.post(tempCertSpecialtyData.urls.apiAdminSpecialties, {
      data: {
        name: tempCertSpecialtyData.seedData.specialtyCardiology,
        status: 'Active',
      },
    });

    // Seed Active Specialty: Pediatrics
    await request.post(tempCertSpecialtyData.urls.apiAdminSpecialties, {
      data: {
        name: tempCertSpecialtyData.seedData.specialtyPediatrics,
        status: 'Active',
      },
    });

    // Seed Active Certification mapped to Cardiology
    await request.post(tempCertSpecialtyData.urls.apiAdminCertifications, {
      data: {
        name: tempCertSpecialtyData.seedData.certWithMapping,
        mappedSpecialties: tempCertSpecialtyData.seedData.specialtyCardiology,
        status: 'Active',
      },
    });

    // Seed Active Certification without mapped specialties
    await request.post(tempCertSpecialtyData.urls.apiAdminCertifications, {
      data: {
        name: tempCertSpecialtyData.seedData.certWithoutMapping,
        mappedSpecialties: '',
        status: 'Active',
      },
    });

    // Seed Inactive Certification
    await request.post(tempCertSpecialtyData.urls.apiAdminCertifications, {
      data: {
        name: tempCertSpecialtyData.seedData.certInactive,
        mappedSpecialties: '',
        status: 'Inactive',
      },
    });
  });

  test('TC-01 - Verify presence, labeling, and placement of Certification and Specialty fields on Temp form', async ({
    authenticatedAddTempPage,
  }) => {
    await expect(authenticatedAddTempPage.certificationLabel).toBeVisible();
    await expect(authenticatedAddTempPage.certificationLabel).toHaveText(tempCertSpecialtyData.labels.certification);
    await expect(authenticatedAddTempPage.certificationSelect).toBeVisible();

    await expect(authenticatedAddTempPage.specialtyLabel).toBeVisible();
    await expect(authenticatedAddTempPage.specialtyLabel).toHaveText(tempCertSpecialtyData.labels.specialty);
    await expect(authenticatedAddTempPage.specialtySelect).toBeVisible();

    // Verify placement in Right Box
    await expect(authenticatedAddTempPage.rightBox).toContainText(tempCertSpecialtyData.labels.certification);
    await expect(authenticatedAddTempPage.rightBox).toContainText(tempCertSpecialtyData.labels.specialty);
  });

  test('TC-02 - Verify dynamic loading of active Certifications into the Certification dropdown', async ({
    authenticatedAddTempPage,
  }) => {
    await expect(authenticatedAddTempPage.certificationSelect.locator('option')).not.toHaveCount(1);
    const certOptions = await authenticatedAddTempPage.getCertificationOptionTexts();

    expect(certOptions).toContain(tempCertSpecialtyData.placeholders.selectCertification);
    expect(certOptions).toContain(tempCertSpecialtyData.seedData.certWithMapping);
    expect(certOptions).toContain(tempCertSpecialtyData.seedData.certWithoutMapping);
  });

  test('TC-03 - Verify Specialty dropdown is initially disabled with placeholder Select Certification first', async ({
    authenticatedAddTempPage,
  }) => {
    await expect(authenticatedAddTempPage.specialtySelect).toBeDisabled();

    const specOptions = await authenticatedAddTempPage.getSpecialtyOptionTexts();
    expect(specOptions).toContain(tempCertSpecialtyData.placeholders.selectCertFirst);
  });

  test('TC-04 - Verify dynamic Specialty options population and enabling upon selecting a mapped Certification', async ({
    authenticatedAddTempPage,
  }) => {
    await authenticatedAddTempPage.selectCertification(tempCertSpecialtyData.seedData.certWithMapping);

    // Specialty dropdown should be enabled
    await expect(authenticatedAddTempPage.specialtySelect).toBeEnabled();

    const specOptions = await authenticatedAddTempPage.getSpecialtyOptionTexts();
    expect(specOptions).toContain(tempCertSpecialtyData.placeholders.selectSpecialty);
    expect(specOptions).toContain(tempCertSpecialtyData.seedData.specialtyCardiology);

    // Select the specialty and verify value
    await authenticatedAddTempPage.selectSpecialty(tempCertSpecialtyData.seedData.specialtyCardiology);
    const selectedSpecialty = await authenticatedAddTempPage.getSelectedSpecialty();
    expect(selectedSpecialty).toBe(tempCertSpecialtyData.seedData.specialtyCardiology);
  });

  test('TC-05 - Verify Specialty dropdown behavior when selected Certification has no mapped specialties', async ({
    authenticatedAddTempPage,
  }) => {
    await authenticatedAddTempPage.selectCertification(tempCertSpecialtyData.seedData.certWithoutMapping);

    // Specialty dropdown should remain disabled
    await expect(authenticatedAddTempPage.specialtySelect).toBeDisabled();

    const specOptions = await authenticatedAddTempPage.getSpecialtyOptionTexts();
    expect(specOptions).toContain(tempCertSpecialtyData.placeholders.noMappedSpecialties);
  });

  test('TC-06 - Verify clearing Certification selection resets and disables Specialty dropdown', async ({
    authenticatedAddTempPage,
  }) => {
    // First select certification with mapping
    await authenticatedAddTempPage.selectCertification(tempCertSpecialtyData.seedData.certWithMapping);
    await expect(authenticatedAddTempPage.specialtySelect).toBeEnabled();
    await authenticatedAddTempPage.selectSpecialty(tempCertSpecialtyData.seedData.specialtyCardiology);

    // Clear Certification selection back to default
    await authenticatedAddTempPage.selectCertification('');

    // Specialty should become disabled again and reset to placeholder
    await expect(authenticatedAddTempPage.specialtySelect).toBeDisabled();
    const specOptions = await authenticatedAddTempPage.getSpecialtyOptionTexts();
    expect(specOptions).toContain(tempCertSpecialtyData.placeholders.selectCertFirst);
  });

  test('TC-07 - Verify successful creation of Temp record with both Certification and Specialty', async ({
    authenticatedAddTempPage,
  }) => {
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithCertAndSpecialty(
      'full',
      tempCertSpecialtyData.seedData.certWithMapping,
      tempCertSpecialtyData.seedData.specialtyCardiology
    );

    await authenticatedAddTempPage.fillForm(tempPayload);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.certification).toBe(tempCertSpecialtyData.seedData.certWithMapping);
    expect(body.specialty).toBe(tempCertSpecialtyData.seedData.specialtyCardiology);
    expect(body.firstName).toBe(tempPayload.firstName);
    expect(body.email).toBe(tempPayload.email);

    await expect(authenticatedAddTempPage.successBanner).toBeVisible();
    await expect(authenticatedAddTempPage.successBanner).toHaveText(tempCertSpecialtyData.messages.tempCreated);
  });

  test('TC-08 - Verify creation of Temp record with Certification selected and Specialty omitted', async ({
    authenticatedAddTempPage,
  }) => {
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithCertAndSpecialty(
      'certOnly',
      tempCertSpecialtyData.seedData.certWithoutMapping
    );

    await authenticatedAddTempPage.fillForm(tempPayload);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.certification).toBe(tempCertSpecialtyData.seedData.certWithoutMapping);
    expect(body.specialty).toBeNull();

    await expect(authenticatedAddTempPage.successBanner).toBeVisible();
    await expect(authenticatedAddTempPage.successBanner).toHaveText(tempCertSpecialtyData.messages.tempCreated);
  });

  test('TC-09 - Verify creation of Temp record without Certification and Specialty (optional fields)', async ({
    authenticatedAddTempPage,
  }) => {
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithoutCert('optional');

    await authenticatedAddTempPage.fillForm(tempPayload);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.certification).toBeNull();
    expect(body.specialty).toBeNull();

    await expect(authenticatedAddTempPage.successBanner).toBeVisible();
    await expect(authenticatedAddTempPage.successBanner).toHaveText(tempCertSpecialtyData.messages.tempCreated);
  });

  test('TC-10 - Verify pre-population and read-only state of Certification and Specialty on existing Temp record', async ({
    authenticatedAddTempPage,
    authenticatedTempDetailPage,
  }) => {
    // Create a Temp record with Certification and Specialty
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithCertAndSpecialty(
      'detail',
      tempCertSpecialtyData.seedData.certWithMapping,
      tempCertSpecialtyData.seedData.specialtyCardiology
    );
    await authenticatedAddTempPage.fillForm(tempPayload);
    const { body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();

    // Navigate to the created Temp Detail page
    await authenticatedTempDetailPage.gotoTempDetail(body.id);

    // Verify fields are pre-populated
    expect(await authenticatedTempDetailPage.getSelectedCertification()).toBe(tempCertSpecialtyData.seedData.certWithMapping);
    expect(await authenticatedTempDetailPage.getSelectedSpecialty()).toBe(tempCertSpecialtyData.seedData.specialtyCardiology);

    // Verify fields are read-only / disabled in view mode
    await expect(authenticatedTempDetailPage.certificationSelect).toBeDisabled();
    await expect(authenticatedTempDetailPage.specialtySelect).toBeDisabled();
  });

  test('TC-11 - Verify editing and updating Certification and Specialty on an existing Temp record', async ({
    authenticatedAddTempPage,
    authenticatedTempDetailPage,
  }) => {
    // Create a Temp record with Certification and Specialty
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithCertAndSpecialty(
      'update',
      tempCertSpecialtyData.seedData.certWithMapping,
      tempCertSpecialtyData.seedData.specialtyCardiology
    );
    await authenticatedAddTempPage.fillForm(tempPayload);
    const { body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();

    // Navigate to Temp Detail page and enter Edit mode
    await authenticatedTempDetailPage.gotoTempDetail(body.id);
    await authenticatedTempDetailPage.clickEdit();

    // In Edit mode, fields become editable
    await expect(authenticatedTempDetailPage.certificationSelect).toBeEnabled();
    await expect(authenticatedTempDetailPage.specialtySelect).toBeEnabled();

    // Update Specialty to empty
    await authenticatedTempDetailPage.selectSpecialty('');

    const { status: putStatus, body: putBody } = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(putStatus).toBe(200);
    expect(putBody.certification).toBe(tempCertSpecialtyData.seedData.certWithMapping);
    expect(putBody.specialty).toBeNull();
  });

  test('TC-12 - Verify Cancel action discards selected Certification and Specialty without saving', async ({
    authenticatedAddTempPage,
    page,
  }) => {
    const tempPayload = tempCertSpecialtyData.testTemps.generateWithCertAndSpecialty(
      'cancel',
      tempCertSpecialtyData.seedData.certWithMapping,
      tempCertSpecialtyData.seedData.specialtyCardiology
    );
    await authenticatedAddTempPage.fillForm(tempPayload);

    await authenticatedAddTempPage.clickCancel();

    // Verify navigation away from /temp/new
    await expect(page).not.toHaveURL(new RegExp(`${tempCertSpecialtyData.urls.addTemp}$`));

    // Revisit /temp/new and verify fresh default state
    await authenticatedAddTempPage.gotoAddTemp();
    expect(await authenticatedAddTempPage.getSelectedCertification()).toBe('');
    await expect(authenticatedAddTempPage.specialtySelect).toBeDisabled();
  });

  test('TC-13 - Verify inactive Certifications are excluded from selectable options', async ({
    authenticatedAddTempPage,
  }) => {
    const certOptions = await authenticatedAddTempPage.getCertificationOptionTexts();

    // Inactive certification must NOT appear in the dropdown
    expect(certOptions).not.toContain(tempCertSpecialtyData.seedData.certInactive);
  });

  test('TC-14 - Verify unauthenticated access protection redirects /temp/new to /login', async ({
    addTempPage,
    page,
  }) => {
    await addTempPage.gotoAddTemp();

    await expect(page).toHaveURL(new RegExp(tempCertSpecialtyData.urls.login));
    await expect(addTempPage.certificationSelect).not.toBeVisible();
    await expect(addTempPage.specialtySelect).not.toBeVisible();
  });

  test('TC-15 - Verify responsive layout and keyboard accessibility across Specialty & Certification fields', async ({
    authenticatedAddTempPage,
  }) => {
    // Desktop Viewport: Two-column layout
    await authenticatedAddTempPage.setViewport(
      tempCertSpecialtyData.viewports.desktop.width,
      tempCertSpecialtyData.viewports.desktop.height
    );
    const isTwoColumn = await authenticatedAddTempPage.isTwoColumnLayout();
    expect(isTwoColumn).toBe(true);

    // Mobile Viewport: Stacked layout
    await authenticatedAddTempPage.setViewport(
      tempCertSpecialtyData.viewports.mobile.width,
      tempCertSpecialtyData.viewports.mobile.height
    );
    const isStacked = await authenticatedAddTempPage.isStackedLayout();
    expect(isStacked).toBe(true);

    // When Certification is selected, Specialty becomes enabled and enters the tab order
    await authenticatedAddTempPage.selectCertification(tempCertSpecialtyData.seedData.certWithMapping);
    await expect(authenticatedAddTempPage.specialtySelect).toBeEnabled();

    // Keyboard accessibility test on Certification and Specialty selects
    await authenticatedAddTempPage.certificationSelect.focus();
    await authenticatedAddTempPage.pressTab();
    await expect(authenticatedAddTempPage.specialtySelect).toBeFocused();
  });
});
