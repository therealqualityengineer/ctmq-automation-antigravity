import { test as baseTest, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TodoPage } from '../pages/TodoPage';
import { UserManagerPage } from '../pages/UserManagerPage';
import { authData } from '../test-data/authData';

let cachedCookies: any[] | null = null;

type TestFixtures = {
  loginPage: LoginPage;
  todoPage: TodoPage;
  userManagerPage: UserManagerPage;
  authenticatedUserManagerPage: UserManagerPage;
};

export const test = baseTest.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },
  userManagerPage: async ({ page }, use) => {
    const userManagerPage = new UserManagerPage(page);
    await use(userManagerPage);
  },
  authenticatedUserManagerPage: async ({ page, context }, use) => {
    const userManagerPage = new UserManagerPage(page);

    if (cachedCookies && cachedCookies.length > 0) {
      await context.addCookies(cachedCookies);
      await userManagerPage.gotoUserManager();
    } else {
      const loginPage = new LoginPage(page);
      await loginPage.gotoLoginPage();

      const loginResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      await loginPage.login(authData.validUser.username, authData.validUser.password);
      const response = await loginResponsePromise;
      expect(response.status()).toBe(200);

      await page.waitForURL(/\/(?!login).*/);
      cachedCookies = await context.cookies();
      await userManagerPage.gotoUserManager();
    }

    await page.waitForURL(/.*\/admin\/users.*/);
    await use(userManagerPage);
  },
});

export { expect };
