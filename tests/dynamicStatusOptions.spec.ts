import { test, expect } from '../fixtures/customFixtures';
import { statusOptionsData } from '../test-data/statusOptionsData';
import { addTempData } from '../test-data/addTempData';
import { clientData } from '../test-data/clientData';

test.describe('CTMQ-75 - Dynamically populate Temp and Client Status dropdowns from active Admin Status Options', () => {
  test('TC-01 - API filters active Temp Status Options ordered by DisplayOrder then Name', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const orderLowNameB = statusOptionsData.dynamicDropdowns.generateShortStatus('TmpB');
    const orderLowNameA = statusOptionsData.dynamicDropdowns.generateShortStatus('TmpA');
    const orderHighName = statusOptionsData.dynamicDropdowns.generateShortStatus('TmpZ');
    const inactiveTempName = statusOptionsData.dynamicDropdowns.generateShortStatus('TmpIn');
    const activeClientName = statusOptionsData.dynamicDropdowns.generateShortStatus('CliEx');

    const resB = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: orderLowNameB,
      isActive: true,
      displayOrder: 50,
    });
    const resA = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: orderLowNameA,
      isActive: true,
      displayOrder: 50,
    });
    const resZ = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: orderHighName,
      isActive: true,
      displayOrder: 60,
    });
    const resIn = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: inactiveTempName,
      isActive: false,
      displayOrder: 1,
    });
    const resCli = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: activeClientName,
      isActive: true,
      displayOrder: 1,
    });

    try {
      const { status: statusParamCode, body: statusParamBody } =
        await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
          entityType: 'Temp',
          status: statusOptionsData.status.active,
          pageSize: 500,
        });
      expect(statusParamCode).toBe(200);
      expect(Array.isArray(statusParamBody.items)).toBe(true);

      for (const item of statusParamBody.items) {
        expect(item.entityType).toBe(statusOptionsData.tabs.temp);
        expect(item.isActive).toBe(true);
      }

      const returnedNames = statusParamBody.items.map((i: any) => i.name);
      expect(returnedNames).toContain(orderLowNameA);
      expect(returnedNames).toContain(orderLowNameB);
      expect(returnedNames).toContain(orderHighName);
      expect(returnedNames).not.toContain(inactiveTempName);
      expect(returnedNames).not.toContain(activeClientName);

      // Verify ordering by DisplayOrder ascending, then Name ascending
      const idxA = returnedNames.indexOf(orderLowNameA);
      const idxB = returnedNames.indexOf(orderLowNameB);
      const idxZ = returnedNames.indexOf(orderHighName);
      expect(idxA).toBeLessThan(idxB);
      expect(idxB).toBeLessThan(idxZ);

      // Also verify ?isActive=true filter parameter
      const { status: isActiveCode, body: isActiveBody } =
        await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
          entityType: 'Temp',
          isActive: true,
          pageSize: 500,
        });
      expect(isActiveCode).toBe(200);
      const isActiveNames = isActiveBody.items.map((i: any) => i.name);
      expect(isActiveNames).toContain(orderLowNameA);
      expect(isActiveNames).not.toContain(inactiveTempName);
    } finally {
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resB.body.id, {
        entityType: 'Temp',
        name: orderLowNameB,
        isActive: false,
        displayOrder: 50,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resA.body.id, {
        entityType: 'Temp',
        name: orderLowNameA,
        isActive: false,
        displayOrder: 50,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resZ.body.id, {
        entityType: 'Temp',
        name: orderHighName,
        isActive: false,
        displayOrder: 60,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resCli.body.id, {
        entityType: 'Client',
        name: activeClientName,
        isActive: false,
        displayOrder: 1,
      });
      expect(resIn.status).toBe(201);
    }
  });

  test('TC-02 - API filters active Client Status Options ordered by DisplayOrder then Name', async ({
    authenticatedStatusOptionsPage,
  }) => {
    const orderLowNameB = statusOptionsData.dynamicDropdowns.generateShortStatus('CliB');
    const orderLowNameA = statusOptionsData.dynamicDropdowns.generateShortStatus('CliA');
    const orderHighName = statusOptionsData.dynamicDropdowns.generateShortStatus('CliZ');
    const inactiveClientName = statusOptionsData.dynamicDropdowns.generateShortStatus('CliIn');
    const activeTempName = statusOptionsData.dynamicDropdowns.generateShortStatus('TmpEx');

    const resB = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: orderLowNameB,
      isActive: true,
      displayOrder: 50,
    });
    const resA = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: orderLowNameA,
      isActive: true,
      displayOrder: 50,
    });
    const resZ = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: orderHighName,
      isActive: true,
      displayOrder: 60,
    });
    const resIn = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: inactiveClientName,
      isActive: false,
      displayOrder: 1,
    });
    const resTmp = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: activeTempName,
      isActive: true,
      displayOrder: 1,
    });

    try {
      const { status: statusParamCode, body: statusParamBody } =
        await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
          entityType: 'Client',
          status: statusOptionsData.status.active,
          pageSize: 500,
        });
      expect(statusParamCode).toBe(200);
      expect(Array.isArray(statusParamBody.items)).toBe(true);

      for (const item of statusParamBody.items) {
        expect(item.entityType).toBe(statusOptionsData.tabs.client);
        expect(item.isActive).toBe(true);
      }

      const returnedNames = statusParamBody.items.map((i: any) => i.name);
      expect(returnedNames).toContain(orderLowNameA);
      expect(returnedNames).toContain(orderLowNameB);
      expect(returnedNames).toContain(orderHighName);
      expect(returnedNames).not.toContain(inactiveClientName);
      expect(returnedNames).not.toContain(activeTempName);

      // Verify ordering by DisplayOrder ascending, then Name ascending
      const idxA = returnedNames.indexOf(orderLowNameA);
      const idxB = returnedNames.indexOf(orderLowNameB);
      const idxZ = returnedNames.indexOf(orderHighName);
      expect(idxA).toBeLessThan(idxB);
      expect(idxB).toBeLessThan(idxZ);

      // Verify ?isActive=true filter parameter
      const { status: isActiveCode, body: isActiveBody } =
        await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
          entityType: 'Client',
          isActive: true,
          pageSize: 500,
        });
      expect(isActiveCode).toBe(200);
      const isActiveNames = isActiveBody.items.map((i: any) => i.name);
      expect(isActiveNames).toContain(orderLowNameA);
      expect(isActiveNames).not.toContain(inactiveClientName);
    } finally {
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resB.body.id, {
        entityType: 'Client',
        name: orderLowNameB,
        isActive: false,
        displayOrder: 50,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resA.body.id, {
        entityType: 'Client',
        name: orderLowNameA,
        isActive: false,
        displayOrder: 50,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resZ.body.id, {
        entityType: 'Client',
        name: orderHighName,
        isActive: false,
        displayOrder: 60,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(resTmp.body.id, {
        entityType: 'Temp',
        name: activeTempName,
        isActive: false,
        displayOrder: 1,
      });
      expect(resIn.status).toBe(201);
    }
  });

  test('TC-03 - Create Temp page dynamically populates active Temp Status Options with "Active" default', async ({
    authenticatedStatusOptionsPage,
    addTempPage,
  }) => {
    const customTempStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('Onb');

    await authenticatedStatusOptionsPage.switchToTempTab();
    await authenticatedStatusOptionsPage.createStatusOption(
      customTempStatus,
      statusOptionsData.testPayloads.tempOption.description,
      statusOptionsData.status.active
    );
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();

    try {
      await addTempPage.gotoAddTemp();
      await expect(addTempPage.pageHeading).toBeVisible();

      const options = await addTempPage.getStatusOptionTexts();
      for (const baseline of statusOptionsData.dynamicDropdowns.baselineStatuses) {
        expect(options).toContain(baseline);
      }
      expect(options).toContain(customTempStatus);

      const defaultSelected = await addTempPage.getSelectedStatus();
      expect(defaultSelected).toBe(statusOptionsData.dynamicDropdowns.defaultStatus);
    } finally {
      const listRes = await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
        entityType: 'Temp',
        pageSize: 500,
      });
      const created = listRes.body.items?.find((i: any) => i.name === customTempStatus);
      if (created) {
        await authenticatedStatusOptionsPage.updateStatusOptionViaApi(created.id, {
          entityType: 'Temp',
          name: customTempStatus,
          isActive: false,
        });
      }
    }
  });

  test('TC-04 - Create Client page dynamically populates active Client Status Options with "Active" default', async ({
    authenticatedStatusOptionsPage,
    clientDetailPage,
  }) => {
    const customClientStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('Prsp');

    if (!(await authenticatedStatusOptionsPage.isClientTabActive())) {
      await authenticatedStatusOptionsPage.switchToClientTab();
    }
    await authenticatedStatusOptionsPage.createStatusOption(
      customClientStatus,
      statusOptionsData.testPayloads.clientOption.description,
      statusOptionsData.status.active
    );
    await expect(authenticatedStatusOptionsPage.modalDialog).toBeHidden();

    try {
      await clientDetailPage.gotoAddClient();
      await expect(clientDetailPage.pageHeading).toBeVisible();

      const options = await clientDetailPage.getStatusOptionTexts();
      for (const baseline of statusOptionsData.dynamicDropdowns.baselineStatuses) {
        expect(options).toContain(baseline);
      }
      expect(options).toContain(customClientStatus);

      const defaultSelected = await clientDetailPage.getSelectedStatus();
      expect(defaultSelected).toBe(statusOptionsData.dynamicDropdowns.defaultStatus);
    } finally {
      const listRes = await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
        entityType: 'Client',
        pageSize: 500,
      });
      const created = listRes.body.items?.find((i: any) => i.name === customClientStatus);
      if (created) {
        await authenticatedStatusOptionsPage.updateStatusOptionViaApi(created.id, {
          entityType: 'Client',
          name: customClientStatus,
          isActive: false,
        });
      }
    }
  });

  test('TC-05 - Create and Edit Temp using newly added active Status Option', async ({
    authenticatedStatusOptionsPage,
    addTempPage,
    tempDetailPage,
  }) => {
    const customTempStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('Onb');
    const createdOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: customTempStatus,
      isActive: true,
    });
    let createdTempId: number | undefined;

    try {
      await addTempPage.gotoAddTemp();
      await expect(addTempPage.pageHeading).toBeVisible();

      const tempPayload = {
        ...addTempData.generateTemp('tc05'),
        status: customTempStatus,
      };
      await addTempPage.fillForm(tempPayload);
      const { status: postStatus, body: postBody } = await addTempPage.saveAndInterceptApiResponse();
      expect(postStatus).toBe(201);
      expect(postBody.status).toBe(customTempStatus);
      createdTempId = postBody.id;

      await tempDetailPage.gotoTempDetail(createdTempId!);
      expect(await tempDetailPage.getSelectedStatus()).toBe(customTempStatus);

      await tempDetailPage.clickEdit();
      const editOptions = await tempDetailPage.getStatusOptionTexts();
      expect(editOptions).toContain(customTempStatus);
      expect(editOptions).toContain(addTempData.statuses.inactive);

      await tempDetailPage.selectStatus(addTempData.statuses.inactive);
      const { status: putStatus, body: putBody } = await tempDetailPage.saveAndInterceptPutResponse();
      expect(putStatus).toBe(200);
      expect(putBody.status).toBe(addTempData.statuses.inactive);
    } finally {
      if (createdTempId) {
        await tempDetailPage.deleteTempViaApi(createdTempId);
      }
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(createdOption.body.id, {
        entityType: 'Temp',
        name: customTempStatus,
        isActive: false,
      });
    }
  });

  test('TC-06 - Create and Edit Client using newly added active Status Option', async ({
    authenticatedStatusOptionsPage,
    clientDetailPage,
  }) => {
    const customClientStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('Prsp');
    const createdOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: customClientStatus,
      isActive: true,
    });
    let createdClientId: number | undefined;

    try {
      await clientDetailPage.gotoAddClient();
      await expect(clientDetailPage.pageHeading).toBeVisible();

      const clientPayload = {
        ...clientData.generateClient('tc06'),
        status: customClientStatus,
      };
      await clientDetailPage.fillForm(clientPayload);
      const { status: postStatus, body: postBody } = await clientDetailPage.saveAndInterceptPostResponse();
      expect(postStatus).toBe(201);
      expect(postBody.status).toBe(customClientStatus);
      createdClientId = postBody.id;

      await clientDetailPage.gotoClientDetail(createdClientId!);
      expect(await clientDetailPage.getSelectedStatus()).toBe(customClientStatus);

      await clientDetailPage.clickEdit();
      const editOptions = await clientDetailPage.getStatusOptionTexts();
      expect(editOptions).toContain(customClientStatus);
      expect(editOptions).toContain(clientData.statuses.inactive);

      await clientDetailPage.selectStatus(clientData.statuses.inactive);
      const { status: putStatus, body: putBody } = await clientDetailPage.saveAndInterceptPutResponse();
      expect(putStatus).toBe(200);
      expect(putBody.status).toBe(clientData.statuses.inactive);
    } finally {
      if (createdClientId) {
        await clientDetailPage.deleteClientViaApi(createdClientId);
      }
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(createdOption.body.id, {
        entityType: 'Client',
        name: customClientStatus,
        isActive: false,
      });
    }
  });

  test('TC-07 - Inactive Status Options are excluded from Temp and Client dropdowns', async ({
    authenticatedStatusOptionsPage,
    addTempPage,
    tempDetailPage,
    clientDetailPage,
  }) => {
    const inactiveTempStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('TInac');
    const inactiveClientStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('CInac');

    await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: inactiveTempStatus,
      isActive: false,
    });
    await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: inactiveClientStatus,
      isActive: false,
    });

    const createdTemp = await tempDetailPage.createTempViaApi(addTempData.generateTemp('tc07'));
    const createdClient = await clientDetailPage.createClientViaApi(clientData.generateClient('tc07'));

    try {
      // Check Add Temp
      await addTempPage.gotoAddTemp();
      const addTempOptions = await addTempPage.getStatusOptionTexts();
      expect(addTempOptions).not.toContain(inactiveTempStatus);

      // Check Edit Temp
      await tempDetailPage.gotoTempDetail(createdTemp.id);
      await tempDetailPage.clickEdit();
      const editTempOptions = await tempDetailPage.getStatusOptionTexts();
      expect(editTempOptions).not.toContain(inactiveTempStatus);

      // Check Add Client
      await clientDetailPage.gotoAddClient();
      const addClientOptions = await clientDetailPage.getStatusOptionTexts();
      expect(addClientOptions).not.toContain(inactiveClientStatus);

      // Check Edit Client
      await clientDetailPage.gotoClientDetail(createdClient.id);
      await clientDetailPage.clickEdit();
      const editClientOptions = await clientDetailPage.getStatusOptionTexts();
      expect(editClientOptions).not.toContain(inactiveClientStatus);
    } finally {
      await tempDetailPage.deleteTempViaApi(createdTemp.id);
      await clientDetailPage.deleteClientViaApi(createdClient.id);
    }
  });

  test('TC-08 - Entity isolation between Temp and Client Status dropdowns', async ({
    authenticatedStatusOptionsPage,
    addTempPage,
    clientDetailPage,
  }) => {
    const tempOnlyStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('TOnly');
    const clientOnlyStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('COnly');

    const tOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: tempOnlyStatus,
      isActive: true,
    });
    const cOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: clientOnlyStatus,
      isActive: true,
    });

    try {
      await addTempPage.gotoAddTemp();
      const tempOptions = await addTempPage.getStatusOptionTexts();
      expect(tempOptions).toContain(tempOnlyStatus);
      expect(tempOptions).not.toContain(clientOnlyStatus);

      await clientDetailPage.gotoAddClient();
      const clientOptions = await clientDetailPage.getStatusOptionTexts();
      expect(clientOptions).toContain(clientOnlyStatus);
      expect(clientOptions).not.toContain(tempOnlyStatus);
    } finally {
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(tOption.body.id, {
        entityType: 'Temp',
        name: tempOnlyStatus,
        isActive: false,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(cOption.body.id, {
        entityType: 'Client',
        name: clientOnlyStatus,
        isActive: false,
      });
    }
  });

  test('TC-09 - Backend rejects invalid, inactive, or cross-entity status on Temp/Client create and update', async ({
    authenticatedStatusOptionsPage,
    tempDetailPage,
    clientDetailPage,
  }) => {
    const inactiveTempStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('TIn09');
    const inactiveClientStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('CIn09');
    const tempOnlyStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('TOn09');
    const clientOnlyStatus = statusOptionsData.dynamicDropdowns.generateShortStatus('COn09');

    await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: inactiveTempStatus,
      isActive: false,
    });
    await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: inactiveClientStatus,
      isActive: false,
    });
    const tOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: tempOnlyStatus,
      isActive: true,
    });
    const cOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: clientOnlyStatus,
      isActive: true,
    });

    const existingTemp = await tempDetailPage.createTempViaApi(addTempData.generateTemp('tc09'));
    const existingClient = await clientDetailPage.createClientViaApi(clientData.generateClient('tc09'));

    try {
      const invalidTempStatuses = [
        statusOptionsData.dynamicDropdowns.invalidStatusName,
        inactiveTempStatus,
        clientOnlyStatus,
      ];

      for (const badStatus of invalidTempStatuses) {
        const postRes = await tempDetailPage.createTempRawViaApi({
          ...addTempData.generateTemp('badPost'),
          status: badStatus,
        });
        expect(postRes.status).toBe(400);
        expect(postRes.body.message).toMatch(statusOptionsData.dynamicDropdowns.invalidStatusErrorPattern);

        const putRes = await tempDetailPage.updateTempRawViaApi(existingTemp.id, {
          ...existingTemp,
          status: badStatus,
        });
        expect(putRes.status).toBe(400);
        expect(putRes.body.message).toMatch(statusOptionsData.dynamicDropdowns.invalidStatusErrorPattern);
      }

      const invalidClientStatuses = [
        statusOptionsData.dynamicDropdowns.invalidStatusName,
        inactiveClientStatus,
        tempOnlyStatus,
      ];

      for (const badStatus of invalidClientStatuses) {
        const postRes = await clientDetailPage.createClientRawViaApi({
          ...clientData.generateClient('badPost'),
          status: badStatus,
        });
        expect(postRes.status).toBe(400);
        expect(postRes.body.message).toMatch(statusOptionsData.dynamicDropdowns.invalidStatusErrorPattern);

        const putRes = await clientDetailPage.updateClientRawViaApi(existingClient.id, {
          ...existingClient,
          status: badStatus,
        });
        expect(putRes.status).toBe(400);
        expect(putRes.body.message).toMatch(statusOptionsData.dynamicDropdowns.invalidStatusErrorPattern);
      }
    } finally {
      await tempDetailPage.deleteTempViaApi(existingTemp.id);
      await clientDetailPage.deleteClientViaApi(existingClient.id);
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(tOption.body.id, {
        entityType: 'Temp',
        name: tempOnlyStatus,
        isActive: false,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(cOption.body.id, {
        entityType: 'Client',
        name: clientOnlyStatus,
        isActive: false,
      });
    }
  });

  test('TC-10 - Existing Temp/Client with subsequently inactivated status preserves data on View/Edit', async ({
    authenticatedStatusOptionsPage,
    tempDetailPage,
    clientDetailPage,
  }) => {
    const tempStatusName = statusOptionsData.dynamicDropdowns.generateShortStatus('TLeg');
    const clientStatusName = statusOptionsData.dynamicDropdowns.generateShortStatus('CLeg');

    const tOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Temp',
      name: tempStatusName,
      isActive: true,
    });
    const cOption = await authenticatedStatusOptionsPage.createStatusOptionViaApi({
      entityType: 'Client',
      name: clientStatusName,
      isActive: true,
    });

    const createdTemp = await tempDetailPage.createTempViaApi({
      ...addTempData.generateTemp('tc10'),
      status: tempStatusName,
    });
    const createdClient = await clientDetailPage.createClientViaApi({
      ...clientData.generateClient('tc10'),
      status: clientStatusName,
    });

    try {
      // Deactivate both status options
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(tOption.body.id, {
        entityType: 'Temp',
        name: tempStatusName,
        isActive: false,
      });
      await authenticatedStatusOptionsPage.updateStatusOptionViaApi(cOption.body.id, {
        entityType: 'Client',
        name: clientStatusName,
        isActive: false,
      });

      // Verify Temp View and Edit preserves status and saves unrelated field
      await tempDetailPage.gotoTempDetail(createdTemp.id);
      expect(await tempDetailPage.getSelectedStatus()).toBe(tempStatusName);
      expect(await tempDetailPage.getStatusOptionTexts()).toContain(tempStatusName);

      await tempDetailPage.clickEdit();
      expect(await tempDetailPage.getSelectedStatus()).toBe(tempStatusName);
      await tempDetailPage.fillAddress(statusOptionsData.dynamicDropdowns.updatedTempAddress);
      const { status: tempPutStatus, body: tempPutBody } = await tempDetailPage.saveAndInterceptPutResponse();
      expect(tempPutStatus).toBe(200);
      expect(tempPutBody.status).toBe(tempStatusName);
      expect(tempPutBody.address).toBe(statusOptionsData.dynamicDropdowns.updatedTempAddress);

      // Verify Client View and Edit preserves status and saves unrelated field
      await clientDetailPage.gotoClientDetail(createdClient.id);
      expect(await clientDetailPage.getSelectedStatus()).toBe(clientStatusName);
      expect(await clientDetailPage.getStatusOptionTexts()).toContain(clientStatusName);

      await clientDetailPage.clickEdit();
      expect(await clientDetailPage.getSelectedStatus()).toBe(clientStatusName);
      await clientDetailPage.fillAddress(statusOptionsData.dynamicDropdowns.updatedClientAddress);
      const { status: clientPutStatus, body: clientPutBody } = await clientDetailPage.saveAndInterceptPutResponse();
      expect(clientPutStatus).toBe(200);
      expect(clientPutBody.status).toBe(clientStatusName);
      expect(clientPutBody.address).toBe(statusOptionsData.dynamicDropdowns.updatedClientAddress);
    } finally {
      await tempDetailPage.deleteTempViaApi(createdTemp.id);
      await clientDetailPage.deleteClientViaApi(createdClient.id);
    }
  });

  test('TC-11 - Default "Active" selection fallback when "Active" option is inactive or absent', async ({
    authenticatedAddTempPage,
  }) => {
    await authenticatedAddTempPage.mockApiResponse(
      /\/api\/admin\/status-options.*entityType=Temp/,
      200,
      statusOptionsData.dynamicDropdowns.fallbackMockPayload,
      'GET'
    );

    try {
      await authenticatedAddTempPage.gotoAddTemp();
      await expect(authenticatedAddTempPage.pageHeading).toBeVisible();

      const options = await authenticatedAddTempPage.getStatusOptionTexts();
      const expectedNames = statusOptionsData.dynamicDropdowns.fallbackMockPayload.items.map((i) => i.name);
      expect(options).toEqual(expectedNames);
      expect(options).not.toContain(statusOptionsData.dynamicDropdowns.defaultStatus);

      const selectedValue = await authenticatedAddTempPage.getSelectedStatus();
      expect(selectedValue).not.toBe(statusOptionsData.dynamicDropdowns.defaultStatus);
      expect(expectedNames).toContain(selectedValue);
    } finally {
      await authenticatedAddTempPage.clearApiMocks();
    }
  });

  test('TC-12 - Baseline Status Options ("Active", "Inactive") exist and existing records remain compatible', async ({
    authenticatedStatusOptionsPage,
    tempDetailPage,
    clientDetailPage,
  }) => {
    const tempStatusRes = await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
      entityType: 'Temp',
      status: statusOptionsData.status.active,
      pageSize: 500,
    });
    expect(tempStatusRes.status).toBe(200);
    const tempStatusNames = tempStatusRes.body.items.map((i: any) => i.name);
    for (const baseline of statusOptionsData.dynamicDropdowns.baselineStatuses) {
      expect(tempStatusNames).toContain(baseline);
    }

    const clientStatusRes = await authenticatedStatusOptionsPage.getStatusOptionsViaApi({
      entityType: 'Client',
      status: statusOptionsData.status.active,
      pageSize: 500,
    });
    expect(clientStatusRes.status).toBe(200);
    const clientStatusNames = clientStatusRes.body.items.map((i: any) => i.name);
    for (const baseline of statusOptionsData.dynamicDropdowns.baselineStatuses) {
      expect(clientStatusNames).toContain(baseline);
    }

    const activeTemp = await tempDetailPage.createTempViaApi({
      ...addTempData.generateTemp('tc12act'),
      status: addTempData.statuses.active,
    });
    const inactiveTemp = await tempDetailPage.createTempViaApi({
      ...addTempData.generateTemp('tc12inact'),
      status: addTempData.statuses.inactive,
    });
    const activeClient = await clientDetailPage.createClientViaApi({
      ...clientData.generateClient('tc12act'),
      status: clientData.statuses.active,
    });
    const inactiveClient = await clientDetailPage.createClientViaApi({
      ...clientData.generateClient('tc12inact'),
      status: clientData.statuses.inactive,
    });

    try {
      await tempDetailPage.gotoTempDetail(activeTemp.id);
      expect(await tempDetailPage.getSelectedStatus()).toBe(addTempData.statuses.active);

      await tempDetailPage.gotoTempDetail(inactiveTemp.id);
      expect(await tempDetailPage.getSelectedStatus()).toBe(addTempData.statuses.inactive);

      await clientDetailPage.gotoClientDetail(activeClient.id);
      expect(await clientDetailPage.getSelectedStatus()).toBe(clientData.statuses.active);

      await clientDetailPage.gotoClientDetail(inactiveClient.id);
      expect(await clientDetailPage.getSelectedStatus()).toBe(clientData.statuses.inactive);
    } finally {
      await tempDetailPage.deleteTempViaApi(activeTemp.id);
      await tempDetailPage.deleteTempViaApi(inactiveTemp.id);
      await clientDetailPage.deleteClientViaApi(activeClient.id);
      await clientDetailPage.deleteClientViaApi(inactiveClient.id);
    }
  });
});
