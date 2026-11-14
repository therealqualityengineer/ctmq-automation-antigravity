import { test, expect } from '../fixtures/customFixtures';
import { adminHeadingsData } from '../test-data/adminHeadingsData';

test.describe('CTMQ-74 - [Admin] Page Headings on Shifts, Order Types, and Status Options', () => {
  test('TC-01 - Verify presence and text content of page heading on Shifts page', async ({
    authenticatedShiftsPage,
  }) => {
    await expect(authenticatedShiftsPage.heading).toBeVisible();
    const headingText = await authenticatedShiftsPage.getHeadingText();
    expect(headingText).toBe(adminHeadingsData.headings.shifts);

    const tagName = await authenticatedShiftsPage.getElementTagName(authenticatedShiftsPage.heading);
    expect(tagName).toBe(adminHeadingsData.typography.expectedTag);
  });

  test('TC-02 - Verify presence and text content of page heading on Order Types page', async ({
    authenticatedOrderTypesPage,
  }) => {
    await expect(authenticatedOrderTypesPage.heading).toBeVisible();
    const headingText = await authenticatedOrderTypesPage.getHeadingText();
    expect(headingText).toBe(adminHeadingsData.headings.orderTypes);

    const tagName = await authenticatedOrderTypesPage.getElementTagName(authenticatedOrderTypesPage.heading);
    expect(tagName).toBe(adminHeadingsData.typography.expectedTag);
  });

  test('TC-03 - Verify presence and text content of page heading on Status Options page', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await expect(authenticatedStatusOptionsPage.heading).toBeVisible();
    const headingText = await authenticatedStatusOptionsPage.getHeadingText();
    expect(headingText).toBe(adminHeadingsData.headings.statusOptions);

    const tagName = await authenticatedStatusOptionsPage.getElementTagName(authenticatedStatusOptionsPage.heading);
    expect(tagName).toBe(adminHeadingsData.typography.expectedTag);
  });

  test('TC-04 - Verify typography, font size, font weight, and styling consistency with reference admin pages', async ({
    authenticatedShiftsPage,
    specialtiesPage,
    certificationsPage,
    orderTypesPage,
    statusOptionsPage,
  }) => {
    // 1. Reference page: Specialties
    await specialtiesPage.gotoSpecialties();
    await expect(specialtiesPage.heading).toBeVisible();
    const specialtiesClass = await specialtiesPage.getElementClassName(specialtiesPage.heading);
    expect(specialtiesClass).toContain(adminHeadingsData.typography.cssClass);

    // 2. Reference page: Certifications
    await certificationsPage.gotoCertifications();
    await expect(certificationsPage.heading).toBeVisible();
    const certificationsClass = await certificationsPage.getElementClassName(certificationsPage.heading);
    expect(certificationsClass).toContain(adminHeadingsData.typography.cssClass);

    // 3. Target page: Shifts
    await authenticatedShiftsPage.gotoShifts();
    await expect(authenticatedShiftsPage.heading).toBeVisible();
    const shiftsClass = await authenticatedShiftsPage.getElementClassName(authenticatedShiftsPage.heading);
    expect(shiftsClass).toContain(adminHeadingsData.typography.cssClass);

    const shiftsComputed = await authenticatedShiftsPage.getElementComputedStyles(authenticatedShiftsPage.heading, [
      'font-size',
      'font-weight',
    ]);
    expect(shiftsComputed['font-size']).toBe(adminHeadingsData.typography.fontSize);
    expect(shiftsComputed['font-weight']).toBe(adminHeadingsData.typography.fontWeight);

    // 4. Target page: Order Types
    await orderTypesPage.gotoOrderTypes();
    await expect(orderTypesPage.heading).toBeVisible();
    const orderTypesClass = await orderTypesPage.getElementClassName(orderTypesPage.heading);
    expect(orderTypesClass).toContain(adminHeadingsData.typography.cssClass);

    const orderTypesComputed = await orderTypesPage.getElementComputedStyles(orderTypesPage.heading, [
      'font-size',
      'font-weight',
    ]);
    expect(orderTypesComputed['font-size']).toBe(adminHeadingsData.typography.fontSize);
    expect(orderTypesComputed['font-weight']).toBe(adminHeadingsData.typography.fontWeight);

    // 5. Target page: Status Options
    await statusOptionsPage.gotoStatusOptions();
    await expect(statusOptionsPage.heading).toBeVisible();
    const statusOptionsClass = await statusOptionsPage.getElementClassName(statusOptionsPage.heading);
    expect(statusOptionsClass).toContain(adminHeadingsData.typography.cssClass);

    const statusOptionsComputed = await statusOptionsPage.getElementComputedStyles(statusOptionsPage.heading, [
      'font-size',
      'font-weight',
    ]);
    expect(statusOptionsComputed['font-size']).toBe(adminHeadingsData.typography.fontSize);
    expect(statusOptionsComputed['font-weight']).toBe(adminHeadingsData.typography.fontWeight);
  });

  test('TC-05 - Verify structural layout and placement above action controls and search filter', async ({
    authenticatedShiftsPage,
  }) => {
    await expect(authenticatedShiftsPage.heading).toBeVisible();
    await expect(authenticatedShiftsPage.searchInput).toBeVisible();

    const headingBox = await authenticatedShiftsPage.getElementBoundingBox(authenticatedShiftsPage.heading);
    const searchBox = await authenticatedShiftsPage.getElementBoundingBox(authenticatedShiftsPage.searchInput);

    expect(headingBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect(headingBox!.y).toBeLessThan(searchBox!.y);
  });

  test('TC-06 - Verify page heading persistence across category tab switching on Order Types page', async ({
    authenticatedOrderTypesPage,
  }) => {
    await expect(authenticatedOrderTypesPage.heading).toBeVisible();
    expect(await authenticatedOrderTypesPage.getHeadingText()).toBe(adminHeadingsData.headings.orderTypes);

    // Switch to Long Term tab
    await authenticatedOrderTypesPage.clickLongTermTab();
    await expect(authenticatedOrderTypesPage.heading).toBeVisible();
    expect(await authenticatedOrderTypesPage.getHeadingText()).toBe(adminHeadingsData.headings.orderTypes);

    // Switch back to Per Diem tab
    await authenticatedOrderTypesPage.clickPerDiemTab();
    await expect(authenticatedOrderTypesPage.heading).toBeVisible();
    expect(await authenticatedOrderTypesPage.getHeadingText()).toBe(adminHeadingsData.headings.orderTypes);
  });

  test('TC-07 - Verify page heading persistence across entity tab switching on Status Options page', async ({
    authenticatedStatusOptionsPage,
  }) => {
    await expect(authenticatedStatusOptionsPage.heading).toBeVisible();
    expect(await authenticatedStatusOptionsPage.getHeadingText()).toBe(adminHeadingsData.headings.statusOptions);

    // Switch to Temp tab
    await authenticatedStatusOptionsPage.switchToTempTab();
    await expect(authenticatedStatusOptionsPage.heading).toBeVisible();
    expect(await authenticatedStatusOptionsPage.getHeadingText()).toBe(adminHeadingsData.headings.statusOptions);

    // Switch back to Client tab
    await authenticatedStatusOptionsPage.switchToClientTab();
    await expect(authenticatedStatusOptionsPage.heading).toBeVisible();
    expect(await authenticatedStatusOptionsPage.getHeadingText()).toBe(adminHeadingsData.headings.statusOptions);
  });

  test('TC-08 - Verify page heading persistence across browser reload and re-navigation', async ({
    authenticatedShiftsPage,
  }) => {
    await authenticatedShiftsPage.gotoShifts();
    await expect(authenticatedShiftsPage.heading).toBeVisible();

    await authenticatedShiftsPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(authenticatedShiftsPage.heading).toBeVisible();
    expect(await authenticatedShiftsPage.getHeadingText()).toBe(adminHeadingsData.headings.shifts);
  });

  test('TC-09 - Verify unauthenticated access redirection and heading non-disclosure', async ({
    shiftsPage,
    orderTypesPage,
    statusOptionsPage,
  }) => {
    // Shifts unauthenticated
    await shiftsPage.navigate(adminHeadingsData.routes.shifts);
    await shiftsPage.page.waitForURL(new RegExp(adminHeadingsData.routes.login));
    expect(shiftsPage.page.url()).toContain(adminHeadingsData.routes.login);
    await expect(shiftsPage.heading).toHaveCount(0);

    // Order Types unauthenticated
    await orderTypesPage.navigate(adminHeadingsData.routes.orderTypes);
    await orderTypesPage.page.waitForURL(new RegExp(adminHeadingsData.routes.login));
    expect(orderTypesPage.page.url()).toContain(adminHeadingsData.routes.login);
    await expect(orderTypesPage.heading).toHaveCount(0);

    // Status Options unauthenticated
    await statusOptionsPage.navigate(adminHeadingsData.routes.statusOptions);
    await statusOptionsPage.page.waitForURL(new RegExp(adminHeadingsData.routes.login));
    expect(statusOptionsPage.page.url()).toContain(adminHeadingsData.routes.login);
    await expect(statusOptionsPage.heading).toHaveCount(0);
  });

  test('TC-10 - Verify non-admin role / unauthenticated session cannot access target headings', async ({
    shiftsPage,
  }) => {
    await shiftsPage.navigate(adminHeadingsData.routes.shifts);
    await expect(shiftsPage.page).toHaveURL(new RegExp(adminHeadingsData.routes.login));

    const h1Count = await shiftsPage.getHeadingCount(1);
    expect(h1Count).toBe(0);
  });

  test('TC-11 - Verify responsive layout and heading positioning across viewports', async ({
    authenticatedShiftsPage,
  }) => {
    // Mobile viewport
    await authenticatedShiftsPage.setViewport(
      adminHeadingsData.viewports.mobile.width,
      adminHeadingsData.viewports.mobile.height
    );
    await expect(authenticatedShiftsPage.heading).toBeVisible();

    // Tablet viewport
    await authenticatedShiftsPage.setViewport(
      adminHeadingsData.viewports.tablet.width,
      adminHeadingsData.viewports.tablet.height
    );
    await expect(authenticatedShiftsPage.heading).toBeVisible();

    // Desktop viewport
    await authenticatedShiftsPage.setViewport(
      adminHeadingsData.viewports.desktop.width,
      adminHeadingsData.viewports.desktop.height
    );
    await expect(authenticatedShiftsPage.heading).toBeVisible();
  });

  test('TC-12 - Verify single primary semantic landmark (h1) per page for accessibility', async ({
    authenticatedShiftsPage,
    orderTypesPage,
    statusOptionsPage,
  }) => {
    // Shifts page exactly one h1
    await authenticatedShiftsPage.gotoShifts();
    await expect(authenticatedShiftsPage.heading).toBeVisible();
    const shiftsH1Count = await authenticatedShiftsPage.getHeadingCount(1);
    expect(shiftsH1Count).toBe(1);

    // Order Types page exactly one h1
    await orderTypesPage.gotoOrderTypes();
    await expect(orderTypesPage.heading).toBeVisible();
    const orderTypesH1Count = await orderTypesPage.getHeadingCount(1);
    expect(orderTypesH1Count).toBe(1);

    // Status Options page exactly one h1
    await statusOptionsPage.gotoStatusOptions();
    await expect(statusOptionsPage.heading).toBeVisible();
    const statusOptionsH1Count = await statusOptionsPage.getHeadingCount(1);
    expect(statusOptionsH1Count).toBe(1);
  });
});
