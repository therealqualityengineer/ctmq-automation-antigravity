import { test, expect } from '../fixtures/customFixtures';
import { tempNavData } from '../test-data/tempNavData';

test.describe('CTMQ-7 - Temp Navigation Tab Suite', () => {

  test('TC-01 - Primary navigation tab order and visibility', async ({ authenticatedNavigationPage }) => {
    await expect(authenticatedNavigationPage.homeLink).toBeVisible();
    await expect(authenticatedNavigationPage.tempLink).toBeVisible();
    await expect(authenticatedNavigationPage.adminLink).toBeVisible();

    const tabNames = await authenticatedNavigationPage.getPrimaryTabNames();
    const homeIndex = tabNames.indexOf(tempNavData.tabs.home);
    const tempIndex = tabNames.indexOf(tempNavData.tabs.temp);
    const adminIndex = tabNames.indexOf(tempNavData.tabs.admin);

    expect(homeIndex).toBeGreaterThanOrEqual(0);
    expect(tempIndex).toBeGreaterThan(homeIndex);
    expect(adminIndex).toBeGreaterThan(tempIndex);
  });

  test('TC-02 - Temp tab navigation to minimal placeholder', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.clickTemp();

    await expect(page).toHaveURL(new RegExp(tempNavData.urls.temp));
    await expect(authenticatedNavigationPage.pageHeading).toHaveText(tempNavData.placeholder.heading);
  });

  test('TC-03 - Active tab visual styling on Temp tab', async ({ authenticatedNavigationPage }) => {
    await authenticatedNavigationPage.gotoTemp();

    await expect(authenticatedNavigationPage.tempLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.tempLink).toHaveClass(tempNavData.styles.activeClassPattern);

    await expect(authenticatedNavigationPage.homeLink).not.toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.homeLink).toHaveClass(tempNavData.styles.inactiveClassPattern);

    await expect(authenticatedNavigationPage.adminLink).not.toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.adminLink).toHaveClass(tempNavData.styles.inactiveClassPattern);
  });

  test('TC-04 - Non-regression: Home tab navigation', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoTemp();
    await authenticatedNavigationPage.clickHome();

    await expect(page).toHaveURL(new RegExp(`.*${tempNavData.urls.home}$`));
    await expect(authenticatedNavigationPage.homeLink).toHaveClass(tempNavData.styles.activeClassPattern);
    await expect(authenticatedNavigationPage.tempLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('TC-05 - Non-regression: Admin tab and User Manager navigation', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoTemp();
    await authenticatedNavigationPage.clickAdmin();

    await expect(page).toHaveURL(new RegExp(tempNavData.urls.adminUsers));
    await expect(authenticatedNavigationPage.adminLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.tempLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('TC-06 - Header and AppShell layout preservation', async ({ authenticatedNavigationPage }) => {
    await authenticatedNavigationPage.gotoTemp();

    await expect(authenticatedNavigationPage.headerLogo).toBeVisible();
    await expect(authenticatedNavigationPage.userIdentity).toBeVisible();
    await expect(authenticatedNavigationPage.logoutButton).toBeVisible();
    await expect(authenticatedNavigationPage.leftSidebar).not.toBeVisible();
  });

  test('TC-07 - Route protection for unauthenticated access', async ({ navigationPage, page }) => {
    await navigationPage.gotoTemp();

    await expect(page).toHaveURL(new RegExp(tempNavData.urls.login));
    await expect(navigationPage.tempLink).not.toBeVisible();
  });

  test('TC-08 - Exclusion of unauthorized sidebar navigation', async ({ authenticatedNavigationPage }) => {
    await authenticatedNavigationPage.gotoTemp();

    await expect(authenticatedNavigationPage.leftSidebar).not.toBeVisible();
    await expect(authenticatedNavigationPage.pageHeading).toBeVisible();
  });

  test('TC-09 - Direct URL deep linking for authenticated user', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoTemp();

    await expect(page).toHaveURL(new RegExp(tempNavData.urls.temp));
    await expect(authenticatedNavigationPage.pageHeading).toHaveText(tempNavData.placeholder.heading);
    await expect(authenticatedNavigationPage.tempLink).toHaveAttribute('aria-current', 'page');
  });

  test('TC-10 - Viewport responsiveness and layout integrity', async ({ authenticatedNavigationPage }) => {
    await authenticatedNavigationPage.gotoTemp();

    // Desktop
    await authenticatedNavigationPage.setViewport(1280, 800);
    await expect(authenticatedNavigationPage.tempLink).toBeVisible();

    // Tablet
    await authenticatedNavigationPage.setViewport(768, 1024);
    await expect(authenticatedNavigationPage.tempLink).toBeVisible();

    // Mobile
    await authenticatedNavigationPage.setViewport(375, 667);
    await expect(authenticatedNavigationPage.tempLink).toBeVisible();
  });

  test('TC-11 - Session logout from Temp page', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoTemp();
    await authenticatedNavigationPage.clickLogout();

    await expect(page).toHaveURL(new RegExp(tempNavData.urls.login));
  });

  test('TC-12 - Browser Back and Forward navigation', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoHome();
    await authenticatedNavigationPage.clickTemp();
    await expect(page).toHaveURL(new RegExp(tempNavData.urls.temp));

    await authenticatedNavigationPage.clickAdmin();
    await expect(page).toHaveURL(new RegExp(tempNavData.urls.adminUsers));

    await authenticatedNavigationPage.goBack();
    await expect(page).toHaveURL(new RegExp(tempNavData.urls.temp));
    await expect(authenticatedNavigationPage.tempLink).toHaveAttribute('aria-current', 'page');

    await authenticatedNavigationPage.goForward();
    await expect(page).toHaveURL(new RegExp(tempNavData.urls.adminUsers));
    await expect(authenticatedNavigationPage.adminLink).toHaveAttribute('aria-current', 'page');
  });

});

