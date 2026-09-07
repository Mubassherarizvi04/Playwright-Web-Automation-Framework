// utils/testDataHelper.js
//
// Small, framework-agnostic helper functions. Keeping this separate from
// the page objects and tests demonstrates separation of concerns: page
// objects know about the UI, tests know about scenarios, and this file
// just knows about data.

const users = require('../test-data/users.json');

/**
 * Returns credentials that should always fail login.
 * Kept as a function (not a raw export) so tests read intent clearly:
 * getInvalidCredentials() is more descriptive than users.invalidLogin.
 */
function getInvalidCredentials() {
  return users.invalidLogin;
}

/**
 * Returns the "valid" test account credentials from environment variables.
 * These come from .env (gitignored) instead of test-data/users.json because
 * they are account-specific secrets, not static test fixtures.
 */
function getValidCredentials() {
  return {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  };
}

/**
 * Generates a unique email for signup-style tests so re-running the suite
 * doesn't collide with "email already exists" errors from a previous run.
 * Demonstrates template literals + Date.now() for uniqueness.
 */
function generateUniqueEmail() {
  const timestamp = Date.now();
  return `qa.automation.${timestamp}@mailinator.com`;
}

function getSearchTerms() {
  return users.searchTerms;
}

module.exports = {
  getInvalidCredentials,
  getValidCredentials,
  generateUniqueEmail,
  getSearchTerms,
};
