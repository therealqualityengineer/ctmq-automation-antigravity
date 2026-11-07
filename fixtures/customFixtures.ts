import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { UserManagerPage } from '../pages/UserManagerPage';
import { AddUserPage } from '../pages/AddUserPage';
import { NavigationPage } from '../pages/NavigationPage';
import { TempPage } from '../pages/TempPage';
import { AddTempPage } from '../pages/AddTempPage';
import { TempDetailPage } from '../pages/TempDetailPage';
import { ClientPage } from '../pages/ClientPage';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { LayoutPage } from '../pages/LayoutPage';
import { AdminPage } from '../pages/AdminPage';
import { SpecialtiesPage } from '../pages/SpecialtiesPage';
import { CertificationsPage } from '../pages/CertificationsPage';
import { ShiftsPage } from '../pages/ShiftsPage';
import { OrderTypesPage } from '../pages/OrderTypesPage';
import { StatusOptionsPage } from '../pages/StatusOptionsPage';
import { UserDetailPage } from '../pages/UserDetailPage';
import { authData } from '../test-data/authData';

const COOKIE_FILE = path.resolve(__dirname, '../.auth_cookies.json');
let cachedCookies: any[] | null = null;

async function ensureAuthenticated(page: any, context: any): Promise<void> {
  if (cachedCookies && cachedCookies.length > 0) {
    await context.addCookies(cachedCookies);
  } else if (fs.existsSync(COOKIE_FILE)) {
    try {
      const stored = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
      if (Array.isArray(stored) && stored.length > 0) {
        cachedCookies = stored;
        await context.addCookies(cachedCookies);
      }
    } catch {
      // ignore and perform login
    }
  }

  if (cachedCookies && cachedCookies.length > 0) {
    if (page.url() !== 'about:blank' && !page.url().includes('/login')) {
      return;
    }
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const isLoggedIn = await Promise.race([
      page.waitForURL(/\/login/, { timeout: 2000 }).then(() => false).catch(() => false),
      page.locator('header nav, header span').first().waitFor({ state: 'visible', timeout: 2000 }).then(() => true).catch(() => false),
    ]);
    if (isLoggedIn && !page.url().includes('/login')) {
      return;
    }
    cachedCookies = null;
    if (fs.existsSync(COOKIE_FILE)) {
      try {
        fs.unlinkSync(COOKIE_FILE);
      } catch {
        // ignore
      }
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
  userManagerPage: UserManagerPage;
  authenticatedUserManagerPage: UserManagerPage;
  addUserPage: AddUserPage;
  authenticatedAddUserPage: AddUserPage;
  navigationPage: NavigationPage;
  authenticatedNavigationPage: NavigationPage;
  tempPage: TempPage;
  authenticatedTempPage: TempPage;
  addTempPage: AddTempPage;
  authenticatedAddTempPage: AddTempPage;
  tempDetailPage: TempDetailPage;
  authenticatedTempDetailPage: TempDetailPage;
  clientPage: ClientPage;
  authenticatedClientPage: ClientPage;
  clientDetailPage: ClientDetailPage;
  authenticatedClientDetailPage: ClientDetailPage;
  layoutPage: LayoutPage;
  authenticatedLayoutPage: LayoutPage;
  adminPage: AdminPage;
  authenticatedAdminPage: AdminPage;
  specialtiesPage: SpecialtiesPage;
  authenticatedSpecialtiesPage: SpecialtiesPage;
  certificationsPage: CertificationsPage;
  authenticatedCertificationsPage: CertificationsPage;
  shiftsPage: ShiftsPage;
  authenticatedShiftsPage: ShiftsPage;
  orderTypesPage: OrderTypesPage;
  authenticatedOrderTypesPage: OrderTypesPage;
  statusOptionsPage: StatusOptionsPage;
  authenticatedStatusOptionsPage: StatusOptionsPage;
  userDetailPage: UserDetailPage;
  authenticatedUserDetailPage: UserDetailPage;
};

export const test = baseTest.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
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
  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },
  authenticatedNavigationPage: async ({ page, context }, use) => {
    const navigationPage = new NavigationPage(page);
    await ensureAuthenticated(page, context);
    await navigationPage.gotoHome();
    await use(navigationPage);
  },
  tempPage: async ({ page }, use) => {
    const tempPage = new TempPage(page);
    await use(tempPage);
  },
  authenticatedTempPage: async ({ page, context }, use) => {
    const tempPage = new TempPage(page);
    await ensureAuthenticated(page, context);
    await tempPage.gotoTemp();
    await page.waitForURL(/.*\/temp.*/);
    await use(tempPage);
  },
  addTempPage: async ({ page }, use) => {
    const addTempPage = new AddTempPage(page);
    await use(addTempPage);
  },
  authenticatedAddTempPage: async ({ page, context }, use) => {
    const addTempPage = new AddTempPage(page);
    await ensureAuthenticated(page, context);
    await addTempPage.gotoAddTemp();
    if (page.url().includes('/login')) {
      cachedCookies = null;
      if (fs.existsSync(COOKIE_FILE)) {
        try {
          fs.unlinkSync(COOKIE_FILE);
        } catch {
          // ignore unlink error
        }
      }
      await ensureAuthenticated(page, context);
      await addTempPage.gotoAddTemp();
    }
    await page.waitForURL(/.*\/temp\/new.*/);
    await use(addTempPage);
  },
  tempDetailPage: async ({ page }, use) => {
    const tempDetailPage = new TempDetailPage(page);
    await use(tempDetailPage);
  },
  authenticatedTempDetailPage: async ({ page, context }, use) => {
    const tempDetailPage = new TempDetailPage(page);
    await ensureAuthenticated(page, context);
    await use(tempDetailPage);
  },
  clientPage: async ({ page }, use) => {
    const clientPage = new ClientPage(page);
    await use(clientPage);
  },
  authenticatedClientPage: async ({ page, context }, use) => {
    const clientPage = new ClientPage(page);
    await ensureAuthenticated(page, context);
    await clientPage.gotoClient();
    await page.waitForURL(/.*\/client.*/);
    await use(clientPage);
  },
  clientDetailPage: async ({ page }, use) => {
    const clientDetailPage = new ClientDetailPage(page);
    await use(clientDetailPage);
  },
  authenticatedClientDetailPage: async ({ page, context }, use) => {
    const clientDetailPage = new ClientDetailPage(page);
    await ensureAuthenticated(page, context);
    await use(clientDetailPage);
  },
  layoutPage: async ({ page }, use) => {
    const layoutPage = new LayoutPage(page);
    await use(layoutPage);
  },
  authenticatedLayoutPage: async ({ page, context }, use) => {
    const layoutPage = new LayoutPage(page);
    await ensureAuthenticated(page, context);
    await layoutPage.gotoHome();
    await use(layoutPage);
  },
  adminPage: async ({ page }, use) => {
    const adminPage = new AdminPage(page);
    await use(adminPage);
  },
  authenticatedAdminPage: async ({ page, context }, use) => {
    const adminPage = new AdminPage(page);
    await ensureAuthenticated(page, context);
    await adminPage.gotoAdmin();
    await page.waitForURL(/.*\/admin.*/);
    await use(adminPage);
  },
  specialtiesPage: async ({ page }, use) => {
    const specialtiesPage = new SpecialtiesPage(page);
    await use(specialtiesPage);
  },
  authenticatedSpecialtiesPage: async ({ page, context }, use) => {
    const specialtiesPage = new SpecialtiesPage(page);
    await ensureAuthenticated(page, context);
    await specialtiesPage.gotoSpecialties();
    await page.waitForURL(/.*\/admin\/specialties.*/);
    await use(specialtiesPage);
  },
  certificationsPage: async ({ page }, use) => {
    const certificationsPage = new CertificationsPage(page);
    await use(certificationsPage);
  },
  authenticatedCertificationsPage: async ({ page, context }, use) => {
    const certificationsPage = new CertificationsPage(page);
    await ensureAuthenticated(page, context);
    await certificationsPage.gotoCertifications();
    await page.waitForURL(/.*\/admin\/certifications.*/);
    await use(certificationsPage);
  },
  shiftsPage: async ({ page }, use) => {
    const shiftsPage = new ShiftsPage(page);
    await use(shiftsPage);
  },
  authenticatedShiftsPage: async ({ page, context }, use) => {
    const shiftsPage = new ShiftsPage(page);
    await ensureAuthenticated(page, context);
    await shiftsPage.gotoShifts();
    await page.waitForURL(/.*\/admin\/shifts.*/);
    await use(shiftsPage);
  },
  orderTypesPage: async ({ page }, use) => {
    const orderTypesPage = new OrderTypesPage(page);
    await use(orderTypesPage);
  },
  authenticatedOrderTypesPage: async ({ page, context }, use) => {
    const orderTypesPage = new OrderTypesPage(page);
    await ensureAuthenticated(page, context);
    await orderTypesPage.gotoOrderTypes();
    await page.waitForURL(/.*\/admin\/order-types.*/);
    await use(orderTypesPage);
  },
  statusOptionsPage: async ({ page }, use) => {
    const statusOptionsPage = new StatusOptionsPage(page);
    await use(statusOptionsPage);
  },
  authenticatedStatusOptionsPage: async ({ page, context }, use) => {
    const statusOptionsPage = new StatusOptionsPage(page);
    await ensureAuthenticated(page, context);
    await statusOptionsPage.gotoStatusOptions();
    await page.waitForURL(/.*\/admin\/status-options.*/);
    await use(statusOptionsPage);
  },
  userDetailPage: async ({ page }, use) => {
    const userDetailPage = new UserDetailPage(page);
    await use(userDetailPage);
  },
  authenticatedUserDetailPage: async ({ page, context }, use) => {
    const userDetailPage = new UserDetailPage(page);
    await ensureAuthenticated(page, context);
    await use(userDetailPage);
  },
});

export { expect };
