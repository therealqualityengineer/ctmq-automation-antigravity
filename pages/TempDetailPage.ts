import { Page, Locator } from '@playwright/test';
import { BaseTempFormPage } from './BaseTempFormPage';
import { TempPayload } from '../test-data/addTempData';

export class TempDetailPage extends BaseTempFormPage {
  readonly pageHeading: Locator;
  readonly notFoundMessage: Locator;
  readonly editButton: Locator;
  readonly duplicateEmailError: Locator;

  // Delete Action & Modal
  readonly deleteButton: Locator;
  readonly deleteModal: Locator;
  readonly modalTitle: Locator;
  readonly modalPrompt: Locator;
  readonly modalCloseButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmDeleteButton: Locator;
  readonly deleteSuccessBanner: Locator;
  readonly deleteErrorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.notFoundMessage = page.getByText('This temp could not be found.');
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.duplicateEmailError = page.getByText('That email address is already in use.');

    // Delete Modal
    this.deleteButton = page.locator('button:has-text("Delete")').first();
    this.deleteModal = page.locator('div[role="dialog"]');
    this.modalTitle = this.deleteModal.getByRole('heading', { name: /Delete Temp/i });
    this.modalPrompt = this.deleteModal.getByText("Are you sure? This can't be undone.");
    this.modalCloseButton = this.deleteModal.getByRole('button', { name: 'Close' });
    this.modalCancelButton = this.deleteModal.getByRole('button', { name: 'Cancel', exact: true });
    this.modalConfirmDeleteButton = this.deleteModal.getByRole('button', { name: 'Delete', exact: true });
    this.deleteSuccessBanner = page.getByText('Temp deleted successfully.');
    this.deleteErrorBanner = page.locator('[role="alert"], p.text-red-600, p.text-red-700, span.text-red-600');
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
    return await this.areAllTempFieldsDisabled();
  }

  async areAllFieldsEnabled(): Promise<boolean> {
    return await this.areAllTempFieldsEnabled();
  }

  async pressEnterKey(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async createTempViaApi(payload: TempPayload): Promise<any> {
    const response = await this.page.request.post('/api/temps', { data: payload });
    return await response.json();
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

  async deleteAndInterceptResponse(): Promise<{ status: number; body: any }> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/temps') && resp.request().method() === 'DELETE'
    );
    await this.confirmDelete();
    const response = await responsePromise;
    let body = {};
    try {
      body = await response.json();
    } catch {
      // response body not json
    }
    return { status: response.status(), body };
  }

  async deleteTempViaApi(id: number | string): Promise<any> {
    const response = await this.page.request.delete(`/api/temps/${id}`);
    return response.status();
  }
}
