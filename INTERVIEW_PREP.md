# Interview Preparation

Questions and answers written specifically around the decisions made in **this** project, so every answer is something you can back up by opening the actual code.

---

## Playwright (20)

1. **Why did you choose Playwright over Selenium for this project?**
   Auto-waiting removes most flaky-wait issues I dealt with in Selenium, it tests Chromium/Firefox/WebKit from one API, and it ships built-in tracing, video, and HTML reporting without extra plugins.

2. **What is auto-waiting in Playwright?**
   Before interacting with an element, Playwright waits for it to be attached, visible, stable, and enabled — up to `actionTimeout` — instead of failing immediately if it's not ready yet.

3. **How do Playwright assertions differ from a single `if` check?**
   `expect(locator).toBeVisible()` retries automatically until it passes or times out, rather than checking once — this is what `expect.timeout` in `playwright.config.js` controls.

4. **How do you run a single test file?**
   `npx playwright test tests/ui/login.spec.js`.

5. **How do you run a single test by name?**
   `npx playwright test -g "invalid email"`.

6. **How do you run tests in a specific browser?**
   `npx playwright test --project=firefox`, matching the `projects` array in `playwright.config.js`.

7. **What's the difference between headless and headed mode?**
   Headless runs without a visible browser window (faster, used in CI); headed opens a real window so you can watch the test run — useful while debugging locally.

8. **How does Playwright generate an HTML report?**
   The `reporter: [['html', ...]]` entry in `playwright.config.js`; view it with `npx playwright show-report`.

9. **What is the Trace Viewer and when do you use it?**
   A recorded, scrubbable timeline of DOM snapshots, network calls, and console logs for a test run — I open it via the HTML report or `npx playwright show-trace` when a failure isn't obvious from the screenshot alone.

10. **Why is `trace: 'on-first-retry'` used instead of `'on'`?**
    Capturing a trace for every test (pass or fail) is expensive and unnecessary; capturing it only when a test fails and gets retried gives debugging evidence exactly when it's needed.

11. **What's the difference between `page.locator()` and `page.getByRole()`?**
    `getByRole` targets an element by its accessible role and name, matching how a user/screen reader identifies it — more resilient to markup changes than a raw CSS `locator()` string.

12. **Why avoid XPath when a Playwright locator is available?**
    Playwright's built-in locators (`getByRole`, `getByText`, `getByLabel`) are shorter, more readable, and tied to user-facing attributes rather than DOM structure, so they break less often when the page is restyled.

13. **What are Playwright fixtures?**
    A mechanism to provide tests with pre-built objects (like the built-in `page` and `request`, or my own `loginPage`/`cartPage` in `fixtures/pageFixtures.js`) instead of constructing them manually in every test.

14. **What's the difference between `test.beforeEach` and `test.beforeAll`?**
    `beforeEach` runs before every individual test (used here to navigate to a known page); `beforeAll` runs once before all tests in a file — this project only needed it for a one-time warning log in the API suite.

15. **How does Playwright handle parallel execution?**
    Tests run across multiple `workers` (separate browser processes) simultaneously; `playwright.config.js` sets `workers: undefined` locally (Playwright picks based on CPU cores) and caps it to `2` on CI to match smaller runners.

