import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { TodoPage } from '../pages/TodoPage';
import { UserManagerPage } from '../pages/UserManagerPage';
import { AddUserPage } from '../pages/AddUserPage';
import { authData } from '../test-data/authData';

const COOKIE_FILE = path.resolve(__dirname, '../.auth_cookies.json');
let cachedCookies: any[] | null = null;

async function ensureAuthenticated(page: any, context: any): Promise<void> {
  if (cachedCookies && cachedCookies.length > 0) {
    await context.addCookies(cachedCookies);
    return;
  }

  if (fs.existsSync(COOKIE_FILE)) {
    try {
      const stored = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
      if (Array.isArray(stored) && stored.length > 0) {
        cachedCookies = stored;
        await context.addCookies(cachedCookies);
        return;
      }
    } catch {
      // ignore and perform login
    }
  }

  const loginPage = new LoginPage(page);
  await loginPage.gotoLoginPage();

  for (let attempt = 0; attempt < 3; attempt++) {
    const loginResponsePromise = page.waitForResponse(
      (response: any) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await loginPage.login(authData.validUser.username, authData.validUser.password);
    const response = await loginResponsePromise;

    if (response.status() === 200) {
      await page.waitForURL(/\/(?!login).*/);
      cachedCookies = await context.cookies();
      try {
        fs.writeFileSync(COOKIE_FILE, JSON.stringify(cachedCookies), 'utf-8');
      } catch {
        // file write non-blocking
      }
      return;
    }

    if (response.status() === 429) {
      await page.waitForTimeout(1000 * (attempt + 1));
    } else {
      expect(response.status()).toBe(200);
    }
  }
}

type TestFixtures = {
  loginPage: LoginPage;
  todoPage: TodoPage;
  userManagerPage: UserManagerPage;
  authenticatedUserManagerPage: UserManagerPage;
  addUserPage: AddUserPage;
  authenticatedAddUserPage: AddUserPage;
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
  addUserPage: async ({ page }, use) => {
    const addUserPage = new AddUserPage(page);
    await use(addUserPage);
  },
  authenticatedUserManagerPage: async ({ page, context }, use) => {
    const userManagerPage = new UserManagerPage(page);
    await ensureAuthenticated(page, context);
    await userManagerPage.gotoUserManager();
    await page.waitForURL(/.*\/admin\/users.*/);
    await use(userManagerPage);
  },
  authenticatedAddUserPage: async ({ page, context }, use) => {
    const addUserPage = new AddUserPage(page);
    await ensureAuthenticated(page, context);
    await addUserPage.gotoAddUser();
    await page.waitForURL(/.*\/admin\/users\/new.*/);
    await use(addUserPage);
  },
});

export { expect };
