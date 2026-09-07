// pages/ProductPage.js
//
// Covers TWO related screens (product listing + search results) because
// they share the same locators and structure on this site. A Page Object
// can represent a logical "area" of the app, not strictly one URL — the
// judgment call is: does splitting it further actually add clarity?
// Here it doesn't, so we keep them together.

class ProductPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsTitle = page.getByText('Searched Products');

    // Product cards on the listing/search-results grid
    this.productCards = page.locator('.product-image-wrapper');
    this.productNames = page.locator('.productinfo p');

    // "View Product" appears on hover per card; we scope it per card in methods below.
  }

  async goto() {
    await this.page.goto('/products');
  }

  async searchProduct(productName) {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  async getVisibleProductCount() {
    return this.productCards.count();
  }

  async getVisibleProductNames() {
    return this.productNames.allTextContents();
  }

  /**
   * Opens the first product card whose visible name contains the given text.
   * Demonstrates filtering a locator by text instead of hard-coding an index.
   */
  async openProductByName(partialName) {
    const card = this.page
      .locator('.product-image-wrapper')
      .filter({ hasText: partialName })
      .first();
    await card.getByRole('link', { name: /View Product/i }).click();
  }

  /**
   * Adds the Nth product card (0-indexed) to the cart directly from the
   * listing grid, then dismisses the "added to cart" confirmation modal.
   */
  async addProductToCartByIndex(index = 0) {
    const card = this.productCards.nth(index);
    await card.hover();
    await card.getByRole('link', { name: /Add to cart/i }).click();
    // A modal appears after adding — close it before continuing.
    const continueShoppingButton = this.page.getByRole('button', { name: /Continue Shopping/i });
    if (await continueShoppingButton.isVisible().catch(() => false)) {
      await continueShoppingButton.click();
    }
  }
}

module.exports = { ProductPage };
