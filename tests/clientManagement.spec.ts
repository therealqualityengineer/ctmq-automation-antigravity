import { test, expect } from '../fixtures/customFixtures';
import { clientData } from '../test-data/clientData';

test.describe('CTMQ-18 - Client Creation, Listing, Details, and Editing Suite', () => {

  test('TC-01 - Navigation to Client Create form with two-panel layout', async ({ authenticatedClientPage, authenticatedClientDetailPage, page }) => {
    await authenticatedClientPage.clickAddClient();

    await expect(page).toHaveURL(new RegExp(clientData.urls.clientNew));
    await expect(authenticatedClientDetailPage.pageHeading).toHaveText(clientData.headings.addClient);

    await expect(authenticatedClientDetailPage.leftBox).toBeVisible();
    await expect(authenticatedClientDetailPage.rightBox).toBeVisible();

    // Verify two-panel layout on desktop
    await authenticatedClientDetailPage.setViewport(1280, 800);
    const isTwoColumn = await authenticatedClientDetailPage.isTwoColumnLayout();
    expect(isTwoColumn).toBe(true);

    // Left panel fields
    await expect(authenticatedClientDetailPage.fullNameInput).toBeVisible();
    await expect(authenticatedClientDetailPage.emailInput).toBeVisible();
    await expect(authenticatedClientDetailPage.addressInput).toBeVisible();
    await expect(authenticatedClientDetailPage.cityInput).toBeVisible();
    await expect(authenticatedClientDetailPage.stateSelect).toBeVisible();
    await expect(authenticatedClientDetailPage.zipInput).toBeVisible();
    await expect(authenticatedClientDetailPage.countySelect).toBeVisible();

    // Right panel fields
    await expect(authenticatedClientDetailPage.statusSelect).toBeVisible();

    // Action buttons
    await expect(authenticatedClientDetailPage.saveButton).toBeVisible();
    await expect(authenticatedClientDetailPage.cancelButton).toBeVisible();
  });

  test('TC-02 - Successful Client creation and persistence', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    const newClient = clientData.generateClient('create');
    await authenticatedClientDetailPage.fillForm(newClient);

    const { status, body } = await authenticatedClientDetailPage.saveAndInterceptPostResponse();
    expect(status).toBe(201);
    expect(body.fullName).toBe(newClient.fullName);
    expect(body.email).toBe(newClient.email);
    expect(body.city).toBe(newClient.city);
    expect(body.state).toBe(newClient.state);
    expect(body.zip).toBe(newClient.zip);
    expect(body.status).toBe(newClient.status);

    await expect(authenticatedClientDetailPage.createSuccessBanner).toBeVisible();
  });

  test('TC-03 - Client listing displays persisted records in correct column order', async ({ authenticatedClientPage }) => {
    await authenticatedClientPage.gotoClient();

    const headers = await authenticatedClientPage.getTableHeaders();
    expect(headers).toEqual(clientData.tableHeaders);

    const rowCount = await authenticatedClientPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-04 - Open existing Client in read-only View mode', async ({ authenticatedClientPage, clientDetailPage, page }) => {
    await authenticatedClientPage.gotoClient();
    await authenticatedClientPage.clickFirstRow();

    await expect(page).toHaveURL(/\/client\/\d+/);
    await expect(clientDetailPage.pageHeading).toHaveText(clientData.headings.viewClient);
    await expect(clientDetailPage.editButton).toBeVisible();

    const allDisabled = await clientDetailPage.areAllFieldsDisabled();
    expect(allDisabled).toBe(true);
  });

  test('TC-05 - Edit existing Client and save changes', async ({ authenticatedClientPage, clientDetailPage }) => {
    await authenticatedClientPage.gotoClient();
    await authenticatedClientPage.clickFirstRow();

    await clientDetailPage.clickEdit();
    const allEnabled = await clientDetailPage.areAllFieldsEnabled();
    expect(allEnabled).toBe(true);

    const updatedName = `Updated Client ${Date.now()}`;
    await clientDetailPage.fullNameInput.fill(updatedName);

    const { status, body } = await clientDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(200);
    expect(body.fullName).toBe(updatedName);

    await expect(clientDetailPage.saveSuccessBanner).toBeVisible();
    await expect(clientDetailPage.pageHeading).toHaveText(clientData.headings.viewClient);

    const allDisabledAfterSave = await clientDetailPage.areAllFieldsDisabled();
    expect(allDisabledAfterSave).toBe(true);
  });

  test('TC-06 - Cancel in Edit mode discards unsaved changes and reverts to View mode', async ({ authenticatedClientPage, clientDetailPage }) => {
    await authenticatedClientPage.gotoClient();
    await authenticatedClientPage.clickFirstRow();

    const originalName = await clientDetailPage.fullNameInput.inputValue();

    await clientDetailPage.clickEdit();
    await clientDetailPage.fullNameInput.fill('Discarded Client Edit Name');

    await clientDetailPage.clickCancel();

    expect(await clientDetailPage.fullNameInput.inputValue()).toBe(originalName);
    const allDisabled = await clientDetailPage.areAllFieldsDisabled();
    expect(allDisabled).toBe(true);
  });

  test('TC-07 - Cancel Client creation returns to Client list', async ({ authenticatedClientDetailPage, page }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    await authenticatedClientDetailPage.fillForm({ fullName: 'Cancelled Corp', email: 'cancel@example.com' });
    await authenticatedClientDetailPage.clickCancel();

    await expect(page).toHaveURL(new RegExp(`${clientData.urls.client}$`));
  });

  test('TC-08 - ZIP code to County auto-population and State dropdown', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    const states = await authenticatedClientDetailPage.getStateOptionValues();
    expect(states.length).toBeGreaterThanOrEqual(50);
    expect(states).toContain('NY');
    expect(states).toContain('CA');

    // Test ZIP lookup
    await authenticatedClientDetailPage.fillZip(clientData.zipLookups.singleMatchNewYork.zip);
    await expect(authenticatedClientDetailPage.countySelect).toHaveValue(clientData.zipLookups.singleMatchNewYork.county);

    // Test clear ZIP
    await authenticatedClientDetailPage.clearZip();
    await expect(authenticatedClientDetailPage.countySelect).toHaveValue('');
  });

  test('TC-09 - Mandatory field validation on empty Create submission', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    await expect(authenticatedClientDetailPage.fullNameInput).toHaveAttribute('required', '');
    await expect(authenticatedClientDetailPage.emailInput).toHaveAttribute('required', '');

    const isFullNameInvalid = await authenticatedClientDetailPage.isFieldInvalid(authenticatedClientDetailPage.fullNameInput);
    expect(isFullNameInvalid).toBe(true);
  });

  test('TC-10 - Invalid email format validation', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    await authenticatedClientDetailPage.fillForm({ email: clientData.invalidEmails[0] });
    const isEmailInvalid = await authenticatedClientDetailPage.isFieldInvalid(authenticatedClientDetailPage.emailInput);
    expect(isEmailInvalid).toBe(true);

    await authenticatedClientDetailPage.fillForm({ email: 'valid.client@example.com' });
    const isEmailValidNow = await authenticatedClientDetailPage.isFieldInvalid(authenticatedClientDetailPage.emailInput);
    expect(isEmailValidNow).toBe(false);
  });

  test('TC-11 - Backend API failure handling during Client creation', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    await authenticatedClientDetailPage.mockApiResponse('**/api/clients', 500, {
      message: 'Internal Server Error',
    });

    const candidate = clientData.generateClient('fail');
    await authenticatedClientDetailPage.fillForm(candidate);
    await authenticatedClientDetailPage.clickSave();

    await expect(authenticatedClientDetailPage.serverErrorBanner).toBeVisible();
    await expect(authenticatedClientDetailPage.createSuccessBanner).not.toBeVisible();
  });

  test('TC-12 - Unauthenticated API requests to /api/clients are rejected', async ({ request }) => {
    const getResponse = await request.get(clientData.urls.apiClients);
    expect(getResponse.status()).toBe(401);

    const postResponse = await request.post(clientData.urls.apiClients, {
      data: { fullName: 'Unauthorized Test' },
    });
    expect(postResponse.status()).toBe(401);
  });

  test('TC-13 - Empty state handling when no search results match', async ({ authenticatedClientPage }) => {
    await authenticatedClientPage.gotoClient();

    await authenticatedClientPage.search('NonExistentClientFilter_XYZ_9999');

    await expect(authenticatedClientPage.noRecordsMessage).toBeVisible();
    await expect(authenticatedClientPage.noRecordsMessage).toHaveText(clientData.messages.noRecordsFound);
  });

  test('TC-14 - Boundary length testing for text and ZIP inputs', async ({ authenticatedClientDetailPage }) => {
    await authenticatedClientDetailPage.gotoAddClient();

    await expect(authenticatedClientDetailPage.zipInput).toHaveAttribute('maxlength', '5');
    await expect(authenticatedClientDetailPage.zipInput).toHaveAttribute('inputmode', 'numeric');

    await authenticatedClientDetailPage.fillZip('90210');
    const isZipInvalid = await authenticatedClientDetailPage.isFieldInvalid(authenticatedClientDetailPage.zipInput);
    expect(isZipInvalid).toBe(false);
  });

  test('TC-15 - Client list search filtering finds matching record', async ({ authenticatedClientPage, clientDetailPage }) => {
    // 1. Create a known unique client first to ensure search target exists
    await clientDetailPage.gotoAddClient();
    const searchTarget = clientData.generateClient('searchable');
    await clientDetailPage.fillForm(searchTarget);
    await clientDetailPage.clickSave();
    await expect(clientDetailPage.createSuccessBanner).toBeVisible();

    // 2. Search on Client page
    await authenticatedClientPage.gotoClient();
    await authenticatedClientPage.search(searchTarget.fullName);

    const rowCount = await authenticatedClientPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    const rowText = await authenticatedClientPage.getFirstRowText();
    expect(rowText).toContain(searchTarget.fullName);
  });

  test('TC-16 - Responsive layout check on tablet and mobile viewports', async ({ authenticatedClientDetailPage, clientPage }) => {
    // Check Client List responsive layout
    await clientPage.gotoClient();
    await clientPage.setViewport(768, 1024);
    await expect(clientPage.clientsTable).toBeVisible();

    await clientPage.setViewport(375, 667);
    await expect(clientPage.clientsTable).toBeVisible();

    // Check Client Form responsive layout
    await authenticatedClientDetailPage.gotoAddClient();
    await authenticatedClientDetailPage.setViewport(768, 1024);
    await expect(authenticatedClientDetailPage.leftBox).toBeVisible();
    await expect(authenticatedClientDetailPage.rightBox).toBeVisible();

    await authenticatedClientDetailPage.setViewport(375, 667);
    await expect(authenticatedClientDetailPage.leftBox).toBeVisible();
    await expect(authenticatedClientDetailPage.rightBox).toBeVisible();
  });
});

