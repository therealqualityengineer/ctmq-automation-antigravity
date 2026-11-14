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

  async getSelectOptionValues(selectLocator: Locator): Promise<string[]> {
    return await selectLocator.evaluate((select: HTMLSelectElement) =>
      Array.from(select.options)
        .map((opt) => opt.value)
        .filter((val) => Boolean(val))
    );
  }

  async getSelectOptionTexts(selectLocator: Locator): Promise<string[]> {
    return await selectLocator.evaluate((select: HTMLSelectElement) =>
      Array.from(select.options).map((opt) => opt.text.trim())
    );
  }

  async areAllFieldsDisabled(locators: Locator[]): Promise<boolean> {
    for (const locator of locators) {
      const disabled = await locator.isDisabled();
      if (!disabled) return false;
    }
    return true;
  }

  async areAllFieldsEnabled(locators: Locator[]): Promise<boolean> {
    for (const locator of locators) {
      const disabled = await locator.isDisabled();
      if (disabled) return false;
    }
    return true;
  }

  async mockApiResponse(
    urlPattern: string | RegExp,
    status: number,
    body: object,
    method?: string
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      if (!method || route.request().method() === method) {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      } else {
        route.continue();
      }
    });
  }

  async clearApiMocks(): Promise<void> {
    await this.page.unrouteAll();
  }

  async getElementTagName(locator: Locator): Promise<string> {
    return await locator.evaluate((el: HTMLElement) => el.tagName);
  }

  async getElementClassName(locator: Locator): Promise<string> {
    return (await locator.getAttribute('class')) || '';
  }

  async getElementComputedStyles(locator: Locator, properties: string[]): Promise<Record<string, string>> {
    return await locator.evaluate((el: HTMLElement, props: string[]) => {
      const style = window.getComputedStyle(el);
      const res: Record<string, string> = {};
      for (const prop of props) {
        res[prop] = style.getPropertyValue(prop);
      }
      return res;
    }, properties);
  }

  async getElementBoundingBox(locator: Locator): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await locator.boundingBox();
  }

  async getHeadingCount(level: number = 1): Promise<number> {
    return await this.page.locator(`h${level}`).count();
  }
}
