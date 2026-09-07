// pages/LoginPage.js
//
// PAGE OBJECT MODEL (POM) — WHY IT MATTERS:
// Instead of writing raw locators inside every test ("page.locator('input[data-qa=login-email]')")
// we describe the page ONCE as a class: what's on it (locators) and what you
// can do with it (methods). Tests then read like plain English:
//   await loginPage.login(email, password);
// If automationexercise.com changes its markup tomorrow, we fix ONE file
// (this one) instead of touching every test that logs in.

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators — grouped at the top of the class so they're easy to find
    // and update. Prefer data-qa / role-based locators over brittle CSS.
    this.emailInput = page.locator('[data-qa="login-email"]');
    this.passwordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorMessage = page.getByText('Your email or password is incorrect!');

    // Signup box (same page, left-hand side on automationexercise.com)
    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.getByText('Email Address already exist!');

    this.loggedInAsText = page.getByText(/Logged in as/i);
  }

  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Logs in with the given credentials.
   * Kept as ONE reusable method so every test (valid, invalid, empty)
   * calls the exact same code path — reducing duplication and drift.
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name, email) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  async isLoginErrorVisible() {
    return this.loginErrorMessage.isVisible();
  }

  async isLoggedIn() {
    return this.loggedInAsText.isVisible();
  }
}

module.exports = { LoginPage };
