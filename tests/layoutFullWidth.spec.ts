import { test, expect } from '../fixtures/customFixtures';
import { layoutData } from '../test-data/layoutData';

test.describe('CTMQ-10 - Full-Width Application Layout Across All Pages', () => {

  test('TC-01 - Header Layout: Left-aligned logo and primary navigation tabs', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.gotoHome();

    await expect(authenticatedLayoutPage.headerLogo).toBeVisible();
    await expect(authenticatedLayoutPage.homeTab).toBeVisible();
    await expect(authenticatedLayoutPage.tempTab).toBeVisible();
    await expect(authenticatedLayoutPage.adminTab).toBeVisible();

    const logoBox = await authenticatedLayoutPage.getLogoBoundingBox();
    const navBox = await authenticatedLayoutPage.getNavBoundingBox();

    expect(logoBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(logoBox!.x).toBeLessThanOrEqual(layoutData.thresholds.headerLeftAnchorMaxX);
    expect(navBox!.x).toBeLessThanOrEqual(layoutData.thresholds.headerLeftAnchorMaxX);
  });

  test('TC-02 - Header Layout: Right-aligned user profile and Logout action', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoHome();

    await expect(authenticatedLayoutPage.userInfo).toBeVisible();
    await expect(authenticatedLayoutPage.userInfo).toHaveText(layoutData.labels.userName);
    await expect(authenticatedLayoutPage.logoutButton).toBeVisible();

    const userBox = await authenticatedLayoutPage.getUserInfoBoundingBox();
    const logoutBox = await authenticatedLayoutPage.getLogoutBoundingBox();

    expect(userBox).not.toBeNull();
    expect(logoutBox).not.toBeNull();
    expect(userBox!.x).toBeLessThan(logoutBox!.x);
    expect(logoutBox!.x).toBeGreaterThan(layoutData.thresholds.desktopContentMinWidth);
  });

  test('TC-03 - Home Page full-width viewport utilization', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoHome();

    await expect(authenticatedLayoutPage.mainContent).toBeVisible();
    const mainWidth = await authenticatedLayoutPage.getMainWidth();

    expect(mainWidth).toBe(layoutData.viewports.desktopStandard.width);
    expect(mainWidth).toBeGreaterThan(layoutData.thresholds.legacyMaxWidthCap);
  });

  test('TC-04 - Temp Page and records table full-width expansion', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoTemp();

    await expect(authenticatedLayoutPage.mainContent).toBeVisible();
    await expect(authenticatedLayoutPage.dataTable).toBeVisible();

    const mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.desktopStandard.width);
  });

  test('TC-05 - Admin / User Manager table full-width expansion', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoAdminUsers();

    await expect(authenticatedLayoutPage.mainContent).toBeVisible();
    await expect(authenticatedLayoutPage.dataTable).toBeVisible();

    const mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.desktopStandard.width);
  });

  test('TC-06 - Add / Edit User forms full-width container expansion', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoAddUser();

    await expect(authenticatedLayoutPage.formContainer).toBeVisible();
    const formWidth = await authenticatedLayoutPage.getFormWidth();

    expect(formWidth).toBeGreaterThan(layoutData.thresholds.legacyMaxWidthCap);
  });

  test('TC-07 - Add / Edit Temp forms full-width container layout', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);
    await authenticatedLayoutPage.gotoAddTemp();

    await expect(authenticatedLayoutPage.formContainer).toBeVisible();
    const formWidth = await authenticatedLayoutPage.getFormWidth();

    expect(formWidth).toBeGreaterThan(layoutData.thresholds.legacyMaxWidthCap);
  });

  test('TC-08 - Admin secondary navigation / submenu behavior', async ({ authenticatedLayoutPage, page }) => {
    await authenticatedLayoutPage.gotoAdminUsers();

    await expect(authenticatedLayoutPage.adminSubmenu).toBeVisible();
    await expect(authenticatedLayoutPage.userManagerSubTab).toBeVisible();
    await expect(authenticatedLayoutPage.userManagerSubTab).toHaveClass(layoutData.styles.activeSubmenuClassPattern);

    await authenticatedLayoutPage.clickUserManagerSubTab();
    await expect(page).toHaveURL(new RegExp(layoutData.urls.adminUsers));
  });

  test('TC-09 - Tab navigation and active state retention', async ({ authenticatedLayoutPage, page }) => {
    await authenticatedLayoutPage.gotoHome();
    await expect(authenticatedLayoutPage.homeTab).toHaveClass(layoutData.styles.activeNavClassPattern);

    await authenticatedLayoutPage.clickTemp();
    await expect(page).toHaveURL(new RegExp(layoutData.urls.temp));
    await expect(authenticatedLayoutPage.tempTab).toHaveClass(layoutData.styles.activeNavClassPattern);

    await authenticatedLayoutPage.clickAdmin();
    await expect(page).toHaveURL(new RegExp(layoutData.urls.adminUsers));
    await expect(authenticatedLayoutPage.adminTab).toHaveClass(layoutData.styles.activeNavClassPattern);
  });

  test('TC-10 - User logout execution from full-width header', async ({ authenticatedLayoutPage, page }) => {
    await authenticatedLayoutPage.gotoHome();
    await authenticatedLayoutPage.clickLogout();

    await expect(page).toHaveURL(new RegExp(layoutData.urls.login));
    await expect(authenticatedLayoutPage.header).not.toBeVisible();
    await expect(authenticatedLayoutPage.logoutButton).not.toBeVisible();
    await expect(authenticatedLayoutPage.headerLogo).not.toBeVisible();
  });

  test('TC-11 - Absence of hardcoded max-width constraint on wide screens', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopWide.width, layoutData.viewports.desktopWide.height);
    await authenticatedLayoutPage.gotoAddUser();

    const mainWidth = await authenticatedLayoutPage.getMainWidth();
    const formWidth = await authenticatedLayoutPage.getFormWidth();

    expect(mainWidth).toBe(layoutData.viewports.desktopWide.width);
    expect(formWidth).toBeGreaterThan(layoutData.thresholds.desktopContentMinWidth);
  });

  test('TC-12 - Absence of horizontal overflow on standard desktop viewports', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopStandard.width, layoutData.viewports.desktopStandard.height);

    const routes = [
      layoutData.urls.home,
      layoutData.urls.temp,
      layoutData.urls.adminUsers,
      layoutData.urls.adminUsersNew,
      layoutData.urls.tempNew,
    ];

    for (const route of routes) {
      await authenticatedLayoutPage.navigate(route);
      const hasOverflow = await authenticatedLayoutPage.hasPageHorizontalOverflow();
      expect(hasOverflow).toBeFalsy();
    }
  });

  test('TC-13 - Unauthenticated login view layout isolation', async ({ layoutPage, page }) => {
    await layoutPage.gotoLogin();

    await expect(page).toHaveURL(new RegExp(layoutData.urls.login));
    await expect(layoutPage.loginCard).toBeVisible();
    await expect(layoutPage.homeTab).not.toBeVisible();
    await expect(layoutPage.tempTab).not.toBeVisible();
    await expect(layoutPage.adminTab).not.toBeVisible();
  });

  test('TC-14 - Responsive layout adaptation at Tablet viewport (768px)', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.tablet.width, layoutData.viewports.tablet.height);
    await authenticatedLayoutPage.gotoHome();

    await expect(authenticatedLayoutPage.headerLogo).toBeVisible();
    await expect(authenticatedLayoutPage.logoutButton).toBeVisible();
    await expect(authenticatedLayoutPage.mainContent).toBeVisible();

    const hasOverflow = await authenticatedLayoutPage.hasPageHorizontalOverflow();
    expect(hasOverflow).toBeFalsy();
  });

  test('TC-15 - Responsive layout adaptation at Mobile viewport (375px)', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.mobile.width, layoutData.viewports.mobile.height);
    await authenticatedLayoutPage.gotoHome();

    await expect(authenticatedLayoutPage.headerLogo).toBeVisible();
    await expect(authenticatedLayoutPage.logoutButton).toBeVisible();

    const logoBox = await authenticatedLayoutPage.getLogoBoundingBox();
    const logoutBox = await authenticatedLayoutPage.getLogoutBoundingBox();

    expect(logoBox).not.toBeNull();
    expect(logoutBox).not.toBeNull();
    expect(logoutBox!.x).toBeGreaterThan(logoBox!.x);
  });

  test('TC-16 - Table responsiveness and column access at narrow viewports', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.tablet.width, layoutData.viewports.tablet.height);
    await authenticatedLayoutPage.gotoAdminUsers();

    await expect(authenticatedLayoutPage.tableContainer).toBeVisible();
    await expect(authenticatedLayoutPage.dataTable).toBeVisible();
    await authenticatedLayoutPage.waitForTableDataLoaded();
    await expect(authenticatedLayoutPage.tableContainer).toHaveClass(new RegExp(layoutData.styles.tableOverflowClass));

    const containerWidth = await authenticatedLayoutPage.getTableContainerClientWidth();
    const scrollWidth = await authenticatedLayoutPage.getTableContainerScrollWidth();

    expect(scrollWidth).toBeGreaterThan(containerWidth);

    const hasPageOverflow = await authenticatedLayoutPage.hasPageHorizontalOverflow();
    expect(hasPageOverflow).toBeFalsy();
  });

  test('TC-17 - Ultrawide screen layout scaling (2560x1440)', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.ultrawide.width, layoutData.viewports.ultrawide.height);
    await authenticatedLayoutPage.gotoAdminUsers();

    const mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.ultrawide.width);

    const logoBox = await authenticatedLayoutPage.getLogoBoundingBox();
    const logoutBox = await authenticatedLayoutPage.getLogoutBoundingBox();

    expect(logoBox!.x).toBeLessThanOrEqual(layoutData.thresholds.headerLeftAnchorMaxX);
    expect(logoutBox!.x).toBeGreaterThan(layoutData.viewports.ultrawide.width - 200);
  });

  test('TC-18 - Dynamic viewport resizing responsiveness', async ({ authenticatedLayoutPage }) => {
    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopWide.width, layoutData.viewports.desktopWide.height);
    await authenticatedLayoutPage.gotoHome();

    let mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.desktopWide.width);

    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.mobile.width, layoutData.viewports.mobile.height);
    mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.mobile.width);

    await authenticatedLayoutPage.setViewportSize(layoutData.viewports.desktopWide.width, layoutData.viewports.desktopWide.height);
    mainWidth = await authenticatedLayoutPage.getMainWidth();
    expect(mainWidth).toBe(layoutData.viewports.desktopWide.width);
  });
});
