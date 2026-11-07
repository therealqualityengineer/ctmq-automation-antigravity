import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SpecialtiesPage extends BasePage {
  // AppShell & Navigation
  readonly primaryNav: Locator;
  readonly adminLink: Locator;
  readonly adminSubNav: Locator;

  // Page Header & Controls
  readonly heading: Locator;
  readonly addSpecialtyButton: Locator;
  readonly addSpecialtyButtonContainer: Locator;
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
  readonly editModalTitle: Locator;
  readonly modalCloseButton: Locator;
  readonly specialtyNameInput: Locator;
  readonly certMappingDropdownButton: Locator;
  readonly certMappingDropdownMenu: Locator;
  readonly statusSelect: Locator;
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly saveChangesButton: Locator;
  readonly modalRequiredFieldError: Locator;
  readonly modalConflictError: Locator;
  readonly modalErrorBanner: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.primaryNav = page.locator('nav').first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.adminSubNav = page.locator('div.bg-slate-100').first();

    // Page Level
    this.heading = page.getByRole('heading', { name: 'Specialties', exact: true });
    this.addSpecialtyButton = page.getByRole('button', { name: 'Add Specialty', exact: true });
    this.addSpecialtyButtonContainer = page.locator('div.flex.justify-center').first();
    this.searchInput = page.getByPlaceholder('Search by specialty name or certification mapping');
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
    this.modalTitle = this.modalDialog.getByRole('heading', { name: 'Add Specialty', exact: true });
    this.editModalTitle = this.modalDialog.getByRole('heading', { name: 'Edit Specialty', exact: true });
    this.modalCloseButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.specialtyNameInput = this.modalDialog.locator('#specialty-name');
    this.certMappingDropdownButton = this.modalDialog.locator('#certification-mapping');
    this.certMappingDropdownMenu = this.modalDialog.locator('div.absolute.z-50');
    this.statusSelect = this.modalDialog.locator('#specialty-status');
    this.modalCancelButton = this.modalDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.modalSaveButton = this.modalDialog.getByRole('button', { name: 'Save', exact: true });
    this.saveChangesButton = this.modalDialog.getByRole('button', { name: 'Save Changes', exact: true });
    this.modalRequiredFieldError = this.modalDialog.locator('text=Specialty Name is required.');
    this.modalConflictError = this.modalDialog.locator('text=A specialty with this name already exists.');
    this.modalErrorBanner = this.modalDialog.locator('.bg-red-50, .text-red-800, [role="alert"]').first();
  }

  async gotoSpecialties(): Promise<void> {
    await this.navigate('/admin/specialties');
    await this.waitForPageLoaded();
  }

  async isAdminTabActive(): Promise<boolean> {
    const ariaCurrent = await this.adminLink.getAttribute('aria-current');
    const className = await this.adminLink.getAttribute('class');
    return ariaCurrent === 'page' || (className ? className.includes('border-blue-900') : false);
  }

  async isAddSpecialtyButtonCentered(): Promise<boolean> {
    const containerClasses = await this.addSpecialtyButtonContainer.getAttribute('class');
    return Boolean(containerClasses?.includes('justify-center'));
  }

  async search(query: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'GET'
    );
    await this.searchInput.fill('');
    await this.searchButton.click();
    await responsePromise;
  }

  async openAddSpecialtyModal(): Promise<void> {
    await this.addSpecialtyButton.click();
    await this.modalDialog.waitFor({ state: 'visible' });
  }

  async closeDropdownIfOpen(): Promise<void> {
    const isExpanded = await this.certMappingDropdownButton.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      await this.toggleCertificationDropdown();
    }
  }

  async closeModalViaCloseButton(): Promise<void> {
    await this.closeDropdownIfOpen();
    await this.modalCloseButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async closeModalViaCancel(): Promise<void> {
    await this.closeDropdownIfOpen();
    await this.modalCancelButton.click();
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async fillSpecialtyName(name: string): Promise<void> {
    await this.specialtyNameInput.fill(name);
  }

  async toggleCertificationDropdown(): Promise<void> {
    await this.certMappingDropdownButton.click();
  }

  getCertCheckbox(certName: string): Locator {
    return this.modalDialog
      .locator('label', { hasText: new RegExp(`^\\s*${certName}\\s*$`) })
      .locator('input[type="checkbox"]');
  }

  async selectCertification(certName: string): Promise<void> {
    const isExpanded = await this.certMappingDropdownButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.toggleCertificationDropdown();
    }
    const checkbox = this.getCertCheckbox(certName);
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async deselectCertification(certName: string): Promise<void> {
    const isExpanded = await this.certMappingDropdownButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.toggleCertificationDropdown();
    }
    const checkbox = this.getCertCheckbox(certName);
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

  async createSpecialty(
    name: string,
    certifications: string[] = [],
    status: 'Active' | 'Inactive' = 'Active'
  ): Promise<void> {
    await this.openAddSpecialtyModal();
    await this.fillSpecialtyName(name);

    if (certifications.length > 0) {
      await this.toggleCertificationDropdown();
      for (const cert of certifications) {
        await this.selectCertification(cert);
      }
      await this.toggleCertificationDropdown();
    }

    if (status !== 'Active') {
      await this.selectStatus(status);
    }

    const postPromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'POST'
    );
    const getPromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'GET'
    );
    await this.saveModal();
    await Promise.all([postPromise, getPromise]);
    await this.modalDialog.waitFor({ state: 'hidden' });
  }

  async openEditSpecialtyModal(name: string): Promise<void> {
    let row = this.getSpecialtyRow(name);
    if (!(await row.isVisible())) {
      await this.search(name);
      row = this.getSpecialtyRow(name);
    }
    await row.locator('td').first().click();
    await this.modalDialog.waitFor({ state: 'visible' });
  }

  async saveEditChanges(): Promise<void> {
    await this.closeDropdownIfOpen();
    const putPromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'PUT'
    );
    const getPromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/admin/specialties') && resp.request().method() === 'GET'
    );
    await this.saveChangesButton.click();
    await Promise.all([putPromise, getPromise]);
  }

  async clearAllCertifications(): Promise<void> {
    const isExpanded = await this.certMappingDropdownButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.toggleCertificationDropdown();
    }
    const anyCheckbox = this.modalDialog.locator('div.absolute.z-50 input[type="checkbox"]').first();
    await anyCheckbox.waitFor({ state: 'visible' });

    const checkedBoxes = this.modalDialog.locator('div.absolute.z-50 input[type="checkbox"]:checked');
    while ((await checkedBoxes.count()) > 0) {
      await checkedBoxes.first().uncheck();
    }
    await this.toggleCertificationDropdown();
  }

  getSpecialtyRow(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  async getCertificationMappingLocatorFor(name: string): Promise<Locator> {
    let row = this.getSpecialtyRow(name);
    if (!(await row.isVisible())) {
      await this.search(name);
      row = this.getSpecialtyRow(name);
    }
    return row.locator('td').nth(1);
  }

  async getCertificationMappingFor(name: string): Promise<string> {
    const loc = await this.getCertificationMappingLocatorFor(name);
    return (await loc.innerText()).trim();
  }

  async getStatusPillFor(name: string): Promise<Locator> {
    let row = this.getSpecialtyRow(name);
    if (!(await row.isVisible())) {
      await this.search(name);
      row = this.getSpecialtyRow(name);
    }
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
