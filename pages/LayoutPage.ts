import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LayoutPage extends BasePage {
  readonly header: Locator;
  readonly headerLogo: Locator;
  readonly navContainer: Locator;
  readonly homeTab: Locator;
  readonly tempTab: Locator;
  readonly adminTab: Locator;
  readonly userInfo: Locator;
  readonly logoutButton: Locator;
  readonly adminSubmenu: Locator;
  readonly userManagerSubTab: Locator;
  readonly mainContent: Locator;
  readonly tableContainer: Locator;
  readonly dataTable: Locator;
  readonly tableRows: Locator;
  readonly formContainer: Locator;
  readonly loginCard: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header');
    this.headerLogo = page.locator('header img[alt="CTMQ — Contractor & Talent Management"]').first();
    this.navContainer = page.locator('nav').first();
    this.homeTab = page.getByRole('link', { name: 'Home', exact: true });
    this.tempTab = page.getByRole('link', { name: 'Temp', exact: true });
    this.adminTab = page.getByRole('link', { name: 'Admin', exact: true });
    this.userInfo = page.locator('header span').first();
    this.logoutButton = page.getByRole('button', { name: /Logout/i });
    this.adminSubmenu = page.locator('div.bg-slate-100').first();
    this.userManagerSubTab = page.getByRole('link', { name: 'User Manager', exact: true });
    this.mainContent = page.locator('main').first();
    this.tableContainer = page.locator('div.overflow-x-auto').first();
    this.dataTable = page.locator('table').first();
    this.tableRows = page.locator('table tbody tr');
    this.formContainer = page.locator('form').first();
    this.loginCard = page.locator('div.rounded-xl.border, form').first();
  }

  async gotoHome(): Promise<void> {
    await this.navigate('/');
  }

  async gotoTemp(): Promise<void> {
    await this.navigate('/temp');
  }

  async gotoAddTemp(): Promise<void> {
    await this.navigate('/temp/new');
  }

  async gotoAdminUsers(): Promise<void> {
    await this.navigate('/admin/users');
  }

  async gotoAddUser(): Promise<void> {
    await this.navigate('/admin/users/new');
  }

  async gotoLogin(): Promise<void> {
    await this.navigate('/login');
  }

  async clickHome(): Promise<void> {
    await this.homeTab.click();
  }

  async clickTemp(): Promise<void> {
    await this.tempTab.click();
  }

  async clickAdmin(): Promise<void> {
    await this.adminTab.click();
  }

  async clickUserManagerSubTab(): Promise<void> {
    await this.userManagerSubTab.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  async getMainWidth(): Promise<number> {
    const box = await this.mainContent.boundingBox();
    return box ? box.width : 0;
  }

  async getFormWidth(): Promise<number> {
    const box = await this.formContainer.boundingBox();
    return box ? box.width : 0;
  }

  async getLogoBoundingBox() {
    return await this.headerLogo.boundingBox();
  }

  async getNavBoundingBox() {
    return await this.navContainer.boundingBox();
  }

  async getUserInfoBoundingBox() {
    return await this.userInfo.boundingBox();
  }

  async getLogoutBoundingBox() {
    return await this.logoutButton.boundingBox();
  }

  async hasPageHorizontalOverflow(): Promise<boolean> {
    return await this.page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
  }

  async getTableContainerScrollWidth(): Promise<number> {
    return await this.tableContainer.evaluate((el) => el.scrollWidth);
  }

  async getTableContainerClientWidth(): Promise<number> {
    return await this.tableContainer.evaluate((el) => el.clientWidth);
  }

  async waitForTableDataLoaded(): Promise<void> {
    await this.page.locator('tbody tr:not(:has-text("Loading"))').first().waitFor({ state: 'visible' });
  }

  async isTabActive(tab: Locator): Promise<boolean> {
    const aria = await tab.getAttribute('aria-current');
    return aria === 'page';
  }

  async isSubmenuActive(subTab: Locator): Promise<boolean> {
    const aria = await subTab.getAttribute('aria-current');
    return aria === 'page';
  }
}
