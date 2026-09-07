// pages/CartPage.js

class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.cartRows = page.locator('#cart_info tbody tr');
    this.emptyCartMessage = page.getByText('Cart is empty!');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
  }

  async goto() {
    await this.page.goto('/view_cart');
  }

  async getItemCount() {
    return this.cartRows.count();
  }

  async getQuantityForRow(rowIndex = 0) {
    const qtyCell = this.cartRows.nth(rowIndex).locator('.cart_quantity button');
    return qtyCell.innerText();
  }

  async getPriceForRow(rowIndex = 0) {
    const priceCell = this.cartRows.nth(rowIndex).locator('.cart_price p');
    return priceCell.innerText();
  }

  async removeRow(rowIndex = 0) {
    const deleteButton = this.cartRows.nth(rowIndex).locator('.cart_delete a');
    await deleteButton.click();
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  async isEmpty() {
    return this.emptyCartMessage.isVisible();
  }
}

module.exports = { CartPage };
