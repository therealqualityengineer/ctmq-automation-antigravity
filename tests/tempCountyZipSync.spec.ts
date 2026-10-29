import { test, expect } from '../fixtures/customFixtures';
import { countyZipSyncData } from '../test-data/countyZipSyncData';

test.describe('CTMQ-25 - County & ZIP Synchronization Suite', () => {

  test('TC-01 - Auto-populate County when valid ZIP is entered', async ({ authenticatedAddTempPage }) => {
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.suffolk.zip);

    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.suffolk.expectedCounty);
    const selectedText = await authenticatedAddTempPage.getSelectedCountyText();
    expect(selectedText).toBe(countyZipSyncData.validZips.suffolk.expectedCounty);
  });

  test('TC-02 - Dynamically update County when ZIP is changed to another valid ZIP', async ({ authenticatedAddTempPage }) => {
    // 1. Enter first valid ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.suffolk.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.suffolk.expectedCounty);

    // 2. Change to second valid ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.hampden.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.hampden.expectedCounty);
    const selectedText = await authenticatedAddTempPage.getSelectedCountyText();
    expect(selectedText).toBe(countyZipSyncData.validZips.hampden.expectedCounty);
  });

  test('TC-03 - Enforce non-editable County field and prevent manual free-text typing', async ({ authenticatedAddTempPage }) => {
    // Initial verification: County must be a select dropdown and not an editable input
    const isEditableInitially = await authenticatedAddTempPage.isCountyFieldEditable();
    expect(isEditableInitially).toBe(false);

    // After entering unmapped ZIP, verify it does not fall back to an editable free-text input
    await authenticatedAddTempPage.fillZip(countyZipSyncData.invalidZips.unknown);
    const isEditableAfterUnknownZip = await authenticatedAddTempPage.isCountyFieldEditable();
    expect(isEditableAfterUnknownZip).toBe(false);
  });

  test('TC-04 - Reset County to None when ZIP is cleared', async ({ authenticatedAddTempPage }) => {
    // 1. Populate County with a valid ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.suffolk.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.suffolk.expectedCounty);

    // 2. Clear the ZIP field
    await authenticatedAddTempPage.clearZip();

    // 3. Verify County resets to empty value and None display
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');
    const selectedText = await authenticatedAddTempPage.getSelectedCountyText();
    expect(selectedText).toBe(countyZipSyncData.defaultCountyOption);
  });

  test('TC-05 - Reset County to None when an unknown/unmapped ZIP is entered', async ({ authenticatedAddTempPage }) => {
    // 1. Establish state with a valid ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.suffolk.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.suffolk.expectedCounty);

    // 2. Change to an unknown/unmapped ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.invalidZips.unknown);

    // 3. Verify County resets to None and does not retain stale county
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');
    const selectedText = await authenticatedAddTempPage.getSelectedCountyText();
    expect(selectedText).toBe(countyZipSyncData.defaultCountyOption);
    await expect(authenticatedAddTempPage.noCountyFoundMessage).toBeVisible();
    await expect(authenticatedAddTempPage.noCountyFoundMessage).toHaveText(countyZipSyncData.messages.noCountyFound);
  });

  test('TC-06 - Handle incomplete ZIP code entry', async ({ authenticatedAddTempPage }) => {
    // 1. Enter valid ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.validZips.suffolk.zip);
    await expect(authenticatedAddTempPage.countySelect).toHaveValue(countyZipSyncData.validZips.suffolk.expectedCounty);

    // 2. Shorten/edit to incomplete ZIP
    await authenticatedAddTempPage.fillZip(countyZipSyncData.invalidZips.incomplete);

    // 3. Verify County resets to None and does not retain prior county
    await expect(authenticatedAddTempPage.countySelect).toHaveValue('');
    const selectedText = await authenticatedAddTempPage.getSelectedCountyText();
    expect(selectedText).toBe(countyZipSyncData.defaultCountyOption);
  });

});

