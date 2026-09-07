// tests/ui/product.spec.js

const { test, expect } = require('../../fixtures/pageFixtures');

test.describe('Product Details @regression', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.goto();
  });

  test('opening a product shows its detail page @smoke', async ({ productPage, page }) => {
    const names = await productPage.getVisibleProductNames();
    const firstProductName = names[0];

    await productPage.openProductByName(firstProductName);

    await expect(page).toHaveURL(/.*\/product_details\/\d+/);
    // Key product facts a shopper (and a QA test) should be able to verify.
    await expect(page.getByText('Availability:')).toBeVisible();
    await expect(page.getByText('Category:')).toBeVisible();
    await expect(page.locator('.product-information h2')).toBeVisible();
  });

  test('adding a product to the cart from the listing page updates the cart', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.addProductToCartByIndex(0);

    await cartPage.goto();

    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
  });
});
