// tests/ui/checkout.spec.js
//
// Checkout on this demo site requires a logged-in account, so these tests
// need TEST_USER_EMAIL / TEST_USER_PASSWORD configured in .env (see
// README > "Adapting to a different demo site" if you don't have one yet).

const { test, expect } = require('../../fixtures/pageFixtures');
const { getValidCredentials } = require('../../utils/testDataHelper');

test.describe('Checkout @regression', () => {
  test.beforeEach(async ({ loginPage, productPage }) => {
    const { email, password } = getValidCredentials();
    test.skip(!email || !password, 'Set TEST_USER_EMAIL / TEST_USER_PASSWORD in .env to run checkout tests.');

    await loginPage.goto();
    await loginPage.login(email, password);
    await productPage.goto();
    await productPage.addProductToCartByIndex(0);
  });

  test('valid checkout flow ends in an order confirmation @smoke', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.isAddressStepVisible()).resolves.toBeTruthy();

    await checkoutPage.addOrderComment('Automated test order — please ignore.');
    await checkoutPage.placeOrder();

    // Well-known dummy card values — this site never charges real cards.
    await checkoutPage.fillPaymentDetails({
      name: 'QA Automation',
      cardNumber: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '2030',
    });
    await checkoutPage.confirmPayment();

    await expect(checkoutPage.orderConfirmationText).toBeVisible();
  });

  test('submitting payment with required fields empty is blocked', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();

    // Leave every payment field empty and try to submit anyway.
    await checkoutPage.confirmPayment();

    // The order must NOT be confirmed when required fields are missing.
    await expect(checkoutPage.orderConfirmationText).toBeHidden();
  });
});
