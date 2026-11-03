import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;
  readonly userManagerSubTab: Locator;
  readonly contentArea: Locator;
  readonly headerLogo: Locator;
  readonly logoutButton: Locator;
  readonly userIdentity: Locator;

  constructor(page: Page) {
    super(page);
    this.primaryNav = page.locator('nav').first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.adminSubNav = page.locator('div.bg-slate-100').first();
    this.userManagerSubTab = page.getByRole('link', { name: 'User Manager', exact: true });
    this.contentArea = page.locator('main').first();
    this.headerLogo = page.getByAltText('CTMQ — Contractor & Talent Management');
    this.logoutButton = page.getByRole('button', { name: /Logout/i });
    this.userIdentity = page.locator('header span').first();
  }

  async gotoAdmin(): Promise<void> {
    await this.navigate('/admin');
  }

  async gotoAdminUsers(): Promise<void> {
    await this.navigate('/admin/users');
  }

  async gotoAddUser(): Promise<void> {
    await this.navigate('/admin/users/new');
  }

  async clickAdminLink(): Promise<void> {
    await this.adminLink.click();
  }

  async clickUserManagerSubTab(): Promise<void> {
    await this.userManagerSubTab.click();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isUserManagerSubTabActive(): Promise<boolean> {
    const ariaCurrent = await this.userManagerSubTab.getAttribute('aria-current');
    const className = await this.userManagerSubTab.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('bg-blue-900') : false);
  }

  async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
  }
}

