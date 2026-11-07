import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CertificationsPage extends BasePage {
  // AppShell & Navigation
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;

  // Page Header & Controls
  readonly heading: Locator;
  readonly addCertButton: Locator;
  readonly addCertButtonContainer: Locator;
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
  readonly certNameInput: Locator;
  readonly specialtiesDropdownButton: Locator;
  readonly specialtiesDropdownMenu: Locator;
  readonly statusSelect: Locator;
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

    // Page Level
    this.heading = page.getByRole('heading', { name: 'Certifications', exact: true });
    this.addCertButton = page.getByRole('button', { name: 'Add Certification', exact: true });
    this.addCertButtonContainer = page.locator('div.flex.justify-center').first();
    this.searchInput = page.getByPlaceholder('Search by certification name or mapped specialties');
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
    this.modalTitle = this.modalDialog.getByRole('heading', { name: 'Add Certification', exact: true });
    this.modalCloseButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.certNameInput = this.modalDialog.locator('#cert-name');
    this.specialtiesDropdownButton = this.modalDialog.locator('#mapped-specialties');
    this.specialtiesDropdownMenu = this.modalDialog.locator('div.absolute.z-50');
    this.statusSelect = this.modalDialog.locator('#cert-status');
    this.modalCancelButton = this.modalDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.modalSaveButton = this.modalDialog.getByRole('button', { name: 'Save', exact: true });
    this.modalRequiredFieldError = this.modalDialog.locator('text=Certification Name is required.');
    this.modalConflictError = this.modalDialog.locator('text=A certification with this name already exists.');
  }

  async gotoCertifications(): Promise<void> {
    await this.navigate('/admin/certifications');
    await this.waitForPageLoaded();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isAddCertButtonCentered(): Promise<boolean> {
    const containerClasses = await this.addCertButtonContainer.getAttribute('class');
    return Boolean(containerClasses?.includes('justify-center'));
  }

  async search(query: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/certifications') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/certifications') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill('');
    await this.searchButton.click();
    await responsePromise;
  }

  async openAddCertModal(): Promise<void> {
    await this.addCertButton.click();
    await this.modalDialog.waitFor({ state: 'visible' });
  }

  async closeModalViaCloseButton(): Promise<void> {
    await this.modalCloseButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async closeModalViaCancel(): Promise<void> {
    const isExpanded = await this.specialtiesDropdownButton.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      await this.toggleSpecialtiesDropdown();
    }
    await this.modalCancelButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async fillCertName(name: string): Promise<void> {
    await this.certNameInput.fill(name);
  }

  async toggleSpecialtiesDropdown(): Promise<void> {
    await this.specialtiesDropdownButton.click();
  }

  getSpecialtyCheckbox(specialtyName: string): Locator {
    return this.modalDialog
      .locator('label', { hasText: new RegExp(`^\\s*${specialtyName}\\s*$`) })
      .locator('input[type="checkbox"]');
  }

  async selectSpecialty(specialtyName: string): Promise<void> {
    const isExpanded = await this.specialtiesDropdownButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.toggleSpecialtiesDropdown();
    }
    const checkbox = this.getSpecialtyCheckbox(specialtyName);
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async deselectSpecialty(specialtyName: string): Promise<void> {
    const isExpanded = await this.specialtiesDropdownButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.toggleSpecialtiesDropdown();
    }
    const checkbox = this.getSpecialtyCheckbox(specialtyName);
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }

  async selectStatus(status: 'Active' | 'Inactive'): Promise<void> {
    await this.statusSelect.selectOption(status);
  }

  async saveModal(): Promise<void> {
    await this.modalSaveButton.click();
  }

  async createCertification(
    name: string,
    specialties: string[] = [],
    status: 'Active' | 'Inactive' = 'Active'
  ): Promise<void> {
    await this.openAddCertModal();
    await this.fillCertName(name);

    if (specialties.length > 0) {
      await this.toggleSpecialtiesDropdown();
      for (const spec of specialties) {
        await this.selectSpecialty(spec);
      }
      await this.toggleSpecialtiesDropdown();
    }

    if (status !== 'Active') {
      await this.selectStatus(status);
    }

    await this.saveModal();
  }

  getCertRow(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  async getMappedSpecialtiesFor(name: string): Promise<string> {
    const row = this.getCertRow(name);
    return (await row.locator('td').nth(1).innerText()).trim();
  }

  async getStatusPillFor(name: string): Promise<Locator> {
    const row = this.getCertRow(name);
    return row.locator('td').nth(2).locator('span');
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
