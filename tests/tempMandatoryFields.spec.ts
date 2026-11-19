import { test, expect } from '../fixtures/customFixtures';
import { tempMandatoryFieldsData } from '../test-data/tempMandatoryFieldsData';

test.describe('CTMQ-78 - Temp Mandatory Fields & Red Asterisk Indicators', () => {
  test('TC-01 - Red asterisk (*) displayed for all 10 mandatory fields on Add Temp (/temp/new)', async ({
    authenticatedAddTempPage,
  }) => {
    await expect(authenticatedAddTempPage.pageHeading).toBeVisible();

    for (const label of tempMandatoryFieldsData.mandatoryLabels) {
      const labelLocator = authenticatedAddTempPage.getFieldLabel(label);
      const asteriskLocator = authenticatedAddTempPage.getRequiredAsterisk(label);

      await expect(labelLocator, `Label "${label}" should be visible`).toBeVisible();
      await expect(asteriskLocator, `Mandatory field "${label}" should display a red asterisk (*)`).toBeVisible();
      await expect(asteriskLocator).toHaveText('*');
    }
  });

  test('TC-02 - No red asterisk displayed on non-marked fields on Add Temp (/temp/new)', async ({
    authenticatedAddTempPage,
  }) => {
    await expect(authenticatedAddTempPage.pageHeading).toBeVisible();

    for (const label of tempMandatoryFieldsData.nonMarkedLabels) {
      const labelLocator = authenticatedAddTempPage.getFieldLabel(label);
      const asteriskLocator = authenticatedAddTempPage.getRequiredAsterisk(label);

      await expect(labelLocator, `Label "${label}" should be visible`).toBeVisible();
      await expect(
        asteriskLocator,
        `Non-marked field "${label}" should NOT display a red asterisk (*)`
      ).toHaveCount(0);
    }
  });

  test('TC-03 - Red asterisk indicator parity on View/Edit Temp (/temp/:id) in View and Edit modes', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const payload = tempMandatoryFieldsData.generateValidTemp('tc03', certification, specialty);
    const created = await tempDetailPage.createTempViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await tempDetailPage.gotoTempDetail(created.id);
      await expect(tempDetailPage.editButton).toBeVisible();

      // View mode parity
      for (const label of tempMandatoryFieldsData.mandatoryLabels) {
        await expect(
          tempDetailPage.getRequiredAsterisk(label),
          `View mode: mandatory field "${label}" should display red asterisk`
        ).toBeVisible();
      }
      for (const label of tempMandatoryFieldsData.nonMarkedLabels) {
        await expect(
          tempDetailPage.getRequiredAsterisk(label),
          `View mode: non-marked field "${label}" should NOT display red asterisk`
        ).toHaveCount(0);
      }

      // Edit mode parity
      await tempDetailPage.clickEdit();
      await expect(tempDetailPage.saveButton).toBeVisible();

      for (const label of tempMandatoryFieldsData.mandatoryLabels) {
        await expect(
          tempDetailPage.getRequiredAsterisk(label),
          `Edit mode: mandatory field "${label}" should display red asterisk`
        ).toBeVisible();
      }
      for (const label of tempMandatoryFieldsData.nonMarkedLabels) {
        await expect(
          tempDetailPage.getRequiredAsterisk(label),
          `Edit mode: non-marked field "${label}" should NOT display red asterisk`
        ).toHaveCount(0);
      }
    } finally {
      await tempDetailPage.deleteTempViaApi(created.id);
    }
  });

  test('TC-04 - Create Temp succeeds with all 10 mandatory fields populated', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const payload = tempMandatoryFieldsData.generateValidTemp('tc04', certification, specialty);

    await authenticatedAddTempPage.fillForm(payload);
    const apiRes = await authenticatedAddTempPage.saveAndInterceptApiResponse();

    expect(apiRes.status).toBe(201);
    expect(apiRes.body?.id).toBeTruthy();
    await expect(authenticatedAddTempPage.successBanner).toBeVisible();

    try {
      expect(apiRes.body.firstName).toBe(payload.firstName);
      expect(apiRes.body.certification).toBe(certification);
      expect(apiRes.body.specialty).toBe(specialty);
    } finally {
      if (apiRes.body?.id) {
        await tempDetailPage.deleteTempViaApi(apiRes.body.id);
      }
    }
  });

  test('TC-05 - Add Temp blocks save when Certification or Specialty is unselected', async ({
    authenticatedAddTempPage,
  }) => {
    const { certification } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const partialPayload = tempMandatoryFieldsData.generateValidTemp('tc05', certification, '');
    const { certification: _c, specialty: _s, ...textOnlyPayload } = partialPayload;

    // 1. Missing Certification (and Specialty)
    await authenticatedAddTempPage.fillForm(textOnlyPayload);
    await authenticatedAddTempPage.clickSave();

    const certInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.certificationSelect);
    const errorBannerVisibleAfterCert = await authenticatedAddTempPage.feedbackErrorBanner.isVisible().catch(() => false);
    expect(certInvalid || errorBannerVisibleAfterCert).toBe(true);
    await expect(authenticatedAddTempPage.successBanner).toHaveCount(0);

    // 2. Certification selected, Specialty left unselected
    await authenticatedAddTempPage.selectCertification(certification);
    await expect(authenticatedAddTempPage.specialtySelect).toBeEnabled();
    await authenticatedAddTempPage.clickSave();

    const specInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.specialtySelect);
    const errorBannerVisibleAfterSpec = await authenticatedAddTempPage.feedbackErrorBanner.isVisible().catch(() => false);
    expect(specInvalid || errorBannerVisibleAfterSpec).toBe(true);
    await expect(authenticatedAddTempPage.successBanner).toHaveCount(0);
  });

  test('TC-06 - Add Temp blocks save when any required text field is empty', async ({
    authenticatedAddTempPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const basePayload = tempMandatoryFieldsData.generateValidTemp('tc06', certification, specialty);

    await authenticatedAddTempPage.fillForm(basePayload);

    const requiredTextFields = [
      { name: 'First Name', locator: authenticatedAddTempPage.firstNameInput, restore: basePayload.firstName },
      { name: 'Last Name', locator: authenticatedAddTempPage.lastNameInput, restore: basePayload.lastName },
      { name: 'Cell Phone', locator: authenticatedAddTempPage.cellPhoneInput, restore: basePayload.cellPhone },
      { name: 'Email', locator: authenticatedAddTempPage.emailInput, restore: basePayload.email },
      { name: 'Address', locator: authenticatedAddTempPage.addressInput, restore: basePayload.address },
      { name: 'City', locator: authenticatedAddTempPage.cityInput, restore: basePayload.city },
      { name: 'ZIP', locator: authenticatedAddTempPage.zipInput, restore: basePayload.zip },
    ];

    for (const field of requiredTextFields) {
      await field.locator.clear();
      await authenticatedAddTempPage.clickSave();

      const isInvalid = await authenticatedAddTempPage.isFieldInvalid(field.locator);
      const isAlertVisible = await authenticatedAddTempPage.feedbackErrorBanner.isVisible().catch(() => false);
      expect(isInvalid || isAlertVisible, `Empty "${field.name}" should block form submission`).toBe(true);
      await expect(authenticatedAddTempPage.successBanner).toHaveCount(0);

      await field.locator.fill(field.restore);
    }
  });

  test('TC-07 - Edit Temp blocks save and displays FeedbackBanner error when mandatory fields are cleared', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const payload = tempMandatoryFieldsData.generateValidTemp('tc07', certification, specialty);
    const created = await tempDetailPage.createTempViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await tempDetailPage.gotoTempDetail(created.id);
      await tempDetailPage.clickEdit();

      // 1. Clear First Name and attempt save
      await tempDetailPage.clearFirstName();
      await tempDetailPage.clickSave();
      await expect(tempDetailPage.feedbackErrorBanner).toBeVisible();
      await expect(tempDetailPage.feedbackErrorBanner).toContainText(tempMandatoryFieldsData.messages.requiredErrorPattern);

      // Restore First Name, clear Specialty and attempt save
      await tempDetailPage.firstNameInput.fill(payload.firstName);
      await tempDetailPage.clearSelect(tempDetailPage.specialtySelect);
      await tempDetailPage.clickSave();
      await expect(tempDetailPage.feedbackErrorBanner).toBeVisible();
      await expect(tempDetailPage.feedbackErrorBanner).toContainText(
        tempMandatoryFieldsData.messages.certOrSpecialtyErrorPattern
      );

      // Clear Certification and attempt save
      await tempDetailPage.clearSelect(tempDetailPage.certificationSelect);
      await tempDetailPage.clickSave();
      await expect(tempDetailPage.feedbackErrorBanner).toBeVisible();
      await expect(tempDetailPage.feedbackErrorBanner).toContainText(
        tempMandatoryFieldsData.messages.certOrSpecialtyErrorPattern
      );

      // Verify persisted record remains intact (Zero Data Loss)
      const fetched = await tempDetailPage.getTempViaApi(created.id);
      expect(fetched.status).toBe(200);
      expect(fetched.body.firstName).toBe(payload.firstName);
      expect(fetched.body.certification).toBe(certification);
      expect(fetched.body.specialty).toBe(specialty);
    } finally {
      await tempDetailPage.deleteTempViaApi(created.id);
    }
  });

  test('TC-08 - Edit Temp saves cleanly when all 10 mandatory fields are valid', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const payload = tempMandatoryFieldsData.generateValidTemp('tc08', certification, specialty);
    const created = await tempDetailPage.createTempViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await tempDetailPage.gotoTempDetail(created.id);
      await tempDetailPage.clickEdit();

      const updatedFirstName = `${payload.firstName}_Updated`;
      await tempDetailPage.firstNameInput.fill(updatedFirstName);

      const putRes = await tempDetailPage.saveAndInterceptPutResponse();
      expect(putRes.status).toBe(200);
      await expect(tempDetailPage.feedbackSuccessBanner).toBeVisible();

      const fetched = await tempDetailPage.getTempViaApi(created.id);
      expect(fetched.status).toBe(200);
      expect(fetched.body.firstName).toBe(updatedFirstName);
      expect(fetched.body.certification).toBe(certification);
      expect(fetched.body.specialty).toBe(specialty);
    } finally {
      await tempDetailPage.deleteTempViaApi(created.id);
    }
  });

  test('TC-09 - Backend POST /api/temps rejects missing or whitespace mandatory fields with 400', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const validBase = tempMandatoryFieldsData.generateValidTemp('tc09', certification, specialty);

    // Missing Certification
    const resNoCert = await tempDetailPage.createTempRawViaApi({
      ...validBase,
      email: `ctmq78_nocert_${Date.now()}@example.com`,
      certification: tempMandatoryFieldsData.invalidValues.empty,
    });
    expect(resNoCert.status).toBe(400);

    // Missing Specialty
    const resNoSpec = await tempDetailPage.createTempRawViaApi({
      ...validBase,
      email: `ctmq78_nospec_${Date.now()}@example.com`,
      specialty: tempMandatoryFieldsData.invalidValues.empty,
    });
    expect(resNoSpec.status).toBe(400);

    // Whitespace-only FirstName
    const resBlankName = await tempDetailPage.createTempRawViaApi({
      ...validBase,
      email: `ctmq78_blankname_${Date.now()}@example.com`,
      firstName: tempMandatoryFieldsData.invalidValues.whitespace,
    });
    expect(resBlankName.status).toBe(400);
  });

  test('TC-10 - Backend PUT /api/temps/{id} rejects missing mandatory fields without data loss', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty } = await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const validBase = tempMandatoryFieldsData.generateValidTemp('tc10', certification, specialty);
    const created = await tempDetailPage.createTempViaApi(validBase);
    expect(created.id).toBeTruthy();

    try {
      // PUT with blank Certification
      const putNoCert = await tempDetailPage.updateTempRawViaApi(created.id, {
        ...validBase,
        certification: tempMandatoryFieldsData.invalidValues.empty,
      });
      expect(putNoCert.status).toBe(400);

      // PUT with blank Specialty
      const putNoSpec = await tempDetailPage.updateTempRawViaApi(created.id, {
        ...validBase,
        specialty: tempMandatoryFieldsData.invalidValues.whitespace,
      });
      expect(putNoSpec.status).toBe(400);

      // PUT with blank LastName
      const putNoLast = await tempDetailPage.updateTempRawViaApi(created.id, {
        ...validBase,
        lastName: tempMandatoryFieldsData.invalidValues.empty,
      });
      expect(putNoLast.status).toBe(400);

      // Confirm original data untouched
      const fetched = await tempDetailPage.getTempViaApi(created.id);
      expect(fetched.status).toBe(200);
      expect(fetched.body.lastName).toBe(validBase.lastName);
      expect(fetched.body.certification).toBe(certification);
      expect(fetched.body.specialty).toBe(specialty);
    } finally {
      await tempDetailPage.deleteTempViaApi(created.id);
    }
  });

  test('TC-11 - Backend rejects unmapped Specialty for selected active Certification on POST and PUT', async ({
    authenticatedAddTempPage,
    tempDetailPage,
  }) => {
    const { certification, specialty, unmappedSpecialty } =
      await authenticatedAddTempPage.getActiveMappedCertAndSpecialtyViaApi();
    const invalidSpecialty = unmappedSpecialty ?? tempMandatoryFieldsData.invalidValues.unmappedFallbackSpecialty;
    const validBase = tempMandatoryFieldsData.generateValidTemp('tc11', certification, specialty);

    // POST with unmapped specialty
    const postRes = await tempDetailPage.createTempRawViaApi({
      ...validBase,
      email: `ctmq78_unmapped_${Date.now()}@example.com`,
      specialty: invalidSpecialty,
    });
    expect(postRes.status).toBe(400);

    // PUT with unmapped specialty on valid temp
    const created = await tempDetailPage.createTempViaApi(validBase);
    expect(created.id).toBeTruthy();

    try {
      const putRes = await tempDetailPage.updateTempRawViaApi(created.id, {
        ...validBase,
        specialty: invalidSpecialty,
      });
      expect(putRes.status).toBe(400);
    } finally {
      await tempDetailPage.deleteTempViaApi(created.id);
    }
  });
});
