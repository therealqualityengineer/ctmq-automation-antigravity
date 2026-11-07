import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

function to24HourFormat(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return timeStr;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  if (period) {
    if (period.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  }
  return `${h.toString().padStart(2, '0')}:${minutes}`;
}

export class ShiftsPage extends BasePage {
  // AppShell & Navigation
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;

  // Page Header & Controls
  readonly heading: Locator;
  readonly addShiftButton: Locator;
  readonly addShiftButtonContainer: Locator;
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

  // Modal Dialog ("Creating Shift Option")
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly modalCloseButton: Locator;
  readonly shiftNameInput: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly defaultShiftSelect: Locator;
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly modalRequiredFieldError: Locator;
  readonly modalConflictError: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.primaryNav = page.locator('nav').first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.adminSubNav = page.locator('div.bg-slate-100, nav').filter({ hasText: 'User Manager' }).first();

    // Page Level
    this.heading = page.getByRole('heading', { name: /Shifts/i }).or(page.locator('main')).first();
    this.addShiftButton = page.getByRole('button', { name: 'Add Shift Option', exact: true });
    this.addShiftButtonContainer = this.addShiftButton.locator('..');
    this.searchInput = page.getByPlaceholder('Search by shift name');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });

    // Table & Pagination
    this.table = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.paginationContainer = page.locator('div.flex.items-center.justify-between, main div').filter({ hasText: /Page \d+ of \d+/ }).first();
    this.paginationText = this.paginationContainer.locator('text=/Page \\d+ of \\d+/').first();
    this.previousPageButton = page.getByRole('button', { name: 'Previous', exact: true });
    this.nextPageButton = page.getByRole('button', { name: 'Next', exact: true });
    this.feedbackBanner = page.locator('.bg-green-50, [role="alert"], [role="status"]').first();

    // Modal
    this.modalDialog = page.getByRole('dialog');
    this.modalTitle = this.modalDialog.getByRole('heading', { name: 'Creating Shift Option', exact: true });
    this.modalCloseButton = this.modalDialog.getByRole('button', { name: 'Close', exact: true });
    this.shiftNameInput = this.modalDialog.locator('#shift-name, #name, input[name="name"], input[name="shiftName"]').or(this.modalDialog.getByLabel(/Shift Name/i)).first();
    this.startTimeInput = this.modalDialog.locator('#shift-start-time, input[name="startTime"], input[type="time"]').or(this.modalDialog.getByLabel(/Start Time/i)).first();
    this.endTimeInput = this.modalDialog.locator('#shift-end-time, input[name="endTime"]').or(this.modalDialog.getByLabel(/End Time/i)).first();
    this.defaultShiftSelect = this.modalDialog.locator('#shift-default, #shift-is-default, select[name="isDefault"]').or(this.modalDialog.getByLabel(/Default Shift/i)).first();
    this.modalCancelButton = this.modalDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.modalSaveButton = this.modalDialog.getByRole('button', { name: 'Save Shift', exact: true });
    this.modalRequiredFieldError = this.modalDialog.locator('.text-red-500, .text-red-600, .field-error').first();
    this.modalConflictError = this.modalDialog.getByText(/already exists/i).or(this.modalDialog.locator('text=/already exists/i')).first();
  }

  async gotoShifts(): Promise<void> {
    await this.navigate('/admin/shifts');
    await this.waitForPageLoaded();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isAddShiftButtonCentered(): Promise<boolean> {
    const containerClasses = await this.addShiftButtonContainer.getAttribute('class');
    return Boolean(containerClasses?.includes('justify-center') || containerClasses?.includes('text-center') || containerClasses?.includes('mx-auto'));
  }

  async search(query: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/shifts') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/shifts') && resp.request().method() === 'GET'
    ).catch(() => null);
    await this.searchInput.fill('');
    await this.searchButton.click();
    await responsePromise;
  }

  async openAddShiftModal(): Promise<void> {
    await this.addShiftButton.click();
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

  async fillShiftName(name: string): Promise<void> {
    await this.shiftNameInput.fill(name);
  }

  async fillStartTime(time: string): Promise<void> {
    const time24 = to24HourFormat(time);
    await this.startTimeInput.fill(time24);
  }

  async fillEndTime(time: string): Promise<void> {
    const time24 = to24HourFormat(time);
    await this.endTimeInput.fill(time24);
  }

  async setDefaultShift(isDefault: boolean): Promise<void> {
    await this.defaultShiftSelect.selectOption(isDefault ? 'true' : 'false');
  }

  async saveModal(): Promise<void> {
    await this.modalSaveButton.click();
  }

  async createShift(
    name: string,
    startTime: string,
    endTime: string,
    isDefault: boolean = false
  ): Promise<void> {
    await this.openAddShiftModal();
    await this.fillShiftName(name);
    await this.fillStartTime(startTime);
    await this.fillEndTime(endTime);
    await this.setDefaultShift(isDefault);
    await this.saveModal();
  }

  getShiftRow(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  async getStartTimeFor(name: string): Promise<string> {
    const row = this.getShiftRow(name);
    return (await row.locator('td').nth(2).innerText()).trim();
  }

  async getEndTimeFor(name: string): Promise<string> {
    const row = this.getShiftRow(name);
    return (await row.locator('td').nth(3).innerText()).trim();
  }

  async getDefaultShiftValueFor(name: string): Promise<string> {
    const row = this.getShiftRow(name);
    return (await row.locator('td').nth(4).innerText()).trim();
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
