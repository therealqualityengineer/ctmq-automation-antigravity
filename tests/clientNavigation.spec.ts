import { test, expect } from '../fixtures/customFixtures';
import { clientNavData } from '../test-data/clientNavData';

test.describe('CTMQ-17 - Client Navigation Tab & Add Client Button Suite', () => {

  test('TC-01 - Primary navigation tab order and visibility', async ({ authenticatedNavigationPage }) => {
    await expect(authenticatedNavigationPage.homeLink).toBeVisible();
    await expect(authenticatedNavigationPage.tempLink).toBeVisible();
    await expect(authenticatedNavigationPage.clientLink).toBeVisible();
    await expect(authenticatedNavigationPage.adminLink).toBeVisible();

    const tabNames = await authenticatedNavigationPage.getPrimaryTabNames();
    const homeIndex = tabNames.indexOf(clientNavData.tabs.home);
    const tempIndex = tabNames.indexOf(clientNavData.tabs.temp);
    const clientIndex = tabNames.indexOf(clientNavData.tabs.client);
    const adminIndex = tabNames.indexOf(clientNavData.tabs.admin);

    expect(homeIndex).toBeGreaterThanOrEqual(0);
    expect(tempIndex).toBeGreaterThan(homeIndex);
    expect(clientIndex).toBeGreaterThan(tempIndex);
    expect(adminIndex).toBeGreaterThan(clientIndex);
  });

  test('TC-02 - Client tab navigation and active tab indicator', async ({ authenticatedNavigationPage, clientPage, page }) => {
    await authenticatedNavigationPage.clickClient();

    await expect(page).toHaveURL(new RegExp(clientNavData.urls.client));
    await expect(clientPage.pageHeading).toHaveText(clientNavData.headings.client);

    await expect(authenticatedNavigationPage.clientLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.clientLink).toHaveClass(clientNavData.styles.activeClassPattern);

    await expect(authenticatedNavigationPage.tempLink).not.toHaveAttribute('aria-current', 'page');
    await expect(authenticatedNavigationPage.tempLink).toHaveClass(clientNavData.styles.inactiveClassPattern);
  });

  test('TC-03 - + Add Client button presence and visual styling', async ({ authenticatedClientPage }) => {
    await expect(authenticatedClientPage.addClientButton).toBeVisible();
    await expect(authenticatedClientPage.addClientButton).toHaveText(clientNavData.buttons.addClient);
    await expect(authenticatedClientPage.addClientButton).toHaveClass(clientNavData.styles.addClientButtonClassPattern);
  });

  test('TC-04 - + Add Client button interaction opens client form', async ({ authenticatedClientPage, page }) => {
    await authenticatedClientPage.clickAddClient();

    await expect(page).toHaveURL(new RegExp(clientNavData.urls.clientNew));
  });

  test('TC-05 - AppShell header layout preservation on Client page', async ({ authenticatedClientPage, navigationPage }) => {
    await expect(navigationPage.headerLogo).toBeVisible();
    await expect(navigationPage.userIdentity).toBeVisible();
    await expect(navigationPage.logoutButton).toBeVisible();
    await expect(authenticatedClientPage.pageHeading).toBeVisible();
  });

  test('TC-06 - Route protection for unauthenticated access to Client page', async ({ clientPage, page }) => {
    await clientPage.gotoClient();

    await expect(page).toHaveURL(new RegExp(clientNavData.urls.login));
    await expect(clientPage.addClientButton).not.toBeVisible();
  });

  test('TC-07 - Viewport responsiveness on tablet and mobile viewports', async ({ authenticatedClientPage, navigationPage }) => {
    // Desktop
    await authenticatedClientPage.setViewport(1280, 800);
    await expect(navigationPage.clientLink).toBeVisible();
    await expect(authenticatedClientPage.addClientButton).toBeVisible();

    // Tablet
    await authenticatedClientPage.setViewport(768, 1024);
    await expect(navigationPage.clientLink).toBeVisible();
    await expect(authenticatedClientPage.addClientButton).toBeVisible();

    // Mobile
    await authenticatedClientPage.setViewport(375, 667);
    await expect(authenticatedClientPage.addClientButton).toBeVisible();
  });

  test('TC-08 - Tab switching between navigation items preserves states', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.gotoClient();
    await expect(authenticatedNavigationPage.clientLink).toHaveAttribute('aria-current', 'page');

    await authenticatedNavigationPage.clickTemp();
    await expect(page).toHaveURL(new RegExp(clientNavData.urls.temp));
    await expect(authenticatedNavigationPage.tempLink).toHaveAttribute('aria-current', 'page');

    await authenticatedNavigationPage.clickClient();
    await expect(page).toHaveURL(new RegExp(clientNavData.urls.client));
    await expect(authenticatedNavigationPage.clientLink).toHaveAttribute('aria-current', 'page');
  });
});
