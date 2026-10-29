import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  readonly navContainer: Locator;
  readonly homeLink: Locator;
  readonly tempLink: Locator;
  readonly adminLink: Locator;
  readonly headerLogo: Locator;
  readonly logoutButton: Locator;
  readonly userIdentity: Locator;
  readonly pageHeading: Locator;
  readonly leftSidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.navContainer = page.locator('div.flex.gap-2.px-4, nav').first();
    this.homeLink = page.getByRole('link', { name: 'Home', exact: true });
    this.tempLink = page.getByRole('link', { name: 'Temp', exact: true });
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.headerLogo = page.getByAltText('CTMQ — Contractor & Talent Management');
    this.logoutButton = page.getByRole('button', { name: /Logout/i });
    this.userIdentity = page.locator('header span').first();
    this.pageHeading = page.locator('h1').first();
    this.leftSidebar = page.locator('aside, [role="navigation"].sidebar');
  }

  async gotoHome(): Promise<void> {
    await this.navigate('/');
  }

  async gotoTemp(): Promise<void> {
    await this.navigate('/temp');
  }

  async gotoAdmin(): Promise<void> {
    await this.navigate('/admin/users');
  }

  async clickHome(): Promise<void> {
    await this.homeLink.click();
  }

  async clickTemp(): Promise<void> {
    await this.tempLink.click();
  }

  async clickAdmin(): Promise<void> {
    await this.adminLink.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  async getPrimaryTabNames(): Promise<string[]> {
    const links = this.navContainer.locator('a');
    const count = await links.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).innerText();
      names.push(text.trim());
    }
    return names;
  }

  async isTabActive(tabLocator: Locator): Promise<boolean> {
    const ariaCurrent = await tabLocator.getAttribute('aria-current');
    const className = await tabLocator.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
  }
}
