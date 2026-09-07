// tests/ui/cart.spec.js

const { test, expect } = require('../../fixtures/pageFixtures');

test.describe('Shopping Cart @regression', () => {
  test('added product appears in the cart with a quantity and price @smoke', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto();
    await productPage.addProductToCartByIndex(0);

    await cartPage.goto();

    await expect(cartPage.cartRows.first()).toBeVisible();

    const quantity = await cartPage.getQuantityForRow(0);
    expect(Number(quantity)).toBeGreaterThan(0);

    const price = await cartPage.getPriceForRow(0);
    expect(price).toMatch(/Rs\.\s?\d+/);
  });

  test('removing a product empties the cart', async ({ productPage, cartPage }) => {
    await productPage.goto();
    await productPage.addProductToCartByIndex(0);

    await cartPage.goto();
    await cartPage.removeRow(0);

    // Removal is done via an async request behind the scenes — asserting on
    // the resulting UI state (instead of a hard-coded wait) is what makes
    // this reliable. See LEARNING_NOTES.md > "Waiting and synchronization".
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});
