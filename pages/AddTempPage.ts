import { Page, Locator } from '@playwright/test';
import { BaseTempFormPage } from './BaseTempFormPage';

export class AddTempPage extends BaseTempFormPage {
  readonly pageHeading: Locator;
  readonly noCountyFoundMessage: Locator;
  readonly successBanner: Locator;
  readonly successStatus: Locator;
  readonly emailDuplicateError: Locator;
  readonly serverErrorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Add Temp', level: 1 });
    this.noCountyFoundMessage = page.getByText('No county found for this ZIP — please check the ZIP.');
    this.successBanner = page.getByText('Temp created successfully.');
    this.successStatus = page.locator('p[role="status"]').filter({ hasText: 'Temp created successfully.' });
    this.emailDuplicateError = page.locator('#email ~ p, p.text-red-700').filter({ hasText: 'That email address is already in use.' });
    this.serverErrorBanner = page.locator('p.text-red-700, [role="alert"]').filter({ hasText: /Internal Server Error|failed|error/i });
  }

  async gotoAddTemp(): Promise<void> {
    await this.navigate('/temp/new');
  }

  async saveAndInterceptApiResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/temps') && resp.request().method() === 'POST'
    );
    await this.saveButton.click();
    const response = await responsePromise;
    let body = {};
    try {
      body = await response.json();
    } catch {
      // response body not json
    }
    return { status: response.status(), body };
  }

  async pressEnterInField(locator: Locator): Promise<void> {
    await locator.focus();
    await this.page.keyboard.press('Enter');
  }

  async getEmailErrorText(): Promise<string> {
    return (await this.emailDuplicateError.innerText()).trim();
  }

  async getInputValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  async doubleClickSave(): Promise<void> {
    await this.saveButton.dblclick();
  }
}