16. **What problems can arise from parallel tests?**
    Tests sharing mutable state (like two tests both assuming they're the only item in the cart) can interfere with each other; this project avoids that by having each test create its own cart item rather than relying on shared/prior state.

17. **How do you take a screenshot on failure vs manually?**
    `screenshot: 'only-on-failure'` in the config handles it automatically; a manual screenshot anywhere in a test would be `await page.screenshot({ path: 'screenshots/example.png' })`.

18. **How do you tag tests for smoke vs regression runs?**
    By putting `@smoke` or `@regression` in the test/describe title, then filtering with `npx playwright test --grep @smoke`.

19. **What's the `request` fixture used for?**
    Making pure HTTP calls (no browser) — used in `tests/api/users-api.spec.js` for all the REST API tests, which is why they run much faster than the UI tests.

20. **How would you debug a test that fails only in CI, not locally?**
    Download the HTML report/trace artifact uploaded by the GitHub Actions job, check for CI-specific differences (headless-only, fewer workers, network latency to a public demo site), and consider whether the retry (`retries: process.env.CI ? 1 : 0`) is masking a timing issue worth investigating.

---

## JavaScript (10)

1. **What's the difference between `const` and `let`?**
   `const` can't be reassigned after declaration (used for locators and endpoints that never change); `let` can be reassigned — this project barely needs it since most values are set once.

2. **Why use arrow functions in `api/apiEndpoints.js`?**
   They're concise for small, single-purpose functions like `(id) => \`${API_BASE_URL}/users/${id}\`` and don't need their own `this` binding.

3. **What's the difference between `require`/`module.exports` and `import`/`export`?**
   `require`/`module.exports` is Node's original CommonJS module system, used throughout this project; `import`/`export` is the newer ES Modules syntax — functionally similar, but you can't freely mix them without extra config.

4. **Why is almost every function in this project `async`?**
   Because nearly everything Playwright does (navigating, clicking, reading text) happens in the browser and returns a Promise; `async`/`await` lets that asynchronous code read like ordinary sequential code.

5. **What is a Promise, in plain terms?**
   An object representing a value that isn't available yet but will be (or will fail) — `await` pauses execution until it resolves, which is exactly what happens on every `await page.click(...)` call.

6. **Where is a class used in this project, and why?**
   Every file in `pages/` is a class — grouping locators (in the constructor) and actions (as methods) that all belong to one page, which is the core of the Page Object Model.

7. **What does `module.exports = { LoginPage }` do?**
   Exposes the `LoginPage` class so other files can `require('../pages/LoginPage')` and destructure it out — without this line, the class would be private to that file.

8. **How is a template literal used in this project?**
   `` `qa.automation.${timestamp}@mailinator.com` `` in `generateUniqueEmail()` — cleaner than manually concatenating strings with `+`.

9. **How does this project avoid hard-coding secrets in JavaScript files?**
   Credentials are read from `process.env` (populated by `.env` via the `dotenv` package) instead of being written directly into `.js` files.

10. **What's the difference between `==` and `===`, and which does this project use?**
    `===` checks value **and** type without coercion; `==` coerces types first. This project consistently uses `===`/`!==`-style strict comparisons implicitly through Playwright's `expect` matchers, avoiding the surprises `==` can introduce.

---

## API / REST (10)

1. **What's the difference between PUT and PATCH?**
   PUT replaces the entire resource (you must send every field); PATCH updates only the fields you send — demonstrated side-by-side in `tests/api/users-api.spec.js`.

2. **Why does a 204 response have no body?**
   By HTTP definition, "No Content" means the request succeeded but there's nothing to return — the DELETE test explicitly asserts the body length is zero.

3. **What does a 404 mean vs a 401?**
   404 = the resource doesn't exist (`GET /users/23`); 401 = the request wasn't authenticated at all (missing `x-api-key`) — different failure reasons, different fixes.

4. **How do you validate a JSON response body, not just the status code?**
   Parse it with `await response.json()` and assert on specific fields (`expect(body).toHaveProperty('email')`) — a 200 status code alone doesn't prove the response shape is correct.

5. **Why test with an invalid/missing header on purpose?**
   To prove the API fails *safely* — an API that silently accepts unauthenticated requests is a real security bug, not just a missing feature.

6. **What's idempotency, and which of these methods are idempotent?**
   Calling the same request multiple times produces the same end state. GET, PUT, and DELETE are idempotent; POST is not (each call typically creates a new resource) — this project's POST test creating a "new" user each run illustrates that.

7. **How would you test pagination?**
   Assert the response includes the expected `page` value and that `data` isn't empty for a valid page — `tests/api/users-api.spec.js` does exactly this for `?page=2`.

8. **What's the difference between a query parameter and a path parameter?**
   A path parameter identifies a specific resource (`/users/2`); a query parameter modifies the request (`?page=2`) — both appear in `api/apiEndpoints.js`.

9. **How do you keep API tests independent of each other?**
   Each test creates or targets its own data where possible (e.g., the POST test doesn't rely on the PUT test having run first) rather than chaining state across tests.

10. **Why test both a "happy path" and a missing-field POST request?**
    Because real APIs sometimes don't validate as strictly as you'd expect (as documented for reqres.in) — testing that explicitly is more honest than assuming server-side validation exists.

---

## Postman (10)

1. **How do you create a collection in Postman?**
   New → Collection, then add individual requests to it — grouping related endpoints together, the same organizing idea as `api/apiEndpoints.js`.

2. **How do you send a GET request with a query parameter in Postman?**
   Type the URL with `?page=2`, or add it in the Params tab — Postman keeps the URL and the params table in sync automatically.

3. **How do you send a POST request with a JSON body?**
   Body tab → raw → JSON, then type the payload, e.g. `{ "name": "Priya Sharma", "job": "QA Automation Engineer" }`.

4. **Where do you add a custom header like `x-api-key` in Postman?**
   The Headers tab of the request — key `x-api-key`, value your API key.

5. **What's a path parameter in Postman, and how do you set one?**
   A placeholder in the URL like `/users/:id` — Postman shows a matching field under Params where you fill in the actual value.

6. **How would you represent Authorization for a Bearer-token API in Postman vs this project's API key?**
   Postman's Authorization tab has a built-in "Bearer Token" type; this project's API uses a plain custom header instead, since reqres.in expects `x-api-key` rather than an `Authorization: Bearer` header.

7. **How do you write a basic test script in Postman?**
   In the Tests tab: `pm.test("Status code is 200", () => pm.response.to.have.status(200));` — syntax deliberately similar to Playwright/Jest-style `expect`.

8. **How do you assert on a JSON field in Postman?**
   `const body = pm.response.json(); pm.expect(body.data).to.be.an('array');`

9. **How do you run a whole Postman collection automatically (e.g. in CI)?**
   Export the collection and run it headlessly with Newman, Postman's CLI runner — conceptually the CI equivalent of what GitHub Actions does for this Playwright suite.

10. **When would you use Postman instead of writing a Playwright API test?**
    For fast, one-off exploratory testing of a new endpoint before committing to writing an automated test — Postman is great for the "let me just check what this returns" step; Playwright is for locking that behavior in permanently and running it on every commit.

---

## SQL (5)

1. **How would you check that data created via an API actually persisted?**
   `SELECT * FROM users WHERE email = '...';` and compare the row to the API response body.

2. **How would you find all currently active products?**
   `SELECT id, name FROM products WHERE status = 'active' ORDER BY name;`

3. **How would you count how many orders were placed today?**
   `SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE;`

4. **How would you confirm a cart's displayed total matches its line items?**
   A `JOIN` across `cart_items` and `products`, summing `price * quantity`, compared against the `carts` table's stored total.

5. **Why would a QA engineer compare UI, API, and database values for the same field?**
   A mismatch narrows down *where* a bug lives — if the DB is correct but the API response is wrong, the bug is in the API layer, not the data.

---

## Git / GitHub (5)

1. **What's the difference between `git add`, `git commit`, and `git push`?**
   `git add` stages changes for the next commit; `git commit` saves a snapshot of the staged changes locally with a message; `git push` uploads local commits to the remote (GitHub) repository.

2. **What does `git pull` do, and when do you need it?**
   Fetches and merges the latest changes from the remote into your local branch — needed before pushing if someone (or CI) has changed the remote since you last synced.

3. **Why is `.env` in `.gitignore` instead of committed?**
   It holds real credentials/API keys — committing it would leak secrets into GitHub history permanently, even if deleted in a later commit.

4. **How do you check what's about to be committed?**
   `git status` (which files changed) and `git diff` (exact line-level changes) before running `git commit`.

5. **How would you handle making a small fix after the project is already on GitHub?**
   Make the change locally, `git add <file>`, `git commit -m "message"`, `git push` — no branch is strictly required for a solo portfolio project, though a feature branch + pull request demonstrates awareness of team workflow.

---

## CI/CD / GitHub Actions (5)

1. **What triggers this project's GitHub Actions workflow?**
   Any `push` or `pull_request` targeting the `main` branch, defined in the `on:` block of `playwright.yml`.

2. **Why run `npx playwright install --with-deps` in CI but not always locally?**
   CI runners start with no browsers installed at all; `--with-deps` also installs the OS-level libraries those browsers need on a bare Ubuntu runner, which a local dev machine usually already has.

3. **How are secrets like the API key handled in CI without exposing them in the repo?**
   Stored as GitHub Actions **repository secrets** and referenced as `${{ secrets.REQRES_API_KEY }}` in the workflow — never hard-coded in `playwright.yml` itself.

4. **How do you retrieve the test report from a CI run?**
   The workflow uploads it via `actions/upload-artifact`, so it's downloadable from the specific run's page in the Actions tab, even if the run failed.

5. **What would you add to make this pipeline more production-like?**
   Separate jobs per browser to run in parallel, a required-status-check on pull requests before merge, and publishing the HTML report to GitHub Pages for a shareable link instead of a downloadable zip.

---

## Page Object Model / Framework Design (5)

1. **Why did you use POM instead of writing locators directly in tests?**
   So a markup change only requires updating one page-object file instead of every test that touches that page — `pages/LoginPage.js` is the single source of truth for login-page locators.

2. **How do you decide what belongs in a page object vs a test file?**
   Page objects hold locators and *how* to perform an action (e.g., `login(email, password)`); tests hold the scenario and the assertions (*what* should be true afterward) — page objects never contain `expect()`.

3. **Why is `ProductPage.js` used for both the product listing and search results instead of splitting them?**
   They share the same DOM structure and locators on this site; splitting them would duplicate code without adding clarity — POM is a judgment call about what's actually a distinct "page," not a rule to split by URL.

4. **What's the purpose of `fixtures/pageFixtures.js`?**
   It extends Playwright's `test` so every test can just ask for `loginPage`/`cartPage`/etc. as parameters instead of manually writing `new LoginPage(page)` at the top of every file.

5. **How would this framework scale to 200 tests instead of 20?**
   The structure doesn't change — more `tests/ui/*.spec.js` files, more page-object methods as needed, and the `@smoke`/`@regression` tagging strategy already in place to selectively run subsets instead of the full suite on every change.

---

## Practical / "show me" questions

**"Show me your Playwright project."**
Walk through: `README.md` → folder structure → open `pages/LoginPage.js` to show a page object → open `tests/ui/login.spec.js` to show how the test reads → run `npx playwright test --headed` live if possible → open the HTML report.

**"Why did you use POM?"** — see Framework Design Q1 above.

**"How do you locate an element?"** — see Playwright Q11–Q12 above; be ready to open DevTools/inspector live and point at a `data-qa` attribute.

**"How does Playwright auto-wait?"** — see Playwright Q2.

**"How do you handle a failed test?"** — see Learning Notes section 7 (HTML report → trace viewer → headed reproduction → root-cause before "fixing" by increasing a timeout).

**"How do you perform API testing?"** — see API Q1–Q10; be ready to open `tests/api/users-api.spec.js` and explain one GET and one POST test line by line.

**"Difference between PUT and PATCH?"** — see API Q1.

**"How did you use AI while building this project?"** — see `LEARNING_NOTES.md` section 12; be specific and honest (skeleton generation, locator suggestions, debugging help) and be ready to explain what you personally verified rather than blindly accepted.

**"How would you run regression tests?"** — `npx playwright test --grep @regression`.

**"How would you integrate Playwright with CI/CD?"** — see CI/CD Q1–Q5; walk through `.github/workflows/playwright.yml` section by section.

---

## Project Explanation — 60 seconds

"I built a Playwright automation framework in JavaScript to practice the exact skills this role needs, since my hands-on background is in Selenium and Java. It automates the core shopping flow — login, search, product details, cart, and checkout — on a public demo e-commerce site, using the Page Object Model so locators and test logic stay separate. It also has a REST API suite covering GET, POST, PUT, PATCH, and DELETE against a public API sandbox, with both valid and invalid scenarios. Everything runs cross-browser through Playwright's config, and I wired it into a GitHub Actions pipeline that runs the full suite and uploads an HTML report on every push. It's a personal project, not professional experience, but it's fully runnable and I can walk through any part of it."

## Project Explanation — 2 minutes

"For this role I wanted something that actually demonstrated the specific stack listed in the job description — Playwright, JavaScript, REST API testing, Postman, SQL, GitHub, CI/CD — rather than just describing my Selenium background and hoping it transfers. So I built a framework from scratch: a Page Object Model with separate classes for the login page, home page, product page, cart, and checkout, so every test file reads like a plain-English scenario instead of being full of CSS selectors.

On the UI side, I covered valid and invalid login, product search with both a real result and a zero-result case, adding to cart and verifying quantity and price, and a full checkout flow including a negative case where required payment fields are left empty. On the API side, I used Playwright's request fixture — no browser needed — to test all five REST methods against a public API sandbox, including negative cases like a 404 for a missing user and a 401 when the API key is left off, which was actually a good lesson in reading a real API's authentication requirements instead of assuming a demo API is always open.

I also set it up with environment variables so no credentials are hard-coded, cross-browser config for Chromium, Firefox, and WebKit, and a GitHub Actions workflow that installs everything fresh and runs the suite on every push, uploading the HTML report as an artifact either way. I used AI tools like Claude and Copilot the way I'd expect to on the job — for a first draft of test skeletons, for debugging error messages, and for locator suggestions — but I verified everything myself against the real site rather than trusting generated code blindly. I don't have professional Playwright experience yet, but this is fully runnable, it's on my GitHub, and I can explain and defend every design decision in it."

---

## Resume Bullet Points

- Built a Playwright + JavaScript UI/API test automation framework using Page Object Model, covering login, search, cart, and checkout flows with positive and negative test scenarios across Chromium, Firefox, and WebKit.
- Automated REST API testing (GET/POST/PUT/PATCH/DELETE) with Playwright's request fixture, validating status codes, response schemas, and authentication failure cases against a public API sandbox; reproduced key requests in Postman with custom test scripts.
- Implemented a GitHub Actions CI/CD pipeline to run the full regression suite and publish HTML test reports on every push/pull request, with environment-based configuration to keep credentials out of source control.
