// pages/HomePage.js
//
// Represents the home page: navigation bar + the entry point to Products
// (where search lives on automationexercise.com).

class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.signupLoginLink = page.getByRole('link', { name: /Signup \/ Login/i });
    this.productsLink = page.getByRole('link', { name: /Products/i });
    this.cartLink = page.getByRole('link', { name: /Cart/i });
    this.loggedInAsText = page.getByText(/Logged in as/i);
    this.logoutLink = page.getByRole('link', { name: /Logout/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async goToLogin() {
    await this.signupLoginLink.click();
  }

  async goToProducts() {
    await this.productsLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.logoutLink.click();
  }
}

module.exports = { HomePage };
