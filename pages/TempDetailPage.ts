import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TempPayload } from '../test-data/addTempData';

export class TempDetailPage extends BasePage {
  readonly pageHeading: Locator;
  readonly notFoundMessage: Locator;
  readonly leftBox: Locator;
  readonly rightBox: Locator;

  // Left Box Controls
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly cellPhoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipInput: Locator;
  readonly countySelect: Locator;

  // Right Box Controls
  readonly statusSelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly genderOtherRadio: Locator;
  readonly maritalStatusSelect: Locator;

  // Action Buttons & Feedback
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly duplicateEmailError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.notFoundMessage = page.getByText('This temp could not be found.');
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

    // Right Box
    this.statusSelect = page.locator('#status');
    this.dateOfBirthInput = page.locator('#dateOfBirth');
    this.genderMaleRadio = page.locator('input[name="gender"][value="Male"]');
    this.genderFemaleRadio = page.locator('input[name="gender"][value="Female"]');
    this.genderOtherRadio = page.locator('input[name="gender"][value="Other"]');
    this.maritalStatusSelect = page.locator('#maritalStatus');

    // Action Buttons
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.duplicateEmailError = page.getByText('That email address is already in use.');
  }

  async gotoTempDetail(id: number | string): Promise<void> {
    await this.navigate(`/temp/${id}`);
  }

  async gotoAddTemp(): Promise<void> {
    await this.navigate('/temp/new');
  }

  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clearFirstName(): Promise<void> {
    await this.firstNameInput.clear();
  }

  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
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

  async saveAndInterceptPutResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/temps') && resp.request().method() === 'PUT'
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

  async saveAndInterceptPostResponse(): Promise<{ status: number; body: any }> {
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

  async areAllFieldsDisabled(): Promise<boolean> {
    const fields = [
      this.firstNameInput,
      this.lastNameInput,
      this.cellPhoneInput,
      this.emailInput,
      this.addressInput,
      this.cityInput,
      this.stateSelect,
      this.zipInput,
      this.countySelect,
      this.statusSelect,
      this.dateOfBirthInput,
      this.genderMaleRadio,
      this.genderFemaleRadio,
      this.genderOtherRadio,
      this.maritalStatusSelect,
    ];
    for (const field of fields) {
      const disabled = await field.isDisabled();
      if (!disabled) return false;
    }
    return true;
  }

  async areAllFieldsEnabled(): Promise<boolean> {
    const fields = [
      this.firstNameInput,
      this.lastNameInput,
      this.cellPhoneInput,
      this.emailInput,
      this.addressInput,
      this.cityInput,
      this.stateSelect,
      this.zipInput,
      this.countySelect,
      this.statusSelect,
      this.dateOfBirthInput,
      this.genderMaleRadio,
      this.genderFemaleRadio,
      this.genderOtherRadio,
      this.maritalStatusSelect,
    ];
    for (const field of fields) {
      const disabled = await field.isDisabled();
      if (disabled) return false;
    }
    return true;
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

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async pressEnterKey(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async createTempViaApi(payload: TempPayload): Promise<any> {
    const response = await this.page.request.post('/api/temps', { data: payload });
    return await response.json();
  }
}
