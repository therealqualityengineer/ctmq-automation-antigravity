import { test, expect } from '../fixtures/customFixtures';
import { adminNavData } from '../test-data/adminNavData';

test.describe('CTMQ-43 - Admin Landing Page & Sub-Navigation Suite', () => {

  test('TC-01 - Verify top-level Admin primary nav navigates to /admin landing page', async ({ authenticatedNavigationPage, page }) => {
    await authenticatedNavigationPage.clickAdmin();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(authenticatedNavigationPage.adminLink).toHaveAttribute('aria-current', 'page');
  });

  test('TC-02 - Verify Admin landing page shell and content rendering', async ({ authenticatedAdminPage, navigationPage }) => {
    await expect(navigationPage.headerLogo).toBeVisible();
    await expect(navigationPage.userIdentity).toBeVisible();
    await expect(navigationPage.logoutButton).toBeVisible();
    await expect(authenticatedAdminPage.primaryNav).toBeVisible();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
    await expect(authenticatedAdminPage.contentArea).toBeVisible();
  });

  test('TC-03 - Verify Admin sub-navigation bar renders across all admin routes', async ({ authenticatedAdminPage }) => {
    // 1. On /admin
    await authenticatedAdminPage.gotoAdmin();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
    await expect(authenticatedAdminPage.userManagerSubTab).toBeVisible();

    // 2. On /admin/users
    await authenticatedAdminPage.gotoAdminUsers();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
    await expect(authenticatedAdminPage.userManagerSubTab).toBeVisible();

    // 3. On /admin/users/new
    await authenticatedAdminPage.gotoAddUser();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
    await expect(authenticatedAdminPage.userManagerSubTab).toBeVisible();
  });

  test('TC-04 - Verify clicking User Manager sub-tab navigates to /admin/users', async ({ authenticatedAdminPage, userManagerPage, page }) => {
    await authenticatedAdminPage.gotoAdmin();
    await authenticatedAdminPage.clickUserManagerSubTab();

    await expect(page).toHaveURL(new RegExp(adminNavData.urls.adminUsers));
    await expect(userManagerPage.pageHeading).toBeVisible();
    await expect(userManagerPage.searchInput).toBeVisible();
    await expect(userManagerPage.addUserButton).toBeVisible();
  });

  test('TC-05 - Verify active styling on top-level Admin tab across all admin routes', async ({ authenticatedAdminPage, page }) => {
    // 1. Route: /admin
    await authenticatedAdminPage.gotoAdmin();
    await expect(authenticatedAdminPage.adminLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.adminLink).toHaveClass(adminNavData.styles.activeAdminNavPattern);

    // 2. Route: /admin/users
    await authenticatedAdminPage.gotoAdminUsers();
    await expect(authenticatedAdminPage.adminLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.adminLink).toHaveClass(adminNavData.styles.activeAdminNavPattern);

    // 3. Route: /admin/users/new
    await authenticatedAdminPage.gotoAddUser();
    await expect(authenticatedAdminPage.adminLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.adminLink).toHaveClass(adminNavData.styles.activeAdminNavPattern);
  });

  test('TC-06 - Verify active styling on User Manager sub-tab', async ({ authenticatedAdminPage }) => {
    // 1. On /admin: User Manager sub-tab should NOT be active
    await authenticatedAdminPage.gotoAdmin();
    await expect(authenticatedAdminPage.userManagerSubTab).not.toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.userManagerSubTab).not.toHaveClass(adminNavData.styles.activeUserSubmenuPattern);

    // 2. On /admin/users: User Manager sub-tab SHOULD be active
    await authenticatedAdminPage.gotoAdminUsers();
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveClass(adminNavData.styles.activeUserSubmenuPattern);

    // 3. On /admin/users/new: User Manager sub-tab SHOULD be active
    await authenticatedAdminPage.gotoAddUser();
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveClass(adminNavData.styles.activeUserSubmenuPattern);
  });

  test('TC-07 - Verify User Manager existing functionality preservation', async ({ authenticatedAdminPage, userManagerPage, addUserPage, page }) => {
    await authenticatedAdminPage.gotoAdminUsers();

    // Verify search interaction
    await userManagerPage.searchUser('admin');
    await expect(userManagerPage.userTable).toBeVisible();

    // Verify navigating to Add User
    await userManagerPage.clickAddUserButton();
    await expect(page).toHaveURL(new RegExp(adminNavData.urls.adminUsersNew));
    await expect(addUserPage.usernameInput).toBeVisible();
  });

  test('TC-08 - Verify unauthenticated route protection for /admin and sub-routes', async ({ adminPage, page }) => {
    // Attempt /admin
    await adminPage.gotoAdmin();
    await expect(page).toHaveURL(new RegExp(adminNavData.urls.login));

    // Attempt /admin/users
    await adminPage.gotoAdminUsers();
    await expect(page).toHaveURL(new RegExp(adminNavData.urls.login));
  });

  test('TC-09 - Verify direct URL navigation, browser refresh, and back/forward navigation', async ({ authenticatedAdminPage, page }) => {
    // 1. Direct navigation to /admin
    await authenticatedAdminPage.gotoAdmin();
    await expect(page).toHaveURL(/\/admin$/);

    // 2. Refresh browser on /admin
    await authenticatedAdminPage.reloadPage();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(authenticatedAdminPage.adminLink).toHaveAttribute('aria-current', 'page');

    // 3. Navigate to /admin/users via sub-tab
    await authenticatedAdminPage.clickUserManagerSubTab();
    await expect(page).toHaveURL(new RegExp(adminNavData.urls.adminUsers));
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveAttribute('aria-current', 'page');

    // 4. Back button returns to /admin
    await authenticatedAdminPage.goBack();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(authenticatedAdminPage.userManagerSubTab).not.toHaveAttribute('aria-current', 'page');

    // 5. Forward button returns to /admin/users
    await authenticatedAdminPage.goForward();
    await expect(page).toHaveURL(new RegExp(adminNavData.urls.adminUsers));
    await expect(authenticatedAdminPage.userManagerSubTab).toHaveAttribute('aria-current', 'page');
  });

  test('TC-10 - Verify responsive layout across viewports', async ({ authenticatedAdminPage }) => {
    // Desktop Viewport
    await authenticatedAdminPage.setViewport(adminNavData.viewports.desktop.width, adminNavData.viewports.desktop.height);
    await expect(authenticatedAdminPage.adminLink).toBeVisible();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();

    // Tablet Viewport
    await authenticatedAdminPage.setViewport(adminNavData.viewports.tablet.width, adminNavData.viewports.tablet.height);
    await expect(authenticatedAdminPage.adminLink).toBeVisible();
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();

    // Mobile Viewport
    await authenticatedAdminPage.setViewport(adminNavData.viewports.mobile.width, adminNavData.viewports.mobile.height);
    await expect(authenticatedAdminPage.adminSubNav).toBeVisible();
  });
});
