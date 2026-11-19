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
  readonly deleteButton: Locator;

  // Delete Modal
  readonly deleteModal: Locator;
  readonly modalTitle: Locator;
  readonly modalPrompt: Locator;
  readonly modalCloseButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmDeleteButton: Locator;

  // Feedback & Alerts
  readonly createSuccessBanner: Locator;
  readonly saveSuccessBanner: Locator;
  readonly deleteSuccessBanner: Locator;
  readonly serverErrorBanner: Locator;
  readonly deleteErrorBanner: Locator;
  readonly feedbackErrorBanner: Locator;
  readonly feedbackSuccessBanner: Locator;
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
    this.deleteButton = page.locator('button:has-text("Delete")').first();

    // Delete Modal
    this.deleteModal = page.locator('div[role="dialog"]');
    this.modalTitle = this.deleteModal.getByRole('heading', { name: /Delete Client/i });
    this.modalPrompt = this.deleteModal.getByText("Are you sure? This can't be undone.");
    this.modalCloseButton = this.deleteModal.getByRole('button', { name: 'Close' });
    this.modalCancelButton = this.deleteModal.getByRole('button', { name: 'Cancel', exact: true });
    this.modalConfirmDeleteButton = this.deleteModal.getByRole('button', { name: 'Delete', exact: true });

    // Feedback
    this.createSuccessBanner = page.locator('p[role="status"]').filter({ hasText: 'Client created successfully.' });
    this.saveSuccessBanner = page.locator('p[role="status"]').filter({ hasText: 'Client saved successfully.' });
    this.deleteSuccessBanner = page.getByText('Client deleted successfully.');
    this.serverErrorBanner = page.locator('p.text-red-700, [role="alert"]').filter({ hasText: /Internal Server Error|failed|error/i });
    this.deleteErrorBanner = page.locator('[role="alert"], p.text-red-600, p.text-red-700, span.text-red-600');
    this.feedbackErrorBanner = page.locator('[role="alert"]');
    this.feedbackSuccessBanner = page.locator('[role="status"]');
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

  getClientFormFields(): Locator[] {
    return [
      this.fullNameInput,
      this.emailInput,
      this.addressInput,
      this.cityInput,
      this.stateSelect,
      this.zipInput,
      this.countySelect,
      this.statusSelect,
    ];
  }

  async areAllFieldsDisabled(): Promise<boolean> {
    return await super.areAllFieldsDisabled(this.getClientFormFields());
  }

  async areAllFieldsEnabled(): Promise<boolean> {
    return await super.areAllFieldsEnabled(this.getClientFormFields());
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
    return await this.getSelectOptionValues(this.stateSelect);
  }

  async getCountyOptionTexts(): Promise<string[]> {
    return await this.getSelectOptionTexts(this.countySelect);
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

  async createClientRawViaApi(payload: Partial<ClientPayload> & Record<string, any>): Promise<{ status: number; body: any }> {
    const response = await this.page.request.post('/api/clients', { data: payload });
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { rawText: await response.text() };
    }
    return { status: response.status(), body };
  }

  async updateClientRawViaApi(
    id: number | string,
    payload: Partial<ClientPayload> & Record<string, any>
  ): Promise<{ status: number; body: any }> {
    const response = await this.page.request.put(`/api/clients/${id}`, { data: payload });
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { rawText: await response.text() };
    }
    return { status: response.status(), body };
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
      (resp) => resp.url().includes('/api/clients') && resp.request().method() === 'DELETE'
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

  async createClientViaApi(payload: ClientPayload): Promise<any> {
    const response = await this.page.request.post('/api/clients', { data: payload });
    return await response.json();
  }

  async deleteClientViaApi(id: number | string): Promise<any> {
    const response = await this.page.request.delete(`/api/clients/${id}`);
    return response.status();
  }

  async clearFullName(): Promise<void> {
    await this.fullNameInput.clear();
  }

  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  async clearAddress(): Promise<void> {
    await this.addressInput.clear();
  }

  async clearCity(): Promise<void> {
    await this.cityInput.clear();
  }

  async clearState(): Promise<void> {
    await this.clearSelect(this.stateSelect);
  }

  async getClientViaApi(id: number | string): Promise<{ status: number; body: any }> {
    const response = await this.page.request.get(`/api/clients/${id}`);
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { rawText: await response.text() };
    }
    return { status: response.status(), body };
  }

  async getClientsListViaApi(): Promise<{ status: number; body: any; items: any[]; totalCount: number }> {
    const response = await this.page.request.get('/api/clients?pageSize=200');
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { rawText: await response.text() };
    }
    const items: any[] = Array.isArray(body) ? body : body.items ?? body.data ?? [];
    const totalCount = typeof body.totalCount === 'number' ? body.totalCount : items.length;
    return { status: response.status(), body, items, totalCount };
  }
}

