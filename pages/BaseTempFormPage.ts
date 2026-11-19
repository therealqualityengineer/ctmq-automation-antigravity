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
  readonly certificationLabel: Locator;
  readonly certificationSelect: Locator;
  readonly specialtyLabel: Locator;
  readonly specialtySelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly genderOtherRadio: Locator;
  readonly maritalStatusSelect: Locator;

  // Common Actions & Feedback
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly feedbackErrorBanner: Locator;
  readonly feedbackSuccessBanner: Locator;

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
    this.certificationLabel = page.locator('label[for="certification"]');
    this.certificationSelect = page.locator('#certification');
    this.specialtyLabel = page.locator('label[for="specialty"]');
    this.specialtySelect = page.locator('#specialty');
    this.dateOfBirthInput = page.locator('#dateOfBirth');
    this.genderMaleRadio = page.locator('input[name="gender"][value="Male"]');
    this.genderFemaleRadio = page.locator('input[name="gender"][value="Female"]');
    this.genderOtherRadio = page.locator('input[name="gender"][value="Other"]');
    this.maritalStatusSelect = page.locator('#maritalStatus');

    // Action Buttons & Feedback
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.feedbackErrorBanner = page.locator('[role="alert"]');
    this.feedbackSuccessBanner = page.locator('[role="status"]');
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
    if (data.certification !== undefined) {
      await this.selectCertification(data.certification);
      await this.page.waitForTimeout(200);
    }
    if (data.specialty !== undefined) {
      await this.selectSpecialty(data.specialty);
    }
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

  async getSelectedCountyText(): Promise<string> {
    return await this.countySelect.evaluate((select: HTMLSelectElement) => {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption ? selectedOption.text.trim() : '';
    });
  }

  async isCountyFieldEditable(): Promise<boolean> {
    const tagName = await this.countySelect.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === 'input') {
      const type = await this.countySelect.getAttribute('type');
      const isReadOnly = await this.countySelect.evaluate((el: any) => el.readOnly || el.disabled);
      return type !== 'hidden' && !isReadOnly;
    }
    return false;
  }

  async getStateOptionValues(): Promise<string[]> {
    await this.stateSelect.locator('option[value="AL"]').waitFor({ state: 'attached' });
    return await this.getSelectOptionValues(this.stateSelect);
  }

  async getCountyOptionTexts(): Promise<string[]> {
    return await this.getSelectOptionTexts(this.countySelect);
  }

  async selectCertification(valueOrLabel: string): Promise<void> {
    if (valueOrLabel === '') {
      await this.certificationSelect.selectOption('');
    } else {
      await this.certificationSelect.selectOption({ label: valueOrLabel });
    }
  }

  async selectSpecialty(valueOrLabel: string): Promise<void> {
    if (valueOrLabel === '') {
      await this.specialtySelect.selectOption('');
    } else {
      await this.specialtySelect.selectOption({ label: valueOrLabel });
    }
  }

  async getCertificationOptionTexts(): Promise<string[]> {
    await this.certificationSelect.locator('option').nth(1).waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    return await this.getSelectOptionTexts(this.certificationSelect);
  }

  async getSpecialtyOptionTexts(): Promise<string[]> {
    return await this.getSelectOptionTexts(this.specialtySelect);
  }

  async getSelectedCertification(): Promise<string> {
    return await this.certificationSelect.inputValue();
  }

  async getSelectedSpecialty(): Promise<string> {
    return await this.specialtySelect.inputValue();
  }

  async getStatusOptionTexts(): Promise<string[]> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.statusSelect.locator('option').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    return await this.getSelectOptionTexts(this.statusSelect);
  }

  async getSelectedStatus(): Promise<string> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return await this.statusSelect.inputValue();
  }

  async selectStatus(status: string): Promise<void> {
    await this.statusSelect.selectOption(status);
  }

  async fillAddress(address: string): Promise<void> {
    await this.addressInput.fill(address);
  }

  getFormFields(): Locator[] {
    return [
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
      this.certificationSelect,
      this.specialtySelect,
      this.dateOfBirthInput,
      this.genderMaleRadio,
      this.genderFemaleRadio,
      this.genderOtherRadio,
      this.maritalStatusSelect,
    ];
  }

  async areAllTempFieldsDisabled(): Promise<boolean> {
    return await super.areAllFieldsDisabled(this.getFormFields());
  }

  async areAllTempFieldsEnabled(): Promise<boolean> {
    // Specialty is conditionally enabled based on certification selection
    const certVal = await this.certificationSelect.inputValue().catch(() => '');
    const fieldsToCheck = certVal
      ? this.getFormFields()
      : this.getFormFields().filter((f) => f !== this.specialtySelect);
    return await super.areAllFieldsEnabled(fieldsToCheck);
  }

  getFieldLabel(labelText: string): Locator {
    const escaped = labelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .locator('form label, form span')
      .filter({ hasText: new RegExp(`^\\s*${escaped}\\s*\\*?\\s*$`) })
      .first();
  }

  getRequiredAsterisk(labelText: string): Locator {
    return this.getFieldLabel(labelText).locator('span.text-red-600', { hasText: '*' });
  }

  async clearSelect(locator: Locator): Promise<void> {
    await locator.selectOption('');
  }

  async getTempViaApi(id: number | string): Promise<{ status: number; body: any }> {
    const response = await this.page.request.get(`/api/temps/${id}`);
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { rawText: await response.text() };
    }
    return { status: response.status(), body };
  }

  async getActiveMappedCertAndSpecialtyViaApi(): Promise<{
    certification: string;
    specialty: string;
    unmappedSpecialty?: string;
  }> {
    const certsRes = await this.page.request.get('/api/admin/certifications?pageSize=200');
    const certsJson = await certsRes.json();
    const certs: any[] = Array.isArray(certsJson) ? certsJson : certsJson.items ?? certsJson.data ?? [];

    const specsRes = await this.page.request.get('/api/admin/specialties?pageSize=200');
    const specsJson = await specsRes.json();
    const specs: any[] = Array.isArray(specsJson) ? specsJson : specsJson.items ?? specsJson.data ?? [];

    const isActiveRecord = (r: any) =>
      (r.status ? String(r.status).toLowerCase() === 'active' : true) && r.isActive !== false;

    const activeSpecs = specs.filter(isActiveRecord);
    const activeSpecNames = new Set(activeSpecs.map((s) => String(s.name).toLowerCase()));
    const activeCerts = certs.filter(isActiveRecord);

    for (const cert of activeCerts) {
      const rawMapped = cert.specialties ?? cert.mappedSpecialties ?? [];
      let mappedNames: string[] = [];
      if (typeof rawMapped === 'string') {
        mappedNames = rawMapped
          .split(',')
          .map((s) => s.trim())
          .filter((name) => name.length > 0 && (activeSpecNames.size === 0 || activeSpecNames.has(name.toLowerCase())));
      } else if (Array.isArray(rawMapped)) {
        mappedNames = rawMapped
          .filter((s: any) => typeof s === 'string' || isActiveRecord(s))
          .map((s: any) => (typeof s === 'string' ? s.trim() : String(s.name).trim()))
          .filter(Boolean);
      }

      if (mappedNames.length > 0) {
        const mappedSet = new Set(mappedNames.map((n) => n.toLowerCase()));
        const unmapped = activeSpecs.find((s) => !mappedSet.has(String(s.name).toLowerCase()));
        return {
          certification: cert.name,
          specialty: mappedNames[0],
          unmappedSpecialty: unmapped?.name,
        };
      }
    }

    throw new Error('No active Certification with a mapped active Specialty found in Admin Masters.');
  }
}
