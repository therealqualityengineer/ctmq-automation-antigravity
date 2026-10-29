import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TempPage extends BasePage {
  readonly pageHeading: Locator;
  readonly addTempButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly tempsTable: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Temp', level: 1 });
    this.addTempButton = page.getByRole('button', { name: /Add Temp/i });
    this.searchInput = page.getByPlaceholder(/search by name or email/i);
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.tempsTable = page.getByRole('table');
    this.tableRows = page.locator('table tbody tr[tabindex="0"]');
  }

  async gotoTemp(): Promise<void> {
    await this.navigate('/temp');
  }

  async clickAddTemp(): Promise<void> {
    await this.addTempButton.click();
  }

  async clickFirstRow(): Promise<void> {
    const firstRow = this.tableRows.first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }
}

