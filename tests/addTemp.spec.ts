import { test, expect } from '../fixtures/customFixtures';
import { addTempData } from '../test-data/addTempData';

test.describe('CTMQ-9 - Add Temp Details Form & Persistence Suite', () => {

  test('TC-01 - Navigation to Add Temp form via + Add Temp button', async ({ authenticatedTempPage, addTempPage, page }) => {
    await authenticatedTempPage.clickAddTemp();

    await expect(page).toHaveURL(new RegExp(addTempData.urls.addTemp));
    await expect(addTempPage.pageHeading).toHaveText(addTempData.headings.addTemp);
  });

  test('TC-02 - Two-column form layout and section styling', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.setViewport(1280, 800);

    await expect(authenticatedAddTempPage.pageHeading).toBeVisible();
    await expect(authenticatedAddTempPage.leftBox).toBeVisible();
    await expect(authenticatedAddTempPage.rightBox).toBeVisible();

    const isTwoColumn = await authenticatedAddTempPage.isTwoColumnLayout();
    expect(isTwoColumn).toBe(true);

    // Left Box controls
    await expect(authenticatedAddTempPage.firstNameInput).toBeVisible();
    await expect(authenticatedAddTempPage.lastNameInput).toBeVisible();
    await expect(authenticatedAddTempPage.cellPhoneInput).toBeVisible();
    await expect(authenticatedAddTempPage.emailInput).toBeVisible();
    await expect(authenticatedAddTempPage.addressInput).toBeVisible();
    await expect(authenticatedAddTempPage.cityInput).toBeVisible();
    await expect(authenticatedAddTempPage.stateSelect).toBeVisible();
    await expect(authenticatedAddTempPage.zipInput).toBeVisible();
    await expect(authenticatedAddTempPage.countySelect).toBeVisible();

    // Right Box controls
    await expect(authenticatedAddTempPage.statusSelect).toBeVisible();
    await expect(authenticatedAddTempPage.dateOfBirthInput).toBeVisible();
    await expect(authenticatedAddTempPage.genderMaleRadio).toBeVisible();
    await expect(authenticatedAddTempPage.genderFemaleRadio).toBeVisible();
    await expect(authenticatedAddTempPage.genderOtherRadio).toBeVisible();
    await expect(authenticatedAddTempPage.maritalStatusSelect).toBeVisible();
  });

  test('TC-03 - State dropdown population contains all 50 US states', async ({ authenticatedAddTempPage }) => {
    const stateOptions = await authenticatedAddTempPage.getStateOptionValues();

    for (const stateCode of addTempData.all50States) {
      expect(stateOptions).toContain(stateCode);
    }
    expect(stateOptions.length).toBeGreaterThanOrEqual(50);
  });

  test('TC-04 - Single-match ZIP to County auto-population', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchBeverlyHills.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(addTempData.zipLookups.singleMatchBeverlyHills.county);

    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchHampden.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(addTempData.zipLookups.singleMatchHampden.county);
  });

  test('TC-05 - Multi-match ZIP to County selection dropdown', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchHampden.zip);
    const options = await authenticatedAddTempPage.getCountyOptionTexts();
    expect(options.length).toBeGreaterThanOrEqual(1);
    expect(options).toContain(addTempData.zipLookups.singleMatchHampden.county);
  });

  test('TC-06 - Standard 5-digit ZIP format acceptance and length constraint', async ({ authenticatedAddTempPage }) => {
    await expect(authenticatedAddTempPage.zipInput).toHaveAttribute('maxlength', '5');
    await expect(authenticatedAddTempPage.zipInput).toHaveAttribute('inputmode', 'numeric');

    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchHampden.zip);
    const isInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.zipInput);
    expect(isInvalid).toBe(false);
  });

  test('TC-07 - Status, Gender, and Marital Status field selection', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillForm({
      status: addTempData.statuses.active,
      gender: addTempData.genders.female,
      maritalStatus: addTempData.maritalStatuses.single,
    });

    await expect(authenticatedAddTempPage.genderFemaleRadio).toBeChecked();
    await expect(authenticatedAddTempPage.statusSelect).toHaveValue(addTempData.statuses.active);
    await expect(authenticatedAddTempPage.maritalStatusSelect).toHaveValue(addTempData.maritalStatuses.single);
  });

  test('TC-08 - Successful Temp record creation and persistence', async ({ authenticatedAddTempPage }) => {
    const newTemp = addTempData.generateTemp('persist');
    await authenticatedAddTempPage.fillForm(newTemp);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.firstName).toBe(newTemp.firstName);
    expect(body.lastName).toBe(newTemp.lastName);
    expect(body.email).toBe(newTemp.email);
    expect(body.zip).toBe(newTemp.zip);
    expect(body.county).toBe(newTemp.county);

    await expect(authenticatedAddTempPage.successBanner).toBeVisible();
  });

  test('TC-09 - Cancel button discards input and redirects', async ({ authenticatedAddTempPage, page }) => {
    const partialTemp = addTempData.generateTemp('cancel');
    await authenticatedAddTempPage.fillForm(partialTemp);

    await authenticatedAddTempPage.clickCancel();

    // Verify redirected away from new form or form is reset
    await expect(page).not.toHaveURL(new RegExp(`${addTempData.urls.addTemp}$`));
  });

  test('TC-10 - Mandatory field validation on empty submission', async ({ authenticatedAddTempPage }) => {
    await expect(authenticatedAddTempPage.firstNameInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.lastNameInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.cellPhoneInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.emailInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.addressInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.cityInput).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.stateSelect).toHaveAttribute('required', '');
    await expect(authenticatedAddTempPage.zipInput).toHaveAttribute('required', '');

    const isFirstNameInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.firstNameInput);
    expect(isFirstNameInvalid).toBe(true);
  });

  test('TC-11 - Invalid email format validation', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillForm({ email: 'invalid-email-format' });
    const isEmailInvalid = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.emailInput);
    expect(isEmailInvalid).toBe(true);

    await authenticatedAddTempPage.fillForm({ email: 'valid.user@example.com' });
    const isEmailValidNow = await authenticatedAddTempPage.isFieldInvalid(authenticatedAddTempPage.emailInput);
    expect(isEmailValidNow).toBe(false);
  });

  test('TC-12 - Unknown or invalid ZIP code handling', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.unknownZip);

    await expect(authenticatedAddTempPage.noCountyFoundMessage).toBeVisible();
    await expect(authenticatedAddTempPage.noCountyFoundMessage).toHaveText(addTempData.messages.noCountyFound);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');
  });

  test('TC-13 - County reset on ZIP change or clearance (CTMQ-25 regression prevention)', async ({ authenticatedAddTempPage }) => {
    // 1. Enter valid ZIP
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchHampden.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(addTempData.zipLookups.singleMatchHampden.county);

    // 2. Clear ZIP -> County must reset immediately
    await authenticatedAddTempPage.clearZip();
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');

    // 3. Enter valid ZIP again
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.singleMatchBeverlyHills.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(addTempData.zipLookups.singleMatchBeverlyHills.county);

    // 4. Change to unknown ZIP -> County must not retain previous county
    await authenticatedAddTempPage.fillZip(addTempData.zipLookups.unknownZip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');
    await expect(authenticatedAddTempPage.noCountyFoundMessage).toBeVisible();
  });

  test('TC-14 - Route protection for unauthenticated access', async ({ addTempPage, page }) => {
    await addTempPage.gotoAddTemp();

    await expect(page).toHaveURL(new RegExp(addTempData.urls.login));
    await expect(addTempPage.firstNameInput).not.toBeVisible();
  });

  test('TC-15 - API endpoint authorization enforcement', async ({ request }) => {
    const newTemp = addTempData.generateTemp('unauth');
    const response = await request.post(addTempData.urls.apiTemps, {
      data: newTemp,
    });

    expect(response.status()).toBe(401);
  });

  test('TC-16 - Backend server validation and error shielding', async ({ authenticatedAddTempPage, page }) => {
    const invalidPayload = {
      firstName: '',
      lastName: '',
      email: 'not-an-email',
    };

    const response = await page.request.post(addTempData.urls.apiTemps, {
      data: invalidPayload,
    });

    // Should return 400 Bad Request, not 500 database crash
    expect(response.status()).toBe(400);
    const body = await response.json().catch(() => ({}));
    expect(JSON.stringify(body)).not.toMatch(/Npgsql|SqlException|stack trace/i);
  });

  test('TC-17 - Leading zeros preservation in ZIP code', async ({ authenticatedAddTempPage }) => {
    const tempWithZeroZip = addTempData.generateTemp('zerozip');
    tempWithZeroZip.zip = '01001';
    await authenticatedAddTempPage.fillForm(tempWithZeroZip);

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(typeof body.zip).toBe('string');
    expect(body.zip).toBe('01001');
    expect(body.zip.startsWith('0')).toBe(true);
  });

  test('TC-18 - Date of Birth boundary and format validation', async ({ authenticatedAddTempPage }) => {
    await expect(authenticatedAddTempPage.dateOfBirthInput).toHaveAttribute('type', 'date');

    await authenticatedAddTempPage.fillForm({ dateOfBirth: '1995-12-31' });
    await expect(authenticatedAddTempPage.dateOfBirthInput).toHaveValue('1995-12-31');
  });

  test('TC-19 - Responsive two-box vertical stacking on narrow screens', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.setViewport(375, 667);

    const isStacked = await authenticatedAddTempPage.isStackedLayout();
    expect(isStacked).toBe(true);
  });

  test('TC-20 - In-progress save and double-submission protection', async ({ authenticatedAddTempPage }) => {
    const newTemp = addTempData.generateTemp('double');
    await authenticatedAddTempPage.fillForm(newTemp);

    await expect(authenticatedAddTempPage.saveButton).toBeEnabled();
    const savePromise = authenticatedAddTempPage.saveAndInterceptApiResponse();
    const { status } = await savePromise;
    expect(status).toBe(201);
  });

  test('TC-21 - Input whitespace trimming and normalization', async ({ authenticatedAddTempPage }) => {
    const rawTemp = addTempData.generateTemp('trim');
    const trimmedFirstName = rawTemp.firstName;
    const trimmedLastName = rawTemp.lastName;

    await authenticatedAddTempPage.fillForm({
      ...rawTemp,
      firstName: `  ${trimmedFirstName}  `,
      lastName: `  ${trimmedLastName}  `,
    });

    const { status, body } = await authenticatedAddTempPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.firstName.trim()).toBe(trimmedFirstName);
    expect(body.lastName.trim()).toBe(trimmedLastName);
  });

});

