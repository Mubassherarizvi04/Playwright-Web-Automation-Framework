// tests/ui/login.spec.js
//
// LOGIN test suite.
// Notice: this file has almost no locators in it. It reads like a set of
// scenarios because all the "how do I click X" detail lives in LoginPage.
// That's the entire point of the Page Object Model.

const { test, expect } = require('../../fixtures/pageFixtures');
const { getInvalidCredentials, getValidCredentials } = require('../../utils/testDataHelper');

test.describe('Login @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Runs before EVERY test in this file — keeps each test independent
    // (no test depends on a previous test leaving the browser in a certain state).
    await loginPage.goto();
  });

  test('valid user can log in successfully @smoke', async ({ loginPage }) => {
    const { email, password } = getValidCredentials();

    // Skip gracefully in environments where no test account has been
    // configured yet, rather than failing with a confusing error.
    test.skip(!email || !password, 'Set TEST_USER_EMAIL / TEST_USER_PASSWORD in .env to run this test.');

    await loginPage.login(email, password);

    await expect(loginPage.loggedInAsText).toBeVisible();
    await expect(loginPage.page).toHaveURL(/.*\/logged/i);
  });

  test('invalid email/password shows an error message @smoke', async ({ loginPage }) => {
    const { email, password } = getInvalidCredentials();

    await loginPage.login(email, password);

    await expect(loginPage.loginErrorMessage).toBeVisible();
    // Still on the login page — an invalid login must not navigate away.
    await expect(loginPage.page).toHaveURL(/.*\/login/);
  });

  test('empty credentials do not submit the form', async ({ loginPage }) => {
    await loginPage.login('', '');

    // Native "required" HTML validation keeps the browser on the same page
    // and never fires our custom error text — asserting the URL confirms
    // the form genuinely blocked submission instead of silently succeeding.
    await expect(loginPage.page).toHaveURL(/.*\/login/);
    await expect(loginPage.loginErrorMessage).toBeHidden();
  });

  test('signing up with an already-registered email shows an error', async ({ loginPage }) => {
    const { email } = getValidCredentials();
    test.skip(!email, 'Set TEST_USER_EMAIL in .env to run this test.');

    await loginPage.startSignup('Existing User', email);

    await expect(loginPage.signupErrorMessage).toBeVisible();
  });
});
