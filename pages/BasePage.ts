import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async setViewportSize(width: number, height: number): Promise<void> {
    await this.setViewport(width, height);
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async isFieldInvalid(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => !el.checkValidity());
  }

  async isFieldValid(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => el.checkValidity());
  }

  async isFieldHtmlValid(locator: Locator): Promise<boolean> {
    return await this.isFieldValid(locator);
  }

  async getValidationMessage(locator: Locator): Promise<string> {
    return await locator.evaluate((el: HTMLInputElement) => el.validationMessage);
  }
}
