import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TempPayload } from '../test-data/addTempData';

export class AddTempPage extends BasePage {
  readonly pageHeading: Locator;
  readonly leftBox: Locator;
  readonly rightBox: Locator;

  // Left Box - Contact & Address
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly cellPhoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipInput: Locator;
  readonly countySelect: Locator;
  readonly noCountyFoundMessage: Locator;

  // Right Box - Status & Personal
  readonly statusSelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly genderOtherRadio: Locator;
  readonly maritalStatusSelect: Locator;

  // Actions & Alerts
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successBanner: Locator;
  readonly successStatus: Locator;
  readonly emailDuplicateError: Locator;
  readonly serverErrorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Add Temp', level: 1 });
    this.leftBox = page.locator('form > div > div').first();
    this.rightBox = page.locator('form > div > div').nth(1);

    // Left Box
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.cellPhoneInput = page.locator('#cellPhone');
    this.emailInput = page.locator('#email');
    this.addressInput = page.locator('#address');
    this.cityInput = page.locator('#city');
    this.stateSelect = page.locator('#state');
    this.zipInput = page.locator('#zip');
    this.countySelect = page.locator('#county');
    this.noCountyFoundMessage = page.getByText('No county found for this ZIP — please check the ZIP.');

    // Right Box
    this.statusSelect = page.locator('#status');
    this.dateOfBirthInput = page.locator('#dateOfBirth');
    this.genderMaleRadio = page.locator('input[name="gender"][value="Male"]');
    this.genderFemaleRadio = page.locator('input[name="gender"][value="Female"]');
    this.genderOtherRadio = page.locator('input[name="gender"][value="Other"]');
    this.maritalStatusSelect = page.locator('#maritalStatus');

    // Action Buttons & Alerts
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.successBanner = page.getByText('Temp created successfully.');
    this.successStatus = page.locator('p[role="status"]').filter({ hasText: 'Temp created successfully.' });
    this.emailDuplicateError = page.locator('#email ~ p, p.text-red-700').filter({ hasText: 'That email address is already in use.' });
    this.serverErrorBanner = page.locator('p.text-red-700, [role="alert"]').filter({ hasText: /Internal Server Error|failed|error/i });
  }

  async gotoAddTemp(): Promise<void> {
    await this.navigate('/temp/new');
  }

  async fillForm(data: Partial<TempPayload>): Promise<void> {
    if (data.firstName !== undefined) await this.firstNameInput.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastNameInput.fill(data.lastName);
    if (data.cellPhone !== undefined) await this.cellPhoneInput.fill(data.cellPhone);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.address !== undefined) await this.addressInput.fill(data.address);
    if (data.city !== undefined) await this.cityInput.fill(data.city);
    if (data.state !== undefined) await this.stateSelect.selectOption(data.state);
    if (data.zip !== undefined) {
      await this.zipInput.fill(data.zip);
      // Wait for county lookup debounce / effect
      await this.page.waitForTimeout(300);
    }
    if (data.county !== undefined && data.county !== '') {
      await this.countySelect.selectOption(data.county);
    }
    if (data.status !== undefined) await this.statusSelect.selectOption(data.status);
    if (data.dateOfBirth !== undefined) await this.dateOfBirthInput.fill(data.dateOfBirth);
    if (data.gender) {
      if (data.gender === 'Male') await this.genderMaleRadio.check();
      else if (data.gender === 'Female') await this.genderFemaleRadio.check();
      else if (data.gender === 'Other') await this.genderOtherRadio.check();
    }
    if (data.maritalStatus !== undefined) await this.maritalStatusSelect.selectOption(data.maritalStatus);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
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

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async fillZip(zip: string): Promise<void> {
    await this.zipInput.fill(zip);
    await this.page.waitForTimeout(300);
  }

  async clearZip(): Promise<void> {
    await this.zipInput.clear();
    await this.page.waitForTimeout(300);
  }

  async getSelectedCounty(): Promise<string> {
    return await this.countySelect.inputValue();
  }

  async isTwoColumnLayout(): Promise<boolean> {
    const leftBox = await this.leftBox.boundingBox();
    const rightBox = await this.rightBox.boundingBox();
    if (!leftBox || !rightBox) return false;
    return leftBox.y === rightBox.y && leftBox.x < rightBox.x;
  }

  async isStackedLayout(): Promise<boolean> {
    const leftBox = await this.leftBox.boundingBox();
    const rightBox = await this.rightBox.boundingBox();
    if (!leftBox || !rightBox) return false;
    return leftBox.y + leftBox.height <= rightBox.y;
  }

  async isFieldInvalid(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => !el.checkValidity());
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

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async mockApiResponse(urlPattern: string, status: number, body: object): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      if (route.request().method() === 'POST') {
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
}
