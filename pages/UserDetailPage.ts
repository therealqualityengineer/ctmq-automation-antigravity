import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserDetailPayload } from '../test-data/userDetailData';

export class UserDetailPage extends BasePage {
  readonly pageHeading: Locator;

  // Form Fields
  readonly fullNameInput: Locator;
  readonly usernameInput: Locator;
  readonly titleInput: Locator;
  readonly emailInput: Locator;
  readonly roleDisplay: Locator;
  readonly statusSelect: Locator;

  // Action Buttons
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  // Delete Modal
  readonly deleteModal: Locator;
  readonly modalTitle: Locator;
  readonly modalPrompt: Locator;
  readonly modalCloseButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmDeleteButton: Locator;

  // Feedback & Error Banners
  readonly feedbackBanner: Locator;
  readonly saveSuccessBanner: Locator;
  readonly deleteSuccessBanner: Locator;
  readonly errorBanner: Locator;
  readonly selfDeactivationError: Locator;
  readonly selfDeletionError: Locator;
  readonly duplicateUsernameError: Locator;
  readonly duplicateEmailError: Locator;
  readonly fullNameRequiredError: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole('heading', { level: 1 });

    // Fields
    this.fullNameInput = page.locator('#fullName');
    this.usernameInput = page.locator('#username');
    this.titleInput = page.locator('#title');
    this.emailInput = page.locator('#email');
    this.roleDisplay = page.locator('div:has(label:text-is("Role")) p, label:text-is("Role") + div p, p:text-is("Staffing Admin")').first();
    this.statusSelect = page.locator('#isActive');

    // Actions
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.deleteButton = page.locator('button:has-text("Delete")').first();

    // Modal
    this.deleteModal = page.locator('div[role="dialog"]');
    this.modalTitle = this.deleteModal.getByRole('heading', { name: 'Delete User' });
    this.modalPrompt = this.deleteModal.getByText("Are you sure? This can't be undone.");
    this.modalCloseButton = this.deleteModal.getByRole('button', { name: 'Close' });
    this.modalCancelButton = this.deleteModal.getByRole('button', { name: 'Cancel', exact: true });
    this.modalConfirmDeleteButton = this.deleteModal.getByRole('button', { name: 'Delete', exact: true });

    // Feedback
    this.feedbackBanner = page.locator('div[role="alert"], p[role="status"]').first();
    this.saveSuccessBanner = page.getByText('User saved successfully.');
    this.deleteSuccessBanner = page.getByText('User deleted successfully.');
    this.errorBanner = page.locator('[role="alert"], p.text-red-600, p.text-red-700, span.text-red-600');
    this.selfDeactivationError = page.getByText('You cannot deactivate your own account.');
    this.selfDeletionError = page.getByText('You cannot delete your own account.');
    this.duplicateUsernameError = page.getByText('That username is already in use.');
    this.duplicateEmailError = page.getByText('That email address is already in use.');
    this.fullNameRequiredError = page.getByText('The Full Name field is required.');
  }

  async gotoUserDetail(id: number | string): Promise<void> {
    await this.navigate(`/admin/users/${id}`);
    await this.page.waitForLoadState('domcontentloaded');
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

  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  async confirmDelete(): Promise<void> {
    await this.modalConfirmDeleteButton.click();
  }

  async cancelDeleteModal(): Promise<void> {
    await this.modalCancelButton.click();
  }

  async closeDeleteModal(): Promise<void> {
    await this.modalCloseButton.click();
  }

  async fillForm(data: Partial<UserDetailPayload>): Promise<void> {
    if (data.fullName !== undefined) await this.fullNameInput.fill(data.fullName);
    if (data.username !== undefined) await this.usernameInput.fill(data.username);
    if (data.title !== undefined) await this.titleInput.fill(data.title);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.isActive !== undefined) {
      await this.statusSelect.selectOption(data.isActive ? 'active' : 'inactive');
    }
  }

  async areAllFieldsDisabled(): Promise<boolean> {
    return await super.areAllFieldsDisabled([
      this.fullNameInput,
      this.usernameInput,
      this.titleInput,
      this.emailInput,
      this.statusSelect,
    ]);
  }

  async areAllFieldsEnabled(): Promise<boolean> {
    return await super.areAllFieldsEnabled([
      this.fullNameInput,
      this.usernameInput,
      this.titleInput,
      this.emailInput,
      this.statusSelect,
    ]);
  }

  async saveAndInterceptPutResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/users') && resp.request().method() === 'PUT'
    );
    await this.clickSave();
    const response = await responsePromise;
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      // response body not json
    }
    return { status: response.status(), body };
  }

  async deleteAndInterceptResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/users') && resp.request().method() === 'DELETE'
    );
    await this.confirmDelete();
    const response = await responsePromise;
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      // response body not json
    }
    return { status: response.status(), body };
  }

  async createUserViaApi(payload: UserDetailPayload): Promise<any> {
    const response = await this.page.request.post('/api/admin/users', { data: payload });
    return await response.json();
  }

  async deleteUserViaApi(id: number | string): Promise<any> {
    const response = await this.page.request.delete(`/api/admin/users/${id}`);
    return response.status();
  }
}
