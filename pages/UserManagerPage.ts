import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class UserManagerPage extends BasePage {
  readonly addUserButton: Locator;
  readonly addUserPlusIcon: Locator;
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly primaryNav: Locator;
  readonly homeNavLink: Locator;
  readonly adminNavLink: Locator;
  readonly userManagerNavLink: Locator;
  readonly headerLogo: Locator;
  readonly logoutButton: Locator;
  readonly feedbackBanner: Locator;
  readonly userCreatedBanner: Locator;
  readonly userTable: Locator;
  readonly tableHeaderColumns: Locator;
  readonly tableRows: Locator;
  readonly noUsersFoundRow: Locator;
  readonly paginationFooter: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addUserButton = page.getByRole('button', { name: /Add User/i });
    this.addUserPlusIcon = page.getByRole('button', { name: /Add User/i }).locator('svg');
    this.pageHeading = page.getByRole('heading', { name: 'User Manager', level: 1 });
    this.searchInput = page.getByPlaceholder(/search by name/i);
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.primaryNav = page.locator('nav').first();
    this.homeNavLink = page.getByRole('link', { name: 'Home' });
    this.adminNavLink = page.getByRole('link', { name: 'Admin' });
    this.userManagerNavLink = page.getByRole('link', { name: 'User Manager' });
    this.headerLogo = page.getByAltText('CTMQ — Contractor & Talent Management');
    this.logoutButton = page.getByRole('button', { name: /log\s*out/i });
    this.feedbackBanner = page.locator('div[role="alert"], div.text-center:has-text("User saved successfully.")').first();
    this.userCreatedBanner = page.getByText('User created successfully.');
    this.userTable = page.getByRole('table');
    this.tableHeaderColumns = page.locator('thead th');
    this.tableRows = page.locator('tbody tr');
    this.noUsersFoundRow = page.getByText('No users found.');
    this.paginationFooter = page.locator('footer, div:has-text("Page ")').last();
    this.previousPageButton = page.getByRole('button', { name: 'Previous' });
    this.nextPageButton = page.getByRole('button', { name: 'Next' });
  }

  async gotoUserManager(): Promise<void> {
    await this.navigate('/admin/users');
  }

  async hoverAddUserButton(): Promise<void> {
    await this.addUserButton.hover();
  }

  async clickAddUserButton(): Promise<void> {
    await this.addUserButton.click();
  }

  async searchUser(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.searchButton.click();
  }

  async clickUserRow(index: number = 0): Promise<void> {
    await this.tableRows.nth(index).click();
  }

  getUserRowByUsername(username: string): Locator {
    return this.userTable.locator('tbody tr').filter({ hasText: username });
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async isButtonAboveHeading(): Promise<boolean> {
    const buttonBox = await this.addUserButton.boundingBox();
    const headingBox = await this.pageHeading.boundingBox();
    if (!buttonBox || !headingBox) return false;
    return buttonBox.y + buttonBox.height <= headingBox.y;
  }

  async isButtonCentered(): Promise<boolean> {
    const buttonBox = await this.addUserButton.boundingBox();
    if (!buttonBox) return false;
    const viewportSize = this.page.viewportSize();
    if (!viewportSize) return false;
    const buttonCenterX = buttonBox.x + buttonBox.width / 2;
    const viewportCenterX = viewportSize.width / 2;
    // Check if button center is roughly within 25px tolerance of page center
    return Math.abs(buttonCenterX - viewportCenterX) < 25;
  }

  async getButtonComputedStyle(property: string): Promise<string> {
    return await this.addUserButton.evaluate(
      (element, prop) => window.getComputedStyle(element).getPropertyValue(prop),
      property
    );
  }

  async hasHorizontalScrollBar(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }
}
