import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TempPayload } from '../test-data/addTempData';

export abstract class BaseTempFormPage extends BasePage {
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

  // Right Box - Status & Personal
  readonly statusSelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly genderOtherRadio: Locator;
  readonly maritalStatusSelect: Locator;

  // Common Actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
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
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
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

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
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
}
