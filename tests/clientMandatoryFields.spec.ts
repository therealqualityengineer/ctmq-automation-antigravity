import { test, expect } from '../fixtures/customFixtures';
import { clientData } from '../test-data/clientData';

test.describe('CTMQ-80 - Client Mandatory Fields & Red Asterisk Indicators', () => {
  test('TC-01 - Verify red asterisk (*) indicator on all 6 mandatory field labels and absence on non-marked fields on Add Client (/client/new)', async ({
    authenticatedClientDetailPage,
  }) => {
    await authenticatedClientDetailPage.gotoAddClient();
    await expect(authenticatedClientDetailPage.pageHeading).toBeVisible();

    for (const label of clientData.mandatoryLabels) {
      const labelLocator = authenticatedClientDetailPage.getFieldLabel(label);
      const asteriskLocator = authenticatedClientDetailPage.getRequiredAsterisk(label);

      await expect(labelLocator, `Label "${label}" should be visible on /client/new`).toBeVisible();
      await expect(asteriskLocator, `Mandatory field "${label}" should display a red asterisk (*)`).toBeVisible();
      await expect(asteriskLocator).toHaveText('*');
    }

    for (const label of clientData.nonMarkedLabels) {
      const labelLocator = authenticatedClientDetailPage.getFieldLabel(label);
      const asteriskLocator = authenticatedClientDetailPage.getRequiredAsterisk(label);

      await expect(labelLocator, `Label "${label}" should be visible on /client/new`).toBeVisible();
      await expect(
        asteriskLocator,
        `Non-marked field "${label}" should NOT display a red asterisk (*)`
      ).toHaveCount(0);
    }
  });

  test('TC-02 - Verify red asterisk (*) indicator on all 6 mandatory field labels and absence on non-marked fields in both View and Edit modes on Client Detail (/client/:id)', async ({
    authenticatedClientDetailPage,
  }) => {
    const payload = clientData.generateClient('tc02');
    const created = await authenticatedClientDetailPage.createClientViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await authenticatedClientDetailPage.gotoClientDetail(created.id);
      await expect(authenticatedClientDetailPage.editButton).toBeVisible();

      // View mode verification
      for (const label of clientData.mandatoryLabels) {
        await expect(
          authenticatedClientDetailPage.getRequiredAsterisk(label),
          `View mode: mandatory field "${label}" should display red asterisk`
        ).toBeVisible();
      }
      for (const label of clientData.nonMarkedLabels) {
        await expect(
          authenticatedClientDetailPage.getRequiredAsterisk(label),
          `View mode: non-marked field "${label}" should NOT display red asterisk`
        ).toHaveCount(0);
      }

      // Transition to Edit mode and re-verify
      await authenticatedClientDetailPage.clickEdit();
      await expect(authenticatedClientDetailPage.saveButton).toBeVisible();

      for (const label of clientData.mandatoryLabels) {
        await expect(
          authenticatedClientDetailPage.getRequiredAsterisk(label),
          `Edit mode: mandatory field "${label}" should display red asterisk`
        ).toBeVisible();
      }
      for (const label of clientData.nonMarkedLabels) {
        await expect(
          authenticatedClientDetailPage.getRequiredAsterisk(label),
          `Edit mode: non-marked field "${label}" should NOT display red asterisk`
        ).toHaveCount(0);
      }
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(created.id);
    }
  });

  test('TC-03 - Successfully create a new Client and update in Edit mode when all 6 mandatory fields are populated', async ({
    authenticatedClientDetailPage,
  }) => {
    const payload = clientData.generateClient('tc03');
    await authenticatedClientDetailPage.gotoAddClient();
    await expect(authenticatedClientDetailPage.pageHeading).toBeVisible();

    await authenticatedClientDetailPage.fillForm(payload);
    const postRes = await authenticatedClientDetailPage.saveAndInterceptPostResponse();

    expect(postRes.status).toBe(201);
    expect(postRes.body?.id).toBeTruthy();
    await expect(authenticatedClientDetailPage.createSuccessBanner).toBeVisible();

    const createdId = postRes.body.id;
    try {
      await authenticatedClientDetailPage.gotoClientDetail(createdId);
      await authenticatedClientDetailPage.clickEdit();
      await expect(authenticatedClientDetailPage.saveButton).toBeVisible();

      const updatedPayload = clientData.generateClient('tc03-updated');
      await authenticatedClientDetailPage.fillAddress(updatedPayload.address);
      const putRes = await authenticatedClientDetailPage.saveAndInterceptPutResponse();

      expect(putRes.status).toBe(200);
      await expect(authenticatedClientDetailPage.saveSuccessBanner).toBeVisible();

      const fetched = await authenticatedClientDetailPage.getClientViaApi(createdId);
      expect(fetched.status).toBe(200);
      expect(fetched.body.fullName).toBe(payload.fullName);
      expect(fetched.body.address).toBe(updatedPayload.address);
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(createdId);
    }
  });

  test('TC-04 - Frontend required-field validation blocks Add Client (/client/new) submission when any mandatory field is missing', async ({
    authenticatedClientDetailPage,
  }) => {
    const payload = clientData.generateClient('tc04');
    await authenticatedClientDetailPage.gotoAddClient();
    await expect(authenticatedClientDetailPage.pageHeading).toBeVisible();
    await authenticatedClientDetailPage.fillForm(payload);

    const mandatoryChecks = [
      {
        name: 'Full Name',
        locator: authenticatedClientDetailPage.fullNameInput,
        clear: () => authenticatedClientDetailPage.clearFullName(),
        restore: () => authenticatedClientDetailPage.fullNameInput.fill(payload.fullName),
      },
      {
        name: 'Email',
        locator: authenticatedClientDetailPage.emailInput,
        clear: () => authenticatedClientDetailPage.clearEmail(),
        restore: () => authenticatedClientDetailPage.emailInput.fill(payload.email),
      },
      {
        name: 'Address',
        locator: authenticatedClientDetailPage.addressInput,
        clear: () => authenticatedClientDetailPage.clearAddress(),
        restore: () => authenticatedClientDetailPage.addressInput.fill(payload.address),
      },
      {
        name: 'City',
        locator: authenticatedClientDetailPage.cityInput,
        clear: () => authenticatedClientDetailPage.clearCity(),
        restore: () => authenticatedClientDetailPage.cityInput.fill(payload.city),
      },
      {
        name: 'State',
        locator: authenticatedClientDetailPage.stateSelect,
        clear: () => authenticatedClientDetailPage.clearState(),
        restore: () => authenticatedClientDetailPage.stateSelect.selectOption(payload.state),
      },
      {
        name: 'ZIP',
        locator: authenticatedClientDetailPage.zipInput,
        clear: () => authenticatedClientDetailPage.clearZip(),
        restore: () => authenticatedClientDetailPage.fillZip(payload.zip),
      },
    ];

    for (const check of mandatoryChecks) {
      await check.clear();
      await authenticatedClientDetailPage.clickSave();

      const isInvalid = await authenticatedClientDetailPage.isFieldInvalid(check.locator);
      const isAlertVisible = await authenticatedClientDetailPage.feedbackErrorBanner.isVisible().catch(() => false);
      expect(isInvalid || isAlertVisible, `Empty "${check.name}" on /client/new should block submission`).toBe(true);
      await expect(authenticatedClientDetailPage.createSuccessBanner).toHaveCount(0);

      await check.restore();
    }
  });

  test('TC-05 - Frontend required-field validation blocks Edit Client (/client/:id) save when any of the 6 mandatory fields is cleared', async ({
    authenticatedClientDetailPage,
  }) => {
    const payload = clientData.generateClient('tc05');
    const created = await authenticatedClientDetailPage.createClientViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await authenticatedClientDetailPage.gotoClientDetail(created.id);
      await authenticatedClientDetailPage.clickEdit();
      await expect(authenticatedClientDetailPage.saveButton).toBeVisible();

      const editChecks = [
        {
          name: 'Full Name',
          clear: () => authenticatedClientDetailPage.clearFullName(),
          restore: () => authenticatedClientDetailPage.fullNameInput.fill(payload.fullName),
        },
        {
          name: 'Email',
          clear: () => authenticatedClientDetailPage.clearEmail(),
          restore: () => authenticatedClientDetailPage.emailInput.fill(payload.email),
        },
        {
          name: 'Address',
          clear: () => authenticatedClientDetailPage.clearAddress(),
          restore: () => authenticatedClientDetailPage.addressInput.fill(payload.address),
        },
        {
          name: 'City',
          clear: () => authenticatedClientDetailPage.clearCity(),
          restore: () => authenticatedClientDetailPage.cityInput.fill(payload.city),
        },
        {
          name: 'State',
          clear: () => authenticatedClientDetailPage.clearState(),
          restore: () => authenticatedClientDetailPage.stateSelect.selectOption(payload.state),
        },
        {
          name: 'ZIP',
          clear: () => authenticatedClientDetailPage.clearZip(),
          restore: () => authenticatedClientDetailPage.fillZip(payload.zip),
        },
      ];

      for (const check of editChecks) {
        await check.clear();
        await authenticatedClientDetailPage.clickSave();

        await expect(
          authenticatedClientDetailPage.feedbackErrorBanner,
          `Clearing "${check.name}" in Edit mode should display FeedbackBanner error`
        ).toBeVisible();
        await expect(authenticatedClientDetailPage.feedbackErrorBanner).toContainText(
          clientData.messages.requiredErrorPattern
        );
        await expect(authenticatedClientDetailPage.saveSuccessBanner).toHaveCount(0);

        await check.restore();
      }

      // Confirm persisted values were never overwritten with empty data
      const fetched = await authenticatedClientDetailPage.getClientViaApi(created.id);
      expect(fetched.status).toBe(200);
      expect(fetched.body.fullName).toBe(payload.fullName);
      expect(fetched.body.email).toBe(payload.email);
      expect(fetched.body.zip).toBe(payload.zip);
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(created.id);
    }
  });

  test('TC-06 - Backend POST /api/clients rejects requests with missing or blank mandatory fields with 400 Bad Request', async ({
    authenticatedClientDetailPage,
  }) => {
    const validBase = clientData.generateClient('tc06');
    const mandatoryKeys: Array<keyof typeof validBase> = ['fullName', 'email', 'address', 'city', 'state', 'zip'];

    for (const key of mandatoryKeys) {
      const uniqueAttempt = clientData.generateClient(`tc06-${key}`);
      const res = await authenticatedClientDetailPage.createClientRawViaApi({
        ...uniqueAttempt,
        [key]: clientData.invalidValues.empty,
      });
      expect(res.status, `POST /api/clients with empty "${key}" should return 400 Bad Request`).toBe(400);
    }
  });

  test('TC-07 - Backend PUT /api/clients/{id} rejects updates with missing or blank mandatory fields with 400 Bad Request', async ({
    authenticatedClientDetailPage,
  }) => {
    const validBase = clientData.generateClient('tc07');
    const created = await authenticatedClientDetailPage.createClientViaApi(validBase);
    expect(created.id).toBeTruthy();

    try {
      const mandatoryKeys: Array<keyof typeof validBase> = ['fullName', 'email', 'address', 'city', 'state', 'zip'];

      for (const key of mandatoryKeys) {
        const res = await authenticatedClientDetailPage.updateClientRawViaApi(created.id, {
          ...validBase,
          [key]: clientData.invalidValues.empty,
        });
        expect(res.status, `PUT /api/clients/${created.id} with empty "${key}" should return 400 Bad Request`).toBe(
          400
        );
      }

      // Verify existing Client data remains untouched
      const fetched = await authenticatedClientDetailPage.getClientViaApi(created.id);
      expect(fetched.status).toBe(200);
      expect(fetched.body.fullName).toBe(validBase.fullName);
      expect(fetched.body.email).toBe(validBase.email);
      expect(fetched.body.address).toBe(validBase.address);
      expect(fetched.body.city).toBe(validBase.city);
      expect(fetched.body.state).toBe(validBase.state);
      expect(fetched.body.zip).toBe(validBase.zip);
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(created.id);
    }
  });

  test('TC-08 - Whitespace-only values in mandatory fields are rejected on UI save and Backend POST/PUT APIs', async ({
    authenticatedClientDetailPage,
  }) => {
    const validBase = clientData.generateClient('tc08');

    // 1. UI Add Client with whitespace-only Full Name
    await authenticatedClientDetailPage.gotoAddClient();
    await authenticatedClientDetailPage.fillForm({
      ...validBase,
      fullName: clientData.invalidValues.whitespace,
    });
    await authenticatedClientDetailPage.clickSave();
    await expect(authenticatedClientDetailPage.feedbackErrorBanner).toBeVisible();
    await expect(authenticatedClientDetailPage.createSuccessBanner).toHaveCount(0);

    // 2. Backend POST /api/clients with whitespace-only mandatory fields
    const postWhitespaceName = await authenticatedClientDetailPage.createClientRawViaApi({
      ...validBase,
      fullName: clientData.invalidValues.whitespace,
    });
    expect(postWhitespaceName.status).toBe(400);

    const postWhitespaceCity = await authenticatedClientDetailPage.createClientRawViaApi({
      ...validBase,
      city: clientData.invalidValues.whitespace,
    });
    expect(postWhitespaceCity.status).toBe(400);

    // 3. UI Edit Client & Backend PUT /api/clients/{id} with whitespace-only values
    const created = await authenticatedClientDetailPage.createClientViaApi(validBase);
    expect(created.id).toBeTruthy();

    try {
      await authenticatedClientDetailPage.gotoClientDetail(created.id);
      await authenticatedClientDetailPage.clickEdit();
      await authenticatedClientDetailPage.fullNameInput.fill(clientData.invalidValues.whitespace);
      await authenticatedClientDetailPage.clickSave();

      await expect(authenticatedClientDetailPage.feedbackErrorBanner).toBeVisible();
      await expect(authenticatedClientDetailPage.saveSuccessBanner).toHaveCount(0);

      const putWhitespaceAddress = await authenticatedClientDetailPage.updateClientRawViaApi(created.id, {
        ...validBase,
        address: clientData.invalidValues.whitespace,
      });
      expect(putWhitespaceAddress.status).toBe(400);
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(created.id);
    }
  });

  test('TC-09 - Zero Data Loss & two-column FieldRow layout integrity across View/Edit mode transitions', async ({
    authenticatedClientDetailPage,
  }) => {
    const beforeList = await authenticatedClientDetailPage.getClientsListViaApi();
    expect(beforeList.status).toBe(200);
    const baselinePermanentIds = beforeList.items
      .filter((c: any) => !String(c.fullName || '').includes('Global Client tc0'))
      .map((c: any) => c.id);

    const payload = clientData.generateClient('tc09');
    const created = await authenticatedClientDetailPage.createClientViaApi(payload);
    expect(created.id).toBeTruthy();

    try {
      await authenticatedClientDetailPage.gotoClientDetail(created.id);
      await expect(authenticatedClientDetailPage.editButton).toBeVisible();
      expect(await authenticatedClientDetailPage.isTwoColumnLayout()).toBe(true);
      expect(await authenticatedClientDetailPage.areAllFieldsDisabled()).toBe(true);

      // Enter Edit mode, trigger required field validation error, then Cancel back to View mode
      await authenticatedClientDetailPage.clickEdit();
      await expect(authenticatedClientDetailPage.saveButton).toBeVisible();
      expect(await authenticatedClientDetailPage.areAllFieldsEnabled()).toBe(true);

      await authenticatedClientDetailPage.clearFullName();
      await authenticatedClientDetailPage.clickSave();
      await expect(authenticatedClientDetailPage.feedbackErrorBanner).toBeVisible();

      await authenticatedClientDetailPage.clickCancel();
      await expect(authenticatedClientDetailPage.editButton).toBeVisible();
      expect(await authenticatedClientDetailPage.areAllFieldsDisabled()).toBe(true);
      expect(await authenticatedClientDetailPage.isTwoColumnLayout()).toBe(true);
      await expect(authenticatedClientDetailPage.fullNameInput).toHaveValue(payload.fullName);
    } finally {
      await authenticatedClientDetailPage.deleteClientViaApi(created.id);
    }

    const afterList = await authenticatedClientDetailPage.getClientsListViaApi();
    expect(afterList.status).toBe(200);
    const afterPermanentIds = afterList.items
      .filter((c: any) => !String(c.fullName || '').includes('Global Client tc0'))
      .map((c: any) => c.id);
    expect(afterPermanentIds).toEqual(baselinePermanentIds);
  });
});
