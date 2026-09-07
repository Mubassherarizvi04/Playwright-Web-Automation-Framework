// fixtures/pageFixtures.js
//
// WHY FIXTURES?
// Without this, every test file would start with 5 lines like:
//   const loginPage = new LoginPage(page);
//   const homePage = new HomePage(page);
//   ...
// A Playwright FIXTURE lets us extend the base `test` object so each page
// object is created automatically and injected as a parameter — same idea
// as the built-in `page` fixture, but for OUR page objects.
//
// Usage in a test file:
//   const { test, expect } = require('../../fixtures/pageFixtures');
//   test('...', async ({ loginPage, homePage }) => { ... });

const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const test = base.test.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

module.exports = { test, expect: base.expect };
