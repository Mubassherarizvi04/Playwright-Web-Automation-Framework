# Playwright Web Automation Framework

A UI + API test automation framework built with **Playwright** and **JavaScript**, using the **Page Object Model**, targeting a public e-commerce demo site and a public REST API sandbox. Built as a personal portfolio project to demonstrate practical QA automation skills — not a production project, and not a claim of prior professional Playwright experience.

## Overview

This project automates the core shopping journey of an e-commerce site (login, product search, product details, cart, checkout) and a set of REST API operations (GET/POST/PUT/PATCH/DELETE), then wires both into a GitHub Actions CI pipeline that runs on every push and pull request.

**Sites under test:**
- UI: [automationexercise.com](https://automationexercise.com) — a site purpose-built for automation practice, with a stable structure and a documented set of test cases.
- API: [reqres.in](https://reqres.in) — a public REST API sandbox designed for API-testing practice, with realistic status codes (200/201/204/404/401).

> Both are third-party demo services. If either changes its markup/API shape or goes offline, see **"Adapting to a different demo site"** below — this framework's architecture (POM, fixtures, config) doesn't change, only the locators/endpoints would.

## Tech Stack

| Category | Tool |
|---|---|
| Test runner / automation | Playwright Test (`@playwright/test`) |
| Language | JavaScript (Node.js) |
| Design pattern | Page Object Model |
| API testing | Playwright `request` fixture |
| Manual/exploratory API testing | Postman |
| CI/CD | GitHub Actions |
| Reporting | Playwright HTML Reporter, Trace Viewer |
| Version control | Git / GitHub |

## Features

- Page Object Model with 5 page classes (Login, Home, Product, Cart, Checkout)
- Custom Playwright fixtures that auto-inject page objects into tests
- UI test coverage: login (valid/invalid/empty), search (valid/invalid), product details, add-to-cart, cart quantity/price/removal, full checkout flow, checkout field validation
- API test coverage: GET, POST, PUT, PATCH, DELETE with both positive and negative cases, plus an auth/negative case (missing API key → 401)
- Cross-browser execution: Chromium, Firefox, WebKit
- Tagging strategy for `@smoke` vs `@regression` test runs
- Auto screenshot/video/trace capture on failure
- HTML report generation
- Environment-based configuration via `.env` (no secrets in source control)
- GitHub Actions workflow that installs dependencies, installs browsers, runs the full suite, and uploads the HTML report as a build artifact

## Framework Architecture

```
Playwright-Web-Automation-Framework/
│
├── tests/
│   ├── ui/                  # UI test specs (login, search, product, cart, checkout)
│   └── api/                 # API test specs
│
├── pages/                   # Page Object classes — locators + actions, no assertions
│   ├── LoginPage.js
│   ├── HomePage.js
│   ├── ProductPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
│
├── fixtures/
│   └── pageFixtures.js      # Extends Playwright's `test` to auto-inject page objects
│
├── utils/
│   └── testDataHelper.js    # Reusable data helpers (credentials, unique emails, etc.)
│
├── test-data/
│   └── users.json           # Static, non-sensitive test data
│
├── api/
│   └── apiEndpoints.js      # Centralized API URLs + shared headers
│
├── .github/
│   └── workflows/
│       └── playwright.yml   # CI pipeline definition
│
├── playwright.config.js     # Browsers, timeouts, retries, reporters, trace/video config
├── package.json
├── .gitignore
├── .env.example              # Template for required environment variables
└── README.md
```

**Why this structure?** Each folder has exactly one responsibility: `pages/` knows about the UI, `tests/` knows about scenarios, `api/` knows about endpoints, `utils/` knows about data. A test file never contains a raw CSS selector — that separation is what makes the suite maintainable as it grows, and it's the first thing most interviewers look for in a framework.

*(`test-results/`, `playwright-report/`, `screenshots/`, `videos/`, and `node_modules/` are all generated automatically when you run tests — they're gitignored and won't exist until you run the suite locally.)*

## Setup

### 1. Install prerequisites
- [Node.js](https://nodejs.org/) v18 or later (v20 recommended)
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

### 2. Clone and install
```bash
git clone https://github.com/<your-username>/Playwright-Web-Automation-Framework.git
cd Playwright-Web-Automation-Framework
npm install
npx playwright install --with-deps
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env`:
- `BASE_URL` — defaults to `https://automationexercise.com`, no change needed
- `API_BASE_URL` — defaults to `https://reqres.in/api`, no change needed
- `REQRES_API_KEY` — get a free key at https://reqres.in/signup (required, or every API test returns 401)
- `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` — create a free account on automationexercise.com yourself and put those credentials here (used by the "valid login" and checkout tests; those specific tests **skip automatically** if left blank)

## Running Tests

```bash
npx playwright test                 # run everything, headless
npx playwright test --headed        # watch the browser while it runs
npx playwright test tests/ui        # UI tests only
npx playwright test tests/api       # API tests only
npx playwright test tests/ui/login.spec.js   # a single file
npx playwright test -g "invalid email"       # a single test by name
npx playwright test --project=firefox        # a single browser
npx playwright test --grep @smoke            # smoke tests only
npx playwright test --grep @regression       # regression tests only
npx playwright show-report                   # open the last HTML report
```

Equivalent shortcuts are defined in `package.json` — e.g. `npm run test:headed`, `npm run test:smoke`.

## API Testing

API tests live in `tests/api/users-api.spec.js` and call `reqres.in` directly using Playwright's built-in `request` fixture — no browser is opened, so these run in milliseconds. Covered: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, plus a negative case for a missing/invalid API key (401) and a not-found case (404).

## Reports, Screenshots, Video & Trace

- After any run, view the interactive report: `npx playwright show-report`
- Failed tests automatically capture a screenshot, a video, and a **trace** (a full timeline of DOM snapshots, network calls and console logs)
- Open a trace for step-by-step debugging: `npx playwright show-trace test-results/<test-folder>/trace.zip`, or click "View trace" directly inside the HTML report

## CI/CD

`.github/workflows/playwright.yml` runs the full suite on every push and pull request to `main`. Before it will pass in your own fork, add these as **repository secrets** (Settings → Secrets and variables → Actions):
- `REQRES_API_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

The HTML report is uploaded as a downloadable build artifact on every run, pass or fail.

## Test Scenarios Covered

See [TEST_PLAN.md](./TEST_PLAN.md) for the full scope, and [INTERVIEW_PREP.md](./INTERVIEW_PREP.md) for how to explain this project's design decisions.

## Adapting to a Different Demo Site

Public demo sites occasionally change their markup or go offline. If that happens:
1. Update `BASE_URL` in `.env` (or `API_BASE_URL` for the API suite) — nothing else in the config needs to change.
2. Re-record locators using Playwright's codegen tool, which opens a browser and writes selector code as you click around:
   ```bash
   npx playwright codegen <new-site-url>
   ```
3. Update only the locators inside the relevant `pages/*.js` file — test files and fixtures don't need to change, since they only call page-object *methods*, not raw selectors. This isolation is one of the main reasons POM is worth the extra structure.
4. A solid documented alternative for the UI suite is [saucedemo.com](https://www.saucedemo.com/) (maintained by Sauce Labs specifically for automation practice) — note it doesn't have a search bar, so `tests/ui/search.spec.js` would need to be dropped or replaced with a sort/filter test instead.

## Future Improvements

- Add a `storageState` auth setup project so login runs once per suite instead of per test (faster checkout tests)
- Parameterize checkout tests to run once per browser × payment scenario
- Add visual regression testing with Playwright's screenshot comparison
- Add a lightweight SQL/data-validation module comparing API response fields against a local seed dataset
- Publish the HTML report to GitHub Pages after each CI run

## Disclaimer

This is a personal learning/portfolio project built against public demo services. It is not affiliated with automationexercise.com or reqres.in, and does not perform any destructive testing against real production systems.
