// pages/CheckoutPage.js

class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.addressDetailsHeading = page.getByText('Address Details');
    this.reviewOrderHeading = page.getByText('Review Your Order');
    this.orderCommentBox = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.getByRole('link', { name: /Place Order/i });

    // Payment step
    this.nameOnCardInput = page.locator('[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('[data-qa="card-number"]');
    this.cvcInput = page.locator('[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('[data-qa="expiry-year"]');
    this.payAndConfirmButton = page.locator('[data-qa="pay-button"]');

    this.orderConfirmationText = page.getByText('Congratulations! Your order has been confirmed!');
    this.orderPlacedError = page.getByText(/required/i);
  }

  async isAddressStepVisible() {
    return this.addressDetailsHeading.isVisible();
  }

  async addOrderComment(comment) {
    await this.orderCommentBox.fill(comment);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  /**
   * Fills the payment form. Uses well-known test card values — never real
   * card data — since this demo site does not process real payments.
   */
  async fillPaymentDetails({ name, cardNumber, cvc, expiryMonth, expiryYear }) {
    await this.nameOnCardInput.fill(name);
    await this.cardNumberInput.fill(cardNumber);
    await this.cvcInput.fill(cvc);
    await this.expiryMonthInput.fill(expiryMonth);
    await this.expiryYearInput.fill(expiryYear);
  }

  async confirmPayment() {
    await this.payAndConfirmButton.click();
  }

  async isOrderConfirmed() {
    return this.orderConfirmationText.isVisible();
  }
}

module.exports = { CheckoutPage };
