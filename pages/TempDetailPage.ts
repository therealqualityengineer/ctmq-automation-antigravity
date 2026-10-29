import { Page, Locator } from '@playwright/test';
import { BaseTempFormPage } from './BaseTempFormPage';
import { TempPayload } from '../test-data/addTempData';

export class TempDetailPage extends BaseTempFormPage {
  readonly pageHeading: Locator;
  readonly notFoundMessage: Locator;
  readonly editButton: Locator;
  readonly duplicateEmailError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.notFoundMessage = page.getByText('This temp could not be found.');
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
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

  async clearFirstName(): Promise<void> {
    await this.firstNameInput.clear();
  }

  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
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

  async pressEnterKey(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async createTempViaApi(payload: TempPayload): Promise<any> {
    const response = await this.page.request.post('/api/temps', { data: payload });
    return await response.json();
  }
}
