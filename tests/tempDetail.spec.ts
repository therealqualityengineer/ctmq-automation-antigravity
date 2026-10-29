import { test, expect } from '../fixtures/customFixtures';
import { tempDetailData } from '../test-data/tempDetailData';

test.describe('CTMQ-14 - Temp Details View & Edit Mode Suite', () => {

  test('TC-01 - Create mode initial state via + Add Temp button', async ({
    authenticatedTempPage,
    tempDetailPage,
    page,
  }) => {
    await authenticatedTempPage.clickAddTemp();

    await expect(page).toHaveURL(new RegExp(tempDetailData.urls.addTemp));
    await expect(tempDetailPage.pageHeading).toHaveText(tempDetailData.headings.addTemp);
    await expect(tempDetailPage.saveButton).toBeVisible();
    await expect(tempDetailPage.cancelButton).toBeVisible();
    await expect(tempDetailPage.editButton).toBeHidden();

    const allFieldsEnabled = await tempDetailPage.areAllFieldsEnabled();
    expect(allFieldsEnabled).toBe(true);
  });

  test('TC-02 - Existing Temp record opens in read-only View mode', async ({
    authenticatedTempPage,
    tempDetailPage,
    page,
  }) => {
    await authenticatedTempPage.clickFirstRow();

    await expect(page).toHaveURL(/\/temp\/\d+/);
    await expect(tempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await expect(tempDetailPage.editButton).toBeVisible();
    await expect(tempDetailPage.saveButton).toBeHidden();
    await expect(tempDetailPage.cancelButton).toBeHidden();

    const allFieldsDisabled = await tempDetailPage.areAllFieldsDisabled();
    expect(allFieldsDisabled).toBe(true);
  });

  test('TC-03 - Transition from View mode to Edit mode via Edit button', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc03')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await authenticatedTempDetailPage.clickEdit();

    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
    await expect(authenticatedTempDetailPage.saveButton).toBeVisible();
    await expect(authenticatedTempDetailPage.cancelButton).toBeVisible();
    await expect(authenticatedTempDetailPage.editButton).toBeHidden();

    const allFieldsEnabled = await authenticatedTempDetailPage.areAllFieldsEnabled();
    expect(allFieldsEnabled).toBe(true);
  });

  test('TC-04 - Successful update and persistence in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc04')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      cellPhone: tempDetailData.testValues.modifiedPhone,
      address: tempDetailData.testValues.modifiedAddress,
    });

    const { status, body } = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(200);
    expect(body.cellPhone).toBe(tempDetailData.testValues.modifiedPhone);
    expect(body.address).toBe(tempDetailData.testValues.modifiedAddress);

    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await expect(authenticatedTempDetailPage.cellPhoneInput).toHaveValue(tempDetailData.testValues.modifiedPhone);
    await expect(authenticatedTempDetailPage.addressInput).toHaveValue(tempDetailData.testValues.modifiedAddress);

    const allFieldsDisabled = await authenticatedTempDetailPage.areAllFieldsDisabled();
    expect(allFieldsDisabled).toBe(true);
  });

  test('TC-05 - Cancel in Edit mode discards unsaved changes', async ({
    authenticatedTempDetailPage,
  }) => {
    const initialTemp = tempDetailData.generateTemp('tc05');
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(initialTemp);
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      cellPhone: tempDetailData.testValues.modifiedPhone,
    });
    await authenticatedTempDetailPage.clickCancel();

    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await expect(authenticatedTempDetailPage.cellPhoneInput).toHaveValue(initialTemp.cellPhone);

    const allFieldsDisabled = await authenticatedTempDetailPage.areAllFieldsDisabled();
    expect(allFieldsDisabled).toBe(true);
  });

  test('TC-06 - Cancel in Create mode abandons form and navigates back', async ({
    authenticatedTempDetailPage,
    page,
  }) => {
    await authenticatedTempDetailPage.gotoAddTemp();
    await authenticatedTempDetailPage.fillForm({
      firstName: 'DiscardFirstName',
      lastName: 'DiscardLastName',
    });
    await authenticatedTempDetailPage.clickCancel();

    await expect(page).toHaveURL(new RegExp(tempDetailData.urls.tempList));
  });

  test('TC-07 - Create mode persistence creates new Temp record', async ({
    authenticatedTempDetailPage,
  }) => {
    await authenticatedTempDetailPage.gotoAddTemp();
    const newTemp = tempDetailData.generateTemp('tc07');
    await authenticatedTempDetailPage.fillForm(newTemp);

    const { status, body } = await authenticatedTempDetailPage.saveAndInterceptPostResponse();
    expect(status).toBe(201);
    expect(body.firstName).toBe(newTemp.firstName);
    expect(body.email).toBe(newTemp.email);
  });

  test('TC-08 - Two-column presentation and full-width layout retention', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc08')
    );
    await authenticatedTempDetailPage.setViewport(
      tempDetailData.viewports.desktop.width,
      tempDetailData.viewports.desktop.height
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    // View Mode Layout
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    const viewTwoColumn = await authenticatedTempDetailPage.isTwoColumnLayout();
    expect(viewTwoColumn).toBe(true);

    // Edit Mode Layout
    await authenticatedTempDetailPage.clickEdit();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
    const editTwoColumn = await authenticatedTempDetailPage.isTwoColumnLayout();
    expect(editTwoColumn).toBe(true);
  });

  test('TC-09 - View mode form submission prevention via Enter key', async ({
    authenticatedTempDetailPage,
    page,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc09')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    let putOrPostTriggered = false;
    const requestHandler = (req: any) => {
      if (req.method() === 'PUT' || req.method() === 'POST') {
        putOrPostTriggered = true;
      }
    };
    page.on('request', requestHandler);

    await authenticatedTempDetailPage.pressEnterKey();
    await page.waitForTimeout(300);
    page.off('request', requestHandler);

    expect(putOrPostTriggered).toBe(false);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await expect(authenticatedTempDetailPage.editButton).toBeVisible();
  });

  test('TC-10 - Form controls tamper resistance and immutability in View mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc10')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await expect(authenticatedTempDetailPage.firstNameInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.lastNameInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.cellPhoneInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.emailInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.addressInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.cityInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.stateSelect).toBeDisabled();
    await expect(authenticatedTempDetailPage.zipInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.countySelect).toBeDisabled();
    await expect(authenticatedTempDetailPage.statusSelect).toBeDisabled();
    await expect(authenticatedTempDetailPage.dateOfBirthInput).toBeDisabled();
    await expect(authenticatedTempDetailPage.genderMaleRadio).toBeDisabled();
    await expect(authenticatedTempDetailPage.genderFemaleRadio).toBeDisabled();
    await expect(authenticatedTempDetailPage.genderOtherRadio).toBeDisabled();
    await expect(authenticatedTempDetailPage.maritalStatusSelect).toBeDisabled();
  });

  test('TC-11 - Mandatory field validation enforcement in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc11')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.clearFirstName();
    await authenticatedTempDetailPage.clickSave();

    const isInvalid = await authenticatedTempDetailPage.isFieldInvalid(
      authenticatedTempDetailPage.firstNameInput
    );
    expect(isInvalid).toBe(true);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
    await expect(authenticatedTempDetailPage.saveButton).toBeVisible();
  });

  test('TC-12 - Invalid email format validation enforcement in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc12')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      email: tempDetailData.testValues.invalidEmail,
    });
    await authenticatedTempDetailPage.clickSave();

    const isInvalid = await authenticatedTempDetailPage.isFieldInvalid(
      authenticatedTempDetailPage.emailInput
    );
    expect(isInvalid).toBe(true);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
  });

  test('TC-13 - Unique email enforcement against other records in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const tempA = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc13_a')
    );
    const tempB = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc13_b')
    );

    await authenticatedTempDetailPage.gotoTempDetail(tempA.id);
    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      email: tempB.email,
    });
    await authenticatedTempDetailPage.clickSave();

    await expect(authenticatedTempDetailPage.duplicateEmailError).toBeVisible();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
  });

  test('TC-14 - Self-email retention on update in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const tempA = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc14')
    );

    await authenticatedTempDetailPage.gotoTempDetail(tempA.id);
    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      address: tempDetailData.testValues.modifiedAddress,
    });

    const { status, body } = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(200);
    expect(body.email).toBe(tempA.email);
    expect(body.address).toBe(tempDetailData.testValues.modifiedAddress);

    await expect(authenticatedTempDetailPage.duplicateEmailError).toBeHidden();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
  });

  test('TC-15 - Unauthenticated route protection for Temp detail route', async ({
    tempDetailPage,
    page,
  }) => {
    await tempDetailPage.gotoTempDetail(1);

    await expect(page).toHaveURL(new RegExp(tempDetailData.urls.login));
  });

  test('TC-16 - Non-existent Temp record handling', async ({
    authenticatedTempDetailPage,
  }) => {
    await authenticatedTempDetailPage.gotoTempDetail(tempDetailData.testValues.nonExistentId);

    await expect(authenticatedTempDetailPage.notFoundMessage).toBeVisible();
  });

  test('TC-17 - Re-entering Edit mode after canceling edits', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc17')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    // Step 1: Edit, Modify, and Cancel
    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      cellPhone: tempDetailData.testValues.modifiedPhone,
    });
    await authenticatedTempDetailPage.clickCancel();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);

    // Step 2: Re-enter Edit mode, Modify, and Save
    await authenticatedTempDetailPage.clickEdit();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
    await authenticatedTempDetailPage.fillForm({
      address: tempDetailData.testValues.modifiedAddress,
    });

    const { status, body } = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(200);
    expect(body.address).toBe(tempDetailData.testValues.modifiedAddress);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
  });

  test('TC-18 - Consecutive Edit-Save-Edit-Save cycles', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc18')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    // First cycle: update phone
    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      cellPhone: tempDetailData.testValues.modifiedPhone,
    });
    let result = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(result.status).toBe(200);
    expect(result.body.cellPhone).toBe(tempDetailData.testValues.modifiedPhone);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);

    // Second cycle: update address
    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      address: tempDetailData.testValues.secondModifiedAddress,
    });
    result = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(result.status).toBe(200);
    expect(result.body.address).toBe(tempDetailData.testValues.secondModifiedAddress);
    expect(result.body.cellPhone).toBe(tempDetailData.testValues.modifiedPhone);
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
  });

  test('TC-19 - Dynamic ZIP-to-County lookup updating in Edit mode', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc19')
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    await authenticatedTempDetailPage.clickEdit();
    await authenticatedTempDetailPage.fillForm({
      zip: tempDetailData.testValues.newZipBeverlyHills,
      county: tempDetailData.testValues.newCountyBeverlyHills,
    });

    const { status, body } = await authenticatedTempDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(200);
    expect(body.zip).toBe(tempDetailData.testValues.newZipBeverlyHills);
    expect(body.county).toBe(tempDetailData.testValues.newCountyBeverlyHills);

    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    await expect(authenticatedTempDetailPage.countySelect).toHaveValue(
      tempDetailData.testValues.newCountyBeverlyHills
    );
  });

  test('TC-20 - Responsive two-box vertical stacking on narrow viewports', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedRecord = await authenticatedTempDetailPage.createTempViaApi(
      tempDetailData.generateTemp('tc20')
    );
    await authenticatedTempDetailPage.setViewport(
      tempDetailData.viewports.mobile.width,
      tempDetailData.viewports.mobile.height
    );
    await authenticatedTempDetailPage.gotoTempDetail(seedRecord.id);

    // Stacking in View mode
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.viewTemp);
    const viewStacked = await authenticatedTempDetailPage.isStackedLayout();
    expect(viewStacked).toBe(true);

    // Stacking in Edit mode
    await authenticatedTempDetailPage.clickEdit();
    await expect(authenticatedTempDetailPage.pageHeading).toHaveText(tempDetailData.headings.editTemp);
    const editStacked = await authenticatedTempDetailPage.isStackedLayout();
    expect(editStacked).toBe(true);
  });
});

