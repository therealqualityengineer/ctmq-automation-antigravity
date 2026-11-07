import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StatusOptionsPage extends BasePage {
  // AppShell & Navigation
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;

  // Page Header & Controls
  readonly addStatusOptionButton: Locator;
  readonly addStatusOptionButtonContainer: Locator;
  readonly subTabsContainer: Locator;
  readonly clientTabButton: Locator;
  readonly tempTabButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Table & Pagination
  readonly table: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly paginationContainer: Locator;
  readonly paginationText: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly feedbackBanner: Locator;

  // Modal Dialog
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly modalCloseButton: Locator;
  readonly statusNameInput: Locator;
  readonly statusDescriptionInput: Locator;
  readonly statusIsActiveSelect: Locator;
  readonly statusDisplayOrderInput: Locator;
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly modalRequiredFieldError: Locator;
  readonly modalConflictError: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.primaryNav = page.locator('nav').first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.adminSubNav = page.locator('div.bg-slate-100').first();

    // Page Level Controls
    this.addStatusOptionButton = page.getByRole('button', { name: 'Add Status Option', exact: true });
    this.addStatusOptionButtonContainer = page.locator('div.flex.justify-center').first();

    // Sub-tabs (Client / Temp within status options controls)
    this.subTabsContainer = page.locator('nav.flex.space-x-8, div.border-b.border-slate-200 nav').first();
    this.clientTabButton = page.locator('button').filter({ hasText: /^Client$/ }).first();
    this.tempTabButton = page.locator('button').filter({ hasText: /^Temp$/ }).first();

    // Search
    this.searchInput = page.getByPlaceholder('Search by status name or description');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });

    // Table & Pagination
    this.table = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.paginationContainer = page.locator('div.flex.items-center.justify-between.text-sm.text-slate-600');
    this.paginationText = this.paginationContainer.locator('span').first();
    this.previousPageButton = page.getByRole('button', { name: 'Previous', exact: true });
    this.nextPageButton = page.getByRole('button', { name: 'Next', exact: true });
    this.feedbackBanner = page.locator('.bg-green-50, [role="alert"], [role="status"]').first();

    // Modal
    this.modalDialog = page.getByRole('dialog');
    this.modalTitle = this.modalDialog.getByRole('heading').first();
    this.modalCloseButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.statusNameInput = this.modalDialog.locator('#status-option-name');
    this.statusDescriptionInput = this.modalDialog.locator('#status-option-description');
    this.statusIsActiveSelect = this.modalDialog.locator('#status-option-is-active');
    this.statusDisplayOrderInput = this.modalDialog.locator('#status-option-display-order');
    this.modalCancelButton = this.modalDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.modalSaveButton = this.modalDialog.getByRole('button', { name: /Save Changes|Save/i });
    this.modalRequiredFieldError = this.modalDialog.locator('text=Status Option name is required.');
    this.modalConflictError = this.modalDialog.locator('.bg-red-50, [role="alert"]').filter({ hasText: /already exists/i });
  }

  async gotoStatusOptions(): Promise<void> {
    await this.navigate('/admin/status-options');
    await this.waitForPageLoaded();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isAddStatusOptionButtonCentered(): Promise<boolean> {
    const containerClasses = await this.addStatusOptionButtonContainer.getAttribute('class');
    return Boolean(containerClasses?.includes('justify-center'));
  }

  async isClientTabActive(): Promise<boolean> {
    const className = await this.clientTabButton.getAttribute('class');
    return Boolean(className?.includes('border-blue-600'));
  }

  async isTempTabActive(): Promise<boolean> {
    const className = await this.tempTabButton.getAttribute('class');
    return Boolean(className?.includes('border-blue-600'));
  }

  async switchToClientTab(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/status-options') && resp.url().includes('entityType=Client')
    );
    await this.clientTabButton.click();
    await responsePromise;
  }

  async switchToTempTab(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/status-options') && resp.url().includes('entityType=Temp')
    );
    await this.tempTabButton.click();
    await responsePromise;
  }

  async search(query: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/status-options') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/status-options') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill('');
    await this.searchButton.click();
    await responsePromise;
  }

  async openAddStatusOptionModal(): Promise<void> {
    await this.addStatusOptionButton.click();
    await this.modalDialog.waitFor({ state: 'visible' });
  }

  async closeModalViaCloseButton(): Promise<void> {
    await this.modalCloseButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async closeModalViaCancel(): Promise<void> {
    await this.modalCancelButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async fillStatusName(name: string): Promise<void> {
    await this.statusNameInput.fill(name);
  }

  async fillStatusDescription(description: string): Promise<void> {
    await this.statusDescriptionInput.fill(description);
  }

  async fillDescription(description: string): Promise<void> {
    await this.fillStatusDescription(description);
  }

  async selectIsActive(status: 'Active' | 'Inactive'): Promise<void> {
    const value = status === 'Active' ? 'true' : 'false';
    await this.statusIsActiveSelect.selectOption(value);
  }

  async saveModal(): Promise<void> {
    await this.modalSaveButton.click();
  }

  async openEditStatusOptionModal(name: string): Promise<void> {
    const row = this.getStatusOptionRow(name);
    await row.waitFor({ state: 'visible' });
    await row.locator('td').nth(1).click();
    await this.modalDialog.waitFor({ state: 'visible' });
  }

  async openEditStatusOptionModalByRow(rowIndex: number = 0): Promise<string> {
    await this.table.waitFor({ state: 'visible' });
    const row = this.tableRows.nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    const statusOptionName = (await row.locator('td').nth(1).innerText()).trim();
    await row.locator('td').nth(1).click();
    await this.modalDialog.waitFor({ state: 'visible' });
    return statusOptionName;
  }

  async fillDisplayOrder(order: number | string): Promise<void> {
    await this.statusDisplayOrderInput.fill(order.toString());
  }

  async updateStatusOption(data: {
    description?: string;
    isActive?: 'Active' | 'Inactive' | boolean;
    displayOrder?: number | string;
  }): Promise<void> {
    if (data.description !== undefined) {
      await this.fillStatusDescription(data.description);
    }
    if (data.isActive !== undefined) {
      const activeChoice = typeof data.isActive === 'boolean' ? (data.isActive ? 'Active' : 'Inactive') : data.isActive;
      await this.selectIsActive(activeChoice);
    }
    if (data.displayOrder !== undefined) {
      await this.fillDisplayOrder(data.displayOrder);
    }
    await this.saveModal();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async createStatusOption(
    name: string,
    description: string = '',
    status: 'Active' | 'Inactive' = 'Active'
  ): Promise<void> {
    await this.openAddStatusOptionModal();
    await this.fillStatusName(name);

    if (description) {
      await this.fillStatusDescription(description);
    }

    if (status !== 'Active') {
      await this.selectIsActive(status);
    }

    await this.saveModal();
  }

  getStatusOptionRow(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  async getStatusDescriptionFor(name: string): Promise<string> {
    const row = this.getStatusOptionRow(name);
    const descCell = row.locator('td').nth(2);
    return (await descCell.innerText()).trim();
  }

  async getCurrentlyActiveFor(name: string): Promise<string> {
    const row = this.getStatusOptionRow(name);
    const activeCell = row.locator('td').nth(3);
    return (await activeCell.innerText()).trim();
  }

  getStatusPillFor(name: string): Locator {
    const row = this.getStatusOptionRow(name);
    return row.locator('td').nth(3).locator('span').first();
  }

  async getPaginationInfo(): Promise<{ currentPage: number; totalPages: number; totalRecords: number }> {
    const text = await this.paginationText.innerText();
    const match = text.match(/Page\s+(\d+)\s+of\s+(\d+)\s+\((\d+)\s+total\)/i);
    if (!match) {
      throw new Error(`Unexpected pagination text format: "${text}"`);
    }
    return {
      currentPage: parseInt(match[1], 10),
      totalPages: parseInt(match[2], 10),
      totalRecords: parseInt(match[3], 10),
    };
  }

  async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }
}
