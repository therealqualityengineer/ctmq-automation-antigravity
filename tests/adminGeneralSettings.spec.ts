import { test, expect } from '../fixtures/customFixtures';
import { adminGeneralSettingsData } from '../test-data/adminGeneralSettingsData';

test.describe('CTMQ-45 - General Settings Section on Admin Landing Page', () => {

  test('TC-01 - Verify General Settings card container layout and placement on Admin landing page', async ({ authenticatedAdminPage }) => {
    await expect(authenticatedAdminPage.generalSettingsCard).toBeVisible();
    await expect(authenticatedAdminPage.generalSettingsCard).toHaveClass(adminGeneralSettingsData.styles.cardBorderPattern);
    await expect(authenticatedAdminPage.generalSettingsCard).toHaveClass(adminGeneralSettingsData.styles.cardRoundedPattern);

    const isLeftAligned = await authenticatedAdminPage.isGeneralSettingsLeftAligned();
    expect(isLeftAligned).toBe(true);
  });

  test('TC-02 - Verify General Settings card header bar styling and uppercase title', async ({ authenticatedAdminPage }) => {
    await expect(authenticatedAdminPage.generalSettingsHeader).toBeVisible();
    await expect(authenticatedAdminPage.generalSettingsHeader).toHaveText(adminGeneralSettingsData.cardTitle);
    await expect(authenticatedAdminPage.generalSettingsHeader).toHaveClass(adminGeneralSettingsData.styles.headerBgPattern);
    await expect(authenticatedAdminPage.generalSettingsHeader).toHaveClass(adminGeneralSettingsData.styles.headerBorderPattern);
  });

  test('TC-03 - Verify General subsection header in card body', async ({ authenticatedAdminPage }) => {
    await expect(authenticatedAdminPage.generalSubsectionHeading).toBeVisible();
    await expect(authenticatedAdminPage.generalSubsectionHeading).toHaveText(adminGeneralSettingsData.subsectionTitle);
    await expect(authenticatedAdminPage.generalSubsectionHeading).toHaveClass(/font-bold/);
  });

  test('TC-04 - Verify vertical sequence and text of all 5 setting items', async ({ authenticatedAdminPage }) => {
    await expect(authenticatedAdminPage.generalSettingItems).toHaveCount(adminGeneralSettingsData.settingItems.length);

    const displayedItems = await authenticatedAdminPage.getGeneralSettingItemTexts();
    expect(displayedItems).toEqual(adminGeneralSettingsData.settingItems);
  });

  test('TC-05 - Verify link aesthetics and interactive styling for all setting items', async ({ authenticatedAdminPage }) => {
    for (const itemName of adminGeneralSettingsData.settingItems) {
      const link = authenticatedAdminPage.getGeneralSettingLink(itemName);
      await expect(link).toBeVisible();
      await expect(link).toHaveClass(adminGeneralSettingsData.styles.linkTextColorPattern);
      await expect(link).toHaveClass(adminGeneralSettingsData.styles.linkPointerPattern);
      await expect(link).toHaveClass(adminGeneralSettingsData.styles.linkHoverPattern);

      await authenticatedAdminPage.hoverGeneralSettingLink(itemName);
      const cursor = await authenticatedAdminPage.getLinkComputedStyle(itemName, 'cursor');
      expect(cursor).toBe('pointer');
    }
  });

  test('TC-06 - Verify safe placeholder click behavior without broken routes or unhandled errors', async ({ authenticatedAdminPage, page }) => {
    for (const itemName of adminGeneralSettingsData.settingItems) {
      await authenticatedAdminPage.clickGeneralSettingLink(itemName);

      const targetRoute = adminGeneralSettingsData.itemRoutes[itemName as keyof typeof adminGeneralSettingsData.itemRoutes];
      await expect(page).toHaveURL(targetRoute);
      await expect(authenticatedAdminPage.contentArea).toBeVisible();

      // Return to Admin landing page for the next item check
      await authenticatedAdminPage.gotoAdmin();
      await expect(authenticatedAdminPage.generalSettingsCard).toBeVisible();
    }
  });

  test('TC-07 - Verify Admin navigation integrity (AdminSubNav and primary Admin tab)', async ({ authenticatedAdminPage }) => {
    await expect(authenticatedAdminPage.adminLink).toHaveAttribute('aria-current', 'page');
    const isAdminActive = await authenticatedAdminPage.isAdminTabActive();
    expect(isAdminActive).toBe(true);

    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
    await expect(authenticatedAdminPage.userManagerSubTab).toBeVisible();
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveAttribute('href', adminGeneralSettingsData.urls.adminUsers);
  });

  test('TC-08 - Verify unauthenticated access protection for Admin landing page', async ({ adminPage, page }) => {
    await adminPage.gotoAdmin();

    await expect(page).toHaveURL(new RegExp(adminGeneralSettingsData.urls.login));
    await expect(adminPage.generalSettingsCard).not.toBeVisible();
  });

  test('TC-09 - Verify page refresh and direct URL navigation stability', async ({ authenticatedAdminPage, page }) => {
    await authenticatedAdminPage.gotoAdmin();
    await expect(page).toHaveURL(new RegExp(adminGeneralSettingsData.urls.admin));
    await expect(authenticatedAdminPage.generalSettingsCard).toBeVisible();

    await authenticatedAdminPage.reloadPage();

    await expect(page).toHaveURL(new RegExp(adminGeneralSettingsData.urls.admin));
    await expect(authenticatedAdminPage.generalSettingsCard).toBeVisible();
    await expect(authenticatedAdminPage.generalSettingsHeader).toHaveText(adminGeneralSettingsData.cardTitle);

    const itemsAfterReload = await authenticatedAdminPage.getGeneralSettingItemTexts();
    expect(itemsAfterReload).toEqual(adminGeneralSettingsData.settingItems);
  });

  test('TC-10 - Verify responsive layout across standard screen widths', async ({ authenticatedAdminPage }) => {
    const viewports = [
      adminGeneralSettingsData.viewports.desktopLarge,
      adminGeneralSettingsData.viewports.desktopStandard,
      adminGeneralSettingsData.viewports.laptop,
    ];

    for (const vp of viewports) {
      await authenticatedAdminPage.setViewport(vp.width, vp.height);
      await expect(authenticatedAdminPage.generalSettingsCard).toBeVisible();
      await expect(authenticatedAdminPage.generalSettingsHeader).toBeVisible();

      const isLeftAligned = await authenticatedAdminPage.isGeneralSettingsLeftAligned();
      expect(isLeftAligned).toBe(true);
    }
  });
});

