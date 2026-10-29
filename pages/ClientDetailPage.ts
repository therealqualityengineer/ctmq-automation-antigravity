import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ClientPayload } from '../test-data/clientData';

export class ClientDetailPage extends BasePage {
  readonly pageHeading: Locator;
  readonly leftBox: Locator;
  readonly rightBox: Locator;

  // Left Box Form Fields
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipInput: Locator;
  readonly countySelect: Locator;

  // Right Box Form Fields
  readonly statusSelect: Locator;

  // Actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly editButton: Locator;

  // Feedback & Alerts
  readonly createSuccessBanner: Locator;
  readonly saveSuccessBanner: Locator;
  readonly serverErrorBanner: Locator;
  readonly noCountyFoundMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.leftBox = page.locator('form > div > div').first();
    this.rightBox = page.locator('form > div > div').nth(1);

    // Left Panel
    this.fullNameInput = page.locator('#fullName');
    this.emailInput = page.locator('#email');
    this.addressInput = page.locator('#address');
    this.cityInput = page.locator('#city');
    this.stateSelect = page.locator('#state');
    this.zipInput = page.locator('#zip');
    this.countySelect = page.locator('#county');

    // Right Panel
    this.statusSelect = page.locator('#status');

    // Actions
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });

    // Feedback
    this.createSuccessBanner = page.locator('p[role="status"]').filter({ hasText: 'Client created successfully.' });
    this.saveSuccessBanner = page.locator('p[role="status"]').filter({ hasText: 'Client saved successfully.' });
    this.serverErrorBanner = page.locator('p.text-red-700, [role="alert"]').filter({ hasText: /Internal Server Error|failed|error/i });
    this.noCountyFoundMessage = page.getByText('No county found for this ZIP — please check the ZIP.');
  }

  async gotoAddClient(): Promise<void> {
    await this.navigate('/client/new');
  }

  async gotoClientDetail(id: number | string): Promise<void> {
    await this.navigate(`/client/${id}`);
  }

  async fillForm(data: Partial<ClientPayload>): Promise<void> {
    if (data.fullName !== undefined) await this.fullNameInput.fill(data.fullName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.address !== undefined) await this.addressInput.fill(data.address);
    if (data.city !== undefined) await this.cityInput.fill(data.city);
    if (data.state !== undefined) await this.stateSelect.selectOption(data.state);
    if (data.zip !== undefined) {
      await this.zipInput.fill(data.zip);
      await this.page.waitForTimeout(300);
    }
    if (data.county !== undefined && data.county !== '') {
      await this.countySelect.selectOption(data.county);
    }
    if (data.status !== undefined) await this.statusSelect.selectOption(data.status);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  async fillZip(zip: string): Promise<void> {
    await this.zipInput.fill(zip);
    await this.page.waitForTimeout(300);
  }

  async clearZip(): Promise<void> {
    await this.zipInput.clear();
    await this.page.waitForTimeout(300);
  }

  async isTwoColumnLayout(): Promise<boolean> {
    const left = await this.leftBox.boundingBox();
    const right = await this.rightBox.boundingBox();
    if (!left || !right) return false;
    return left.y === right.y && left.x < right.x;
  }

  async areAllFieldsDisabled(): Promise<boolean> {
    const fields = [
      this.fullNameInput,
      this.emailInput,
      this.addressInput,
      this.cityInput,
      this.stateSelect,
      this.zipInput,
      this.countySelect,
      this.statusSelect,
    ];
    for (const field of fields) {
      const disabled = await field.isDisabled();
      if (!disabled) return false;
    }
    return true;
  }

  async areAllFieldsEnabled(): Promise<boolean> {
    const fields = [
      this.fullNameInput,
      this.emailInput,
      this.addressInput,
      this.cityInput,
      this.stateSelect,
      this.zipInput,
      this.countySelect,
      this.statusSelect,
    ];
    for (const field of fields) {
      const disabled = await field.isDisabled();
      if (disabled) return false;
    }
    return true;
  }

  async saveAndInterceptPostResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/clients') && resp.request().method() === 'POST'
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

  async saveAndInterceptPutResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/clients') && resp.request().method() === 'PUT'
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

  async getStateOptionValues(): Promise<string[]> {
    await this.stateSelect.locator('option[value="AL"]').waitFor({ state: 'attached' });
    return await this.stateSelect.evaluate((select: HTMLSelectElement) =>
      Array.from(select.options)
        .map((opt) => opt.value)
        .filter((val) => Boolean(val))
    );
  }

  async getCountyOptionTexts(): Promise<string[]> {
    const options = this.countySelect.locator('option');
    const count = await options.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).innerText();
      texts.push(text.trim());
    }
    return texts;
  }

  async mockApiResponse(urlPattern: string, status: number, body: object, method: string = 'POST'): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      if (route.request().method() === method) {
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
}

