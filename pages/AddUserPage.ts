import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface UserFormData {
  fullName?: string;
  username?: string;
  title?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  status?: 'active' | 'inactive';
}

export class AddUserPage extends BasePage {
  readonly pageHeading: Locator;
  readonly fullNameInput: Locator;
  readonly usernameInput: Locator;
  readonly titleInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly roleDisplay: Locator;
  readonly statusSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly usernameInUseError: Locator;
  readonly emailInUseError: Locator;
  readonly passwordMismatchError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Add User', exact: true });
    this.fullNameInput = page.locator('#fullName');
    this.usernameInput = page.locator('#username');
    this.titleInput = page.locator('#title');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.roleDisplay = page.locator('div:has(label:text-is("Role")) p, label:text-is("Role") + div p, p:text-is("Staffing Admin")').first();
    this.statusSelect = page.locator('#isActive');
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.usernameInUseError = page.getByText('That username is already in use.');
    this.emailInUseError = page.getByText('That email address is already in use.');
    this.passwordMismatchError = page.getByText('Password and Confirm Password must match.');
  }

  async gotoAddUser(): Promise<void> {
    await this.navigate('/admin/users/new');
  }

  async fillFullName(fullName: string): Promise<void> {
    await this.fullNameInput.fill(fullName);
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async selectStatus(status: 'active' | 'inactive'): Promise<void> {
    await this.statusSelect.selectOption(status);
  }

  async fillForm(data: UserFormData): Promise<void> {
    if (data.fullName !== undefined) await this.fillFullName(data.fullName);
    if (data.username !== undefined) await this.fillUsername(data.username);
    if (data.title !== undefined) await this.fillTitle(data.title);
    if (data.email !== undefined) await this.fillEmail(data.email);
    if (data.password !== undefined) await this.fillPassword(data.password);
    if (data.confirmPassword !== undefined) await this.fillConfirmPassword(data.confirmPassword);
    if (data.status !== undefined) await this.selectStatus(data.status);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickSaveRapidly(): Promise<void> {
    await this.saveButton.click({ clickCount: 2, delay: 50 });
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clearFullName(): Promise<void> {
    await this.fullNameInput.clear();
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearTitle(): Promise<void> {
    await this.titleInput.clear();
  }

  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async clearConfirmPassword(): Promise<void> {
    await this.confirmPasswordInput.clear();
  }

  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButton.isDisabled();
  }

  async saveAndInterceptApiResponse(): Promise<{ status: number; body: any }> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/api/admin/users') && res.request().method() === 'POST'
      ),
      this.clickSave(),
    ]);
    const status = response.status();
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    return { status, body };
  }

  async getRoleText(): Promise<string> {
    return (await this.roleDisplay.textContent())?.trim() || '';
  }

  async getSelectedStatus(): Promise<string> {
    return await this.statusSelect.inputValue();
  }

  async isFieldHtmlValid(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => el.checkValidity());
  }

  async getValidationMessage(locator: Locator): Promise<string> {
    return await locator.evaluate((el: HTMLInputElement) => el.validationMessage);
  }
}
