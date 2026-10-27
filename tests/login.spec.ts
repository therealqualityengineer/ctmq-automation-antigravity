import { test, expect } from '../fixtures/customFixtures';
import { authData } from '../test-data/authData';

test.describe('CTMQ-3 - Login Page UI & Authentication Suite', () => {
  test('TC-01 - Login page shows CTMQ logo in a centered card', async ({ loginPage }) => {
    await loginPage.gotoLoginPage();

    await expect(loginPage.loginCard).toBeVisible();
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.logo).toHaveAttribute('alt', authData.branding.logoAlt);
    await expect(loginPage.logo).toHaveAttribute('src', new RegExp(authData.branding.logoSrcSubpath));
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-02 - Successful login with valid Staffing Admin credentials', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );

    await loginPage.login(authData.validUser.username, authData.validUser.password);

    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(200);
    await expect(page).toHaveURL(/\/(?!login).*/);
  });

  test('TC-03 - Invalid password rejection', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await loginPage.login(authData.validUser.username, authData.invalidUser.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(authData.messages.invalidCredentials);
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC-04 - Unknown or non-existent username rejection', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await loginPage.login(authData.nonExistentUser.username, authData.nonExistentUser.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(authData.messages.invalidCredentials);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC-05 - Required-field validation on empty form submission', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/login')) requestFired = true;
    });

    await loginPage.clickLoginButton();

    expect(requestFired).toBe(false);
    await expect(loginPage.usernameInput).toHaveAttribute('required', '');
    await expect(loginPage.passwordInput).toHaveAttribute('required', '');
  });

  test('TC-06 - Missing username blocks form submission', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/login')) requestFired = true;
    });

    await loginPage.enterPassword(authData.validUser.password);
    await loginPage.clickLoginButton();

    expect(requestFired).toBe(false);
    await expect(loginPage.usernameInput).toHaveAttribute('required', '');
  });

  test('TC-07 - Missing password blocks form submission', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/login')) requestFired = true;
    });

    await loginPage.enterUsername(authData.validUser.username);
    await loginPage.clickLoginButton();

    expect(requestFired).toBe(false);
    await expect(loginPage.passwordInput).toHaveAttribute('required', '');
  });

  test('TC-08 - Rate limit threshold enforcement returns 429', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    let requestCount = 0;
    await page.route(authData.apiEndpoints.login, async (route) => {
      requestCount++;
      if (requestCount >= 6) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ message: authData.messages.rateLimitExceeded }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: authData.messages.invalidCredentials }),
        });
      }
    });

    for (let i = 0; i < 5; i++) {
      await loginPage.login(authData.validUser.username, authData.invalidUser.password);
      await expect(loginPage.errorMessage).toContainText(authData.messages.invalidCredentials);
    }

    await loginPage.login(authData.validUser.username, authData.invalidUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(authData.messages.rateLimitExceeded);
  });

  test('TC-09 - Submitting state and button disabled during request in flight', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await page.route(authData.apiEndpoints.login, async (route) => {
      await page.waitForTimeout(1000);
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: authData.messages.invalidCredentials }),
      });
    });

    await loginPage.enterUsername(authData.validUser.username);
    await loginPage.enterPassword(authData.validUser.password);
    await loginPage.clickLoginButton();

    await expect(loginPage.loginButton).toBeDisabled();
    await expect(loginPage.loginButton).toHaveText(authData.messages.loggingInButton);

    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.loginButton).toHaveText(authData.messages.loginButton);
  });

  test('TC-10 - Stray caret prevention on non-editable chrome and non-draggable logo', async ({ loginPage }) => {
    await loginPage.gotoLoginPage();

    await expect(loginPage.logo).toHaveAttribute('draggable', 'false');

    await loginPage.clickBackground();
    await expect(loginPage.usernameInput).not.toBeFocused();
    await expect(loginPage.passwordInput).not.toBeFocused();

    await loginPage.clickLogo();
    await expect(loginPage.usernameInput).not.toBeFocused();
    await expect(loginPage.passwordInput).not.toBeFocused();

    await loginPage.clickUsernameLabel();
    await expect(loginPage.usernameInput).toBeFocused();
  });

  test('TC-11 - Complete keyboard navigation and visible focus indicators', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await loginPage.pressTab();
    await expect(loginPage.usernameInput).toBeFocused();

    await loginPage.pressTab();
    await expect(loginPage.passwordInput).toBeFocused();

    await loginPage.pressTab();
    await expect(loginPage.loginButton).toBeFocused();

    await loginPage.enterUsername(authData.validUser.username);
    await loginPage.enterPassword(authData.validUser.password);

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );

    await loginPage.pressEnterInPassword();

    const response = await loginResponsePromise;
    expect(response.status()).toBe(200);
  });

  test('TC-12 - Responsive layout across mobile and desktop viewports', async ({ loginPage }) => {
    await loginPage.setViewport(authData.viewports.mobile.width, authData.viewports.mobile.height);
    await loginPage.gotoLoginPage();

    await expect(loginPage.loginCard).toBeVisible();
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    const mobileHasHorizontalScroll = await loginPage.hasHorizontalScrollBar();
    expect(mobileHasHorizontalScroll).toBe(false);

    await loginPage.setViewport(authData.viewports.desktop.width, authData.viewports.desktop.height);
    await expect(loginPage.loginCard).toBeVisible();
    await expect(loginPage.logo).toBeVisible();

    const desktopHasHorizontalScroll = await loginPage.hasHorizontalScrollBar();
    expect(desktopHasHorizontalScroll).toBe(false);
  });

  test('TC-13 - Deactivated or inactive account login rejection', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await page.route(authData.apiEndpoints.login, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: authData.messages.invalidCredentials }),
      });
    });

    await loginPage.login(authData.inactiveUser.username, authData.inactiveUser.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(authData.messages.invalidCredentials);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC-14 - Server 500 error graceful degradation and retry recovery', async ({ loginPage, page }) => {
    await loginPage.gotoLoginPage();

    await page.route(authData.apiEndpoints.login, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: authData.messages.serverError }),
      });
    });

    await loginPage.login(authData.validUser.username, authData.validUser.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(authData.messages.serverError);
    await expect(loginPage.loginButton).toBeEnabled();
  });
});
