import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly myAccountHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#input-email');
    this.passwordInput = page.locator('#input-password');
    this.loginButton = page.locator('input[value="Login"]');
    this.errorMessage = page.locator('.alert-danger');
    this.myAccountHeader = page.locator('#content h2:has-text("My Account")');
  }

  async gotoLoginPage(): Promise<void> {
    await this.navigate('/index.php?route=account/login');
  }

  async login(email: string, pass: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  async getErrorMessageText(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
