import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClientPage extends BasePage {
  readonly pageHeading: Locator;
  readonly addClientButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clientsTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly noRecordsMessage: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Client', level: 1 });
    this.addClientButton = page.getByRole('button', { name: /Add Client/i });
    this.searchInput = page.getByPlaceholder(/search by name or email/i);
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.clientsTable = page.getByRole('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr[tabindex="0"]');
    this.noRecordsMessage = page.getByText('No records found.');
    this.prevButton = page.getByRole('button', { name: 'Previous', exact: true });
    this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
  }

  async gotoClient(): Promise<void> {
    await this.navigate('/client');
  }

  async clickAddClient(): Promise<void> {
    await this.addClientButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.page.waitForTimeout(400);
  }

  async getTableHeaders(): Promise<string[]> {
    await this.clientsTable.waitFor({ state: 'visible' });
    await this.tableHeaders.first().waitFor({ state: 'visible' });
    const headers = this.tableHeaders;
    const count = await headers.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).innerText();
      result.push(text.trim());
    }
    return result;
  }

  async getRowCount(): Promise<number> {
    await this.clientsTable.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(300);
    return await this.tableRows.count();
  }

  async clickFirstRow(): Promise<void> {
    const firstRow = this.tableRows.first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();
  }

  async clickRowByText(text: string): Promise<void> {
    const row = this.tableRows.filter({ hasText: text }).first();
    await row.waitFor({ state: 'visible' });
    await row.click();
  }

  async getFirstRowText(): Promise<string> {
    return await this.tableRows.first().innerText();
  }
}
