import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderTypesPage extends BasePage {
  // AppShell & Navigation
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;

  // Page Header & Controls
  readonly addOrderTypeButton: Locator;
  readonly addOrderTypeButtonContainer: Locator;
  readonly categoryTabsNav: Locator;
  readonly perDiemTab: Locator;
  readonly longTermTab: Locator;
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
  readonly modalSubtitle: Locator;
  readonly modalCloseButton: Locator;
  readonly modalCancelButton: Locator;
  readonly nameInput: Locator;
  readonly shiftOrderTypeDefaultSelect: Locator;
  readonly statusSelect: Locator;
  readonly defaultSelect: Locator;
  readonly modalSaveButton: Locator;
  readonly modalRequiredFieldError: Locator;
  readonly modalConflictError: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.primaryNav = page.locator('nav').first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.adminSubNav = page.locator('div.bg-slate-100').first();

    // Page Controls & Sub-tabs
    this.addOrderTypeButton = page.getByRole('button', { name: /Add Order Type/i });
    this.addOrderTypeButtonContainer = page.locator('div.flex.justify-center').first();
    this.categoryTabsNav = page.getByRole('navigation', { name: 'Order Type Category Tabs' });
    this.perDiemTab = page.getByRole('button', { name: 'Per Diem Order Types', exact: true });
    this.longTermTab = page.getByRole('button', { name: 'Long Term Order Types', exact: true });
    this.searchInput = page.getByPlaceholder(/Search by order type name/i).or(page.getByPlaceholder(/Search/i));
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });

    // Table & Pagination
    this.table = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.paginationText = page.locator('main').locator('text=/Page \\d+ of \\d+/i').first();
    this.paginationContainer = page.locator('div').filter({ has: this.paginationText }).last();
    this.previousPageButton = page.getByRole('button', { name: 'Previous', exact: true });
    this.nextPageButton = page.getByRole('button', { name: 'Next', exact: true });
    this.feedbackBanner = page.locator('.bg-green-50, [role="alert"], [role="status"]').first();

    // Modal
    this.modalDialog = page.getByRole('dialog');
    this.modalTitle = this.modalDialog.getByRole('heading', { name: 'Order Type', exact: true });
    this.modalSubtitle = this.modalDialog.locator('text=* indicates required field').first();
    this.modalCloseButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.modalCancelButton = this.modalDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.modalSaveButton = this.modalDialog.getByRole('button', { name: /Save Order Type|Save/i });

    // Modal Form Fields
    this.nameInput = this.modalDialog.getByRole('textbox', { name: /Order Type Name/i })
      .or(this.modalDialog.locator('#order-type-name'))
      .first();
    this.shiftOrderTypeDefaultSelect = this.modalDialog.getByRole('combobox', { name: /Shift Order Type Default/i })
      .or(this.modalDialog.locator('#shift-order-type-default'))
      .first();
    this.statusSelect = this.modalDialog.getByRole('combobox', { name: /Status/i })
      .or(this.modalDialog.locator('#order-type-status'))
      .first();
    this.defaultSelect = this.modalDialog.getByRole('combobox', { name: /(Order Form Default|LT Order Form Default)/i })
      .or(this.modalDialog.locator('#order-form-default, #is-default, select[name*="default" i]'))
      .first();

    this.modalRequiredFieldError = this.modalDialog.locator('text=/Order Type Name is required/i');
    this.modalConflictError = this.modalDialog.locator('text=/already exists|conflict/i');
  }

  async gotoOrderTypes(): Promise<void> {
    await this.navigate('/admin/order-types');
    await this.waitForPageLoaded();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isAddOrderTypeButtonCentered(): Promise<boolean> {
    const containerClasses = await this.addOrderTypeButtonContainer.getAttribute('class');
    return Boolean(containerClasses?.includes('justify-center'));
  }

  async isPerDiemTabActive(): Promise<boolean> {
    const className = (await this.perDiemTab.getAttribute('class')) || '';
    return className.includes('border-blue-600') || className.includes('text-blue-600');
  }

  async isLongTermTabActive(): Promise<boolean> {
    const className = (await this.longTermTab.getAttribute('class')) || '';
    return className.includes('border-blue-600') || className.includes('text-blue-600');
  }

  async clickPerDiemTab(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/order-types') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.perDiemTab.click();
    await responsePromise;
  }

  async clickLongTermTab(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/order-types') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.longTermTab.click();
    await responsePromise;
  }

  async search(query: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/order-types') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/order-types') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.searchInput.fill('');
    await this.searchButton.click();
    await responsePromise;
  }

  async openAddOrderTypeModal(): Promise<void> {
    await this.addOrderTypeButton.click();
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

  async fillOrderTypeName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async selectShiftOrderTypeDefault(optionText: string): Promise<void> {
    await this.shiftOrderTypeDefaultSelect.selectOption({ label: optionText });
  }

  async selectStatus(status: 'Active' | 'Hidden'): Promise<void> {
    await this.statusSelect.selectOption(status);
  }

  async selectDefault(choice: 'Yes' | 'No'): Promise<void> {
    if (await this.defaultSelect.isVisible()) {
      await this.defaultSelect.selectOption(choice);
    }
  }

  async saveModal(): Promise<void> {
    await this.modalSaveButton.click();
  }

  async createOrderType(data: {
    name: string;
    status?: 'Active' | 'Hidden';
    isDefault?: 'Yes' | 'No';
    shiftOrderTypeDefault?: string;
  }): Promise<void> {
    await this.openAddOrderTypeModal();
    await this.fillOrderTypeName(data.name);

    if (data.shiftOrderTypeDefault && (await this.shiftOrderTypeDefaultSelect.isVisible())) {
      await this.selectShiftOrderTypeDefault(data.shiftOrderTypeDefault);
    }

    if (data.status) {
      await this.selectStatus(data.status);
    }

    if (data.isDefault) {
      await this.selectDefault(data.isDefault);
    }

    await this.saveModal();
  }

  getOrderTypeRow(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  async getStatusPillFor(name: string): Promise<Locator> {
    const row = this.getOrderTypeRow(name);
    return row.locator('span, td').filter({ hasText: /^(Active|Hidden)$/i }).first();
  }

  async getDefaultIndicatorFor(name: string): Promise<Locator> {
    const row = this.getOrderTypeRow(name);
    return row.locator('span, td').filter({ hasText: /^(Yes|No)$/i }).first();
  }

  async getShiftOrderTypeDefaultFor(name: string): Promise<Locator> {
    const row = this.getOrderTypeRow(name);
    return row.locator('td').nth(2);
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
