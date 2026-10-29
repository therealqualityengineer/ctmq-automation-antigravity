import { test, expect } from '../fixtures/customFixtures';
import { addTempData } from '../test-data/addTempData';

test.describe('CTMQ-12 - Improve Temp Save Feedback and Enforce Unique Email', () => {

  test('TC-01 - Successful Temp save displays clear success message on the same details page without redirection', async ({ authenticatedAddTempPage, page }) => {
    const validTemp = addTempData.generateTemp('tc01_save');
    await authenticatedAddTempPage.fillForm(validTemp);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.email).toBe(validTemp.email);

    // Verify clear success notification is displayed
    await expect(authenticatedAddTempPage.successStatus).toBeVisible();
    await expect(authenticatedAddTempPage.successStatus).toHaveText(addTempData.messages.successCreated);

    // Verify user remains on the Temp details page (no navigation to /temp list)
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
  });

  test('TC-02 - Reject exact-match duplicate email with field-level validation and retain form values', async ({ authenticatedAddTempPage, page }) => {
    // 1. Seed an initial Temp record with a known unique email
    const seedTemp = addTempData.generateTemp('tc02_seed');
    await authenticatedAddTempPage.fillForm(seedTemp);
    const { status: seedStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(seedStatus).toBe(201);

    // 2. Refresh form to reset state and attempt creating a new Temp with the same email
    await authenticatedAddTempPage.gotoAddTemp();
    const duplicateTemp = addTempData.generateTemp('tc02_dup');
    duplicateTemp.email = seedTemp.email;
    await authenticatedAddTempPage.fillForm(duplicateTemp);

    const { status: dupStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(dupStatus).toBe(409);

    // 3. Verify field-level error message is displayed
    await expect(authenticatedAddTempPage.emailDuplicateError).toBeVisible();
    await expect(authenticatedAddTempPage.emailDuplicateError).toHaveText(addTempData.messages.duplicateEmail);

    // 4. Verify user remains on the same page and entered values are retained
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
    const retainedFirstName = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.firstNameInput);
    const retainedEmail = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.emailInput);
    expect(retainedFirstName).toBe(duplicateTemp.firstName);
    expect(retainedEmail).toBe(seedTemp.email);
  });

  test('TC-03 - Reject duplicate email with leading/trailing whitespace via normalized comparison', async ({ authenticatedAddTempPage, page }) => {
    // 1. Seed an initial Temp record
    const seedTemp = addTempData.generateTemp('tc03_seed');
    await authenticatedAddTempPage.fillForm(seedTemp);
    const { status: seedStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(seedStatus).toBe(201);

    // 2. Attempt to save new Temp with surrounding whitespace around the same email
    await authenticatedAddTempPage.gotoAddTemp();
    const wsTemp = addTempData.generateTemp('tc03_ws');
    await authenticatedAddTempPage.fillForm({
      ...wsTemp,
      email: `   ${seedTemp.email}   `,
    });

    const { status: wsStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(wsStatus).toBe(409);

    // 3. Verify rejection and validation message
    await expect(authenticatedAddTempPage.emailDuplicateError).toBeVisible();
    await expect(authenticatedAddTempPage.emailDuplicateError).toHaveText(addTempData.messages.duplicateEmail);
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
  });

  test('TC-04 - Reject duplicate email with uppercase/mixed-case variants via case-insensitive comparison', async ({ authenticatedAddTempPage, page }) => {
    // 1. Seed an initial Temp record
    const seedTemp = addTempData.generateTemp('tc04_seed');
    await authenticatedAddTempPage.fillForm(seedTemp);
    const { status: seedStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(seedStatus).toBe(201);

    // 2. Attempt to save new Temp with uppercase variation of the same email
    await authenticatedAddTempPage.gotoAddTemp();
    const ucTemp = addTempData.generateTemp('tc04_uc');
    await authenticatedAddTempPage.fillForm({
      ...ucTemp,
      email: seedTemp.email.toUpperCase(),
    });

    const { status: ucStatus } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(ucStatus).toBe(409);

    // 3. Verify rejection and validation message
    await expect(authenticatedAddTempPage.emailDuplicateError).toBeVisible();
    await expect(authenticatedAddTempPage.emailDuplicateError).toHaveText(addTempData.messages.duplicateEmail);
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
  });

  test('TC-05 - Verify pressing Enter in form inputs does not trigger save or submission', async ({ authenticatedAddTempPage, page }) => {
    const temp = addTempData.generateTemp('tc05_enter');
    await authenticatedAddTempPage.fillForm(temp);

    let apiTriggered = false;
    page.on('request', (req) => {
      if (req.url().includes(addTempData.urls.apiTemps) && req.method() === 'POST') {
        apiTriggered = true;
      }
    });

    // Press Enter in various input fields
    await authenticatedAddTempPage.pressEnterInField(authenticatedAddTempPage.firstNameInput);
    await page.waitForTimeout(300);
    expect(apiTriggered).toBe(false);

    await authenticatedAddTempPage.pressEnterInField(authenticatedAddTempPage.emailInput);
    await page.waitForTimeout(300);
    expect(apiTriggered).toBe(false);

    await authenticatedAddTempPage.pressEnterInField(authenticatedAddTempPage.cellPhoneInput);
    await page.waitForTimeout(300);
    expect(apiTriggered).toBe(false);

    // Verify success banner never appeared and form remained unsaved
    await expect(authenticatedAddTempPage.successStatus).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
  });

  test('TC-06 - Prevent multiple API requests / duplicate records upon rapid repeated clicks on Save', async ({ authenticatedAddTempPage }) => {
    const temp = addTempData.generateTemp('tc06_rapid');
    await authenticatedAddTempPage.fillForm(temp);

    let postRequestCount = 0;
    authenticatedAddTempPage.page.on('request', (req) => {
      if (req.url().includes(addTempData.urls.apiTemps) && req.method() === 'POST') {
        postRequestCount++;
      }
    });

    // Rapid double-click on Save button
    await authenticatedAddTempPage.doubleClickSave();
    await expect(authenticatedAddTempPage.successStatus).toBeVisible();

    // Verify only a single POST request was dispatched
    expect(postRequestCount).toBe(1);
  });

  test('TC-07 - Display clear error notification and retain form data upon server/API failure (500)', async ({ authenticatedAddTempPage, page }) => {
    // Mock 500 error on the save endpoint
    await authenticatedAddTempPage.mockApiResponse(
      `**${addTempData.urls.apiTemps}`,
      500,
      { message: addTempData.messages.serverError }
    );

    const temp = addTempData.generateTemp('tc07_error');
    await authenticatedAddTempPage.fillForm(temp);
    await authenticatedAddTempPage.clickSave();

    // Verify error banner is visible and success message is not displayed
    await expect(authenticatedAddTempPage.serverErrorBanner).toBeVisible();
    await expect(authenticatedAddTempPage.successStatus).not.toBeVisible();

    // Verify user remains on the same page and form values are retained
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
    const retainedFirstName = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.firstNameInput);
    const retainedEmail = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.emailInput);
    expect(retainedFirstName).toBe(temp.firstName);
    expect(retainedEmail).toBe(temp.email);

    // Clean up mock
    await authenticatedAddTempPage.clearApiMocks();
  });

  test('TC-08 - Display validation errors and retain inputs when required fields are missing or invalid', async ({ authenticatedAddTempPage, page }) => {
    // Verify HTML5 required attributes
    await expect(authenticatedAddTempPage.firstNameInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.lastNameInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.cellPhoneInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.emailInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.addressInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.cityInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.stateSelect).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.zipInput).toHaveAttribute('required', '');

    // Submit empty form and verify client-side validation prevents submission
    await authenticatedAddTempPage.clickSave();
    const isFirstNameInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.firstNameInput);
    expect(isFirstNameInvalid).toBe(true);

    // User remains on page and no success banner is shown
    await expect(authenticatedAddTempPage.successStatus).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
  });

  test('TC-09 - Verify keyboard navigation (Tab, arrow keys) and editing without unintended submissions', async ({ authenticatedAddTempPage, page }) => {
    let apiTriggered = false;
    page.on('request', (req) => {
      if (req.url().includes(addTempData.urls.apiTemps) && req.method() === 'POST') {
        apiTriggered = true;
      }
    });

    // Focus first input and tab through multiple fields
    await authenticatedAddTempPage.firstNameInput.focus();
    await authenticatedAddTempPage.firstNameInput.fill('KeyboardUser');
    await authenticatedAddTempPage.pressTab();

    await authenticatedAddTempPage.lastNameInput.fill('NavTester');
    await authenticatedAddTempPage.pressTab();

    // Verify values are retained and no save was triggered
    const firstName = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.firstNameInput);
    const lastName = await authenticatedAddTempPage.getInputValue(authenticatedAddTempPage.lastNameInput);
    expect(firstName).toBe('KeyboardUser');
    expect(lastName).toBe('NavTester');
    expect(apiTriggered).toBe(false);
    await expect(authenticatedAddTempPage.successStatus).not.toBeVisible();
  });

});

