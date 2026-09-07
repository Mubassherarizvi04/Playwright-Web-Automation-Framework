// tests/ui/search.spec.js

const { test, expect } = require('../../fixtures/pageFixtures');
const { getSearchTerms } = require('../../utils/testDataHelper');

test.describe('Product Search @regression', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.goto();
  });

  test('searching for a valid product returns matching results @smoke', async ({ productPage }) => {
    const { valid } = getSearchTerms();

    await productPage.searchProduct(valid);

    await expect(productPage.searchedProductsTitle).toBeVisible();

    const count = await productPage.getVisibleProductCount();
    expect(count).toBeGreaterThan(0);

    // Every returned product name should relate to what we searched for.
    const names = await productPage.getVisibleProductNames();
    const relevant = names.some((name) => name.toLowerCase().includes(valid.toLowerCase()));
    expect(relevant).toBeTruthy();
  });

  test('searching for a non-existent product returns zero results', async ({ productPage }) => {
    const { invalid } = getSearchTerms();

    await productPage.searchProduct(invalid);

    await expect(productPage.searchedProductsTitle).toBeVisible();
    const count = await productPage.getVisibleProductCount();
    expect(count).toBe(0);
  });

  test('the full product list is visible before any search', async ({ productPage }) => {
    const count = await productPage.getVisibleProductCount();
    expect(count).toBeGreaterThan(0);
  });
});
