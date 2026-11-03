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

  // CTMQ-45: General Settings Card Locators
  readonly generalSettingsCard: Locator;
  readonly generalSettingsHeader: Locator;
  readonly generalSubsectionHeading: Locator;
  readonly generalSettingItems: Locator;
  readonly generalSettingLinks: Locator;
  readonly certificationsLink: Locator;
  readonly specialtiesLink: Locator;
  readonly shiftsLink: Locator;
  readonly orderTypesLink: Locator;
  readonly statusOptionsLink: Locator;

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

    // General Settings Card elements
    this.generalSettingsCard = page.getByRole('region', { name: 'General Settings' });
    this.generalSettingsHeader = this.generalSettingsCard.locator('div.border-b').first();
    this.generalSubsectionHeading = this.generalSettingsCard.getByRole('heading', { name: 'General', exact: true });
    this.generalSettingItems = this.generalSettingsCard.locator('ul > li');
    this.generalSettingLinks = this.generalSettingsCard.locator('ul > li > a');
    this.certificationsLink = this.generalSettingsCard.getByRole('link', { name: 'Certifications', exact: true });
    this.specialtiesLink = this.generalSettingsCard.getByRole('link', { name: 'Specialties', exact: true });
    this.shiftsLink = this.generalSettingsCard.getByRole('link', { name: 'Shifts', exact: true });
    this.orderTypesLink = this.generalSettingsCard.getByRole('link', { name: 'Order Types', exact: true });
    this.statusOptionsLink = this.generalSettingsCard.getByRole('link', { name: 'Status Options', exact: true });
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

  // CTMQ-45: General Settings Helper Methods
  getGeneralSettingLink(name: string): Locator {
    return this.generalSettingsCard.getByRole('link', { name, exact: true });
  }

  async clickGeneralSettingLink(name: string): Promise<void> {
    await this.getGeneralSettingLink(name).click();
  }

  async getGeneralSettingItemTexts(): Promise<string[]> {
    return await this.generalSettingLinks.allInnerTexts();
  }

  async getGeneralSettingsCardBoundingBox() {
    return await this.generalSettingsCard.boundingBox();
  }

  async isGeneralSettingsLeftAligned(): Promise<boolean> {
    const cardBox = await this.generalSettingsCard.boundingBox();
    const mainBox = await this.contentArea.boundingBox();
    if (!cardBox || !mainBox) return false;
    // The left margin of the card relative to the main container should be aligned on the left
    return cardBox.x - mainBox.x < 100;
  }

  async hoverGeneralSettingLink(name: string): Promise<void> {
    await this.getGeneralSettingLink(name).hover();
  }

  async getLinkComputedStyle(name: string, property: string): Promise<string> {
    const link = this.getGeneralSettingLink(name);
    return await link.evaluate((el, prop) => window.getComputedStyle(el).getPropertyValue(prop), property);
  }
}

