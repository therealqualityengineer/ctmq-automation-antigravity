import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly logo: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginCard: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByAltText('CTMQ — Contractor & Talent Management');
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: /Log In|Logging in…/i });
    this.errorMessage = page.locator('form p, div.bg-white p, p[class*="text-red"], [role="alert"]').first();
    this.loginCard = page.locator('div.bg-white, form, [data-testid="login-card"]').first();
    this.usernameLabel = page.getByText('Username', { exact: true });
    this.passwordLabel = page.getByText('Password', { exact: true });
  }

  async gotoLoginPage(): Promise<void> {
    const targetUrl = process.env.URL || '/login';
    await this.navigate(targetUrl.startsWith('http') ? targetUrl : '/login');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async clearInputs(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async pressEnterInPassword(): Promise<void> {
    await this.passwordInput.press('Enter');
  }

  async clickBackground(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }

  async clickLoginCard(): Promise<void> {
    await this.loginCard.click({ position: { x: 5, y: 5 } });
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async clickUsernameLabel(): Promise<void> {
    await this.usernameLabel.click();
  }

  async hasHorizontalScrollBar(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
  }
}
