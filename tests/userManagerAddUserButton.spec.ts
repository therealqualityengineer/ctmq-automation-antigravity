import { test, expect } from '../fixtures/customFixtures';
import { userManagerData } from '../test-data/userManagerData';

test.describe('CTMQ-5 - User Manager + Add User Button Suite', () => {
  test('TC-01 - + Add User button visibility and location on User Manager page', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.pageHeading).toBeVisible();

    const isAbove = await authenticatedUserManagerPage.isButtonAboveHeading();
    expect(isAbove).toBe(true);

    const isCentered = await authenticatedUserManagerPage.isButtonCentered();
    expect(isCentered).toBe(true);
  });

  test('TC-02 - Button icon and text content verification', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserButton).toContainText(userManagerData.button.name);
    await expect(authenticatedUserManagerPage.addUserPlusIcon).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserPlusIcon).toHaveAttribute('aria-hidden', 'true');
  });

  test('TC-03 - Button visual styling and theme adherence', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.bg)
    );
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.rounded)
    );
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.paddingX)
    );
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.paddingY)
    );
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.textColor)
    );

    const backgroundColor = await authenticatedUserManagerPage.getButtonComputedStyle('background-color');
    expect(backgroundColor).toMatch(userManagerData.button.styles.backgroundColorPattern);

    const color = await authenticatedUserManagerPage.getButtonComputedStyle('color');
    expect(color).toMatch(userManagerData.button.styles.colorPattern);
  });

  test('TC-04 - Button hover state styling', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserButton).toHaveClass(
      new RegExp(userManagerData.button.tailwindClasses.hoverBg)
    );

    await authenticatedUserManagerPage.hoverAddUserButton();

    const hoverBgColor = await authenticatedUserManagerPage.getButtonComputedStyle('background-color');
    expect(hoverBgColor).toMatch(userManagerData.button.styles.hoverBackgroundColorPattern);
  });

  test('TC-05 - Keyboard navigation and accessibility', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserButton).toHaveAccessibleName(
      userManagerData.button.ariaLabel
    );

    await authenticatedUserManagerPage.addUserButton.focus();
    await expect(authenticatedUserManagerPage.addUserButton).toBeFocused();
  });

  test('TC-06 - Route protection redirects unauthenticated users', async ({
    userManagerPage,
    page,
  }) => {
    await userManagerPage.gotoUserManager();

    await expect(page).toHaveURL(new RegExp(userManagerData.urls.login));
    await expect(userManagerPage.addUserButton).not.toBeVisible();
  });

  test('TC-07 - Non-regression: Header, PrimaryNav, and AdminSubNav integrity', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.headerLogo).toBeVisible();
    await expect(authenticatedUserManagerPage.logoutButton).toBeVisible();
    await expect(authenticatedUserManagerPage.homeNavLink).toBeVisible();
    await expect(authenticatedUserManagerPage.adminNavLink).toBeVisible();
    await expect(authenticatedUserManagerPage.userManagerNavLink).toBeVisible();

    await expect(authenticatedUserManagerPage.userManagerNavLink).toHaveAttribute('aria-current', 'page');
    await expect(authenticatedUserManagerPage.userManagerNavLink).toHaveClass(/bg-blue-900/);
  });

  test('TC-08 - Non-regression: User Manager search functionality', async ({
    authenticatedUserManagerPage,
  }) => {
    await expect(authenticatedUserManagerPage.searchInput).toBeVisible();
    await expect(authenticatedUserManagerPage.searchButton).toBeVisible();

    await authenticatedUserManagerPage.searchUser(userManagerData.search.testQuery);
    await expect(authenticatedUserManagerPage.userTable).toBeVisible();

    await authenticatedUserManagerPage.clearSearch();
    await expect(authenticatedUserManagerPage.userTable).toBeVisible();
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
  });

  test('TC-09 - Non-regression: User table, row navigation & pagination', async ({
    authenticatedUserManagerPage,
    page,
  }) => {
    await expect(authenticatedUserManagerPage.userTable).toBeVisible();

    const headerCount = await authenticatedUserManagerPage.tableHeaderColumns.count();
    expect(headerCount).toBeGreaterThanOrEqual(userManagerData.table.columns.length);

    for (const columnTitle of userManagerData.table.columns) {
      await expect(authenticatedUserManagerPage.userTable).toContainText(columnTitle);
    }

    const rowCount = await authenticatedUserManagerPage.tableRows.count();
    if (rowCount > 0) {
      await authenticatedUserManagerPage.clickUserRow(0);
      await expect(page).toHaveURL(new RegExp(userManagerData.urls.adminUserDetailPrefix));
    }
  });

  test('TC-10 - Non-regression: Search with no matching users', async ({
    authenticatedUserManagerPage,
  }) => {
    await authenticatedUserManagerPage.searchUser(userManagerData.search.nonExistentQuery);

    await expect(authenticatedUserManagerPage.noUsersFoundRow).toBeVisible();
    await expect(authenticatedUserManagerPage.noUsersFoundRow).toHaveText(
      userManagerData.messages.noUsersFound
    );

    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    const isAbove = await authenticatedUserManagerPage.isButtonAboveHeading();
    expect(isAbove).toBe(true);
  });

  test('TC-11 - Responsive layout at tablet viewport (768px width)', async ({
    authenticatedUserManagerPage,
  }) => {
    await authenticatedUserManagerPage.setViewport(
      userManagerData.viewports.tablet.width,
      userManagerData.viewports.tablet.height
    );

    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.pageHeading).toBeVisible();

    const isAbove = await authenticatedUserManagerPage.isButtonAboveHeading();
    expect(isAbove).toBe(true);

    const hasHorizontalScroll = await authenticatedUserManagerPage.hasHorizontalScrollBar();
    expect(hasHorizontalScroll).toBe(false);
  });

  test('TC-12 - Responsive layout at mobile viewport (375px width)', async ({
    authenticatedUserManagerPage,
  }) => {
    await authenticatedUserManagerPage.setViewport(
      userManagerData.viewports.mobile.width,
      userManagerData.viewports.mobile.height
    );

    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();
    await expect(authenticatedUserManagerPage.pageHeading).toBeVisible();

    const isAbove = await authenticatedUserManagerPage.isButtonAboveHeading();
    expect(isAbove).toBe(true);
  });

  test('TC-13 - Layout coexistence with feedback banner', async ({
    authenticatedUserManagerPage,
    page,
  }) => {
    await page.evaluate((bannerText) => {
      const banner = document.createElement('div');
      banner.id = 'feedback-banner-test';
      banner.className = 'text-center text-sm font-medium text-emerald-800 bg-emerald-50 p-2 rounded';
      banner.innerText = bannerText;
      const main = document.querySelector('main') || document.body;
      main.insertBefore(banner, main.firstChild);
    }, userManagerData.messages.userSavedSuccess);

    const banner = page.locator('#feedback-banner-test');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(userManagerData.messages.userSavedSuccess);

    const bannerBox = await banner.boundingBox();
    const buttonBox = await authenticatedUserManagerPage.addUserButton.boundingBox();

    if (bannerBox && buttonBox) {
      expect(buttonBox.y).toBeGreaterThanOrEqual(bannerBox.y + bannerBox.height);
    }
  });

  test('TC-14 - Button behavior boundary isolation (no unintended mutations)', async ({
    authenticatedUserManagerPage,
    page,
  }) => {
    let unhandledErrorOccurred = false;
    page.on('pageerror', () => {
      unhandledErrorOccurred = true;
    });

    await authenticatedUserManagerPage.hoverAddUserButton();
    await expect(authenticatedUserManagerPage.addUserButton).toBeVisible();

    expect(unhandledErrorOccurred).toBe(false);
  });
});
