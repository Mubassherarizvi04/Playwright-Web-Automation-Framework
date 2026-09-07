# Learning Notes

Reference material for understanding — and defending in an interview — every technical decision in this project. Read this alongside the actual code; each section points at the file where the concept is used.

---

## 1. JavaScript fundamentals used in this project

| Concept | Where it's used here | Quick explanation |
|---|---|---|
| `const` / `let` | Everywhere | `const` for values that don't get reassigned (locators, endpoints); `let` only when a variable must change. This project never needs `var`. |
| Strings, numbers, booleans | `utils/testDataHelper.js` | `TEST_USER_EMAIL` is a string; `getVisibleProductCount()` returns a number; `isLoggedIn()` returns a boolean. |
| Arrays | `productPage.getVisibleProductNames()` | Returns an array of strings; tests use `.length`, `.some()`, `.includes()` on it. |
| Objects | `test-data/users.json`, `fillPaymentDetails({...})` | Grouping related data (name, cardNumber, cvc...) into one object instead of four separate function parameters. |
| Functions & arrow functions | `utils/testDataHelper.js` | `function getInvalidCredentials() {}` (named function) vs. `(id) => \`...${id}\`` (arrow function used for one-line endpoint builders in `api/apiEndpoints.js`). |
| Classes & constructors | Every file in `pages/` | Each Page Object is a `class` with a `constructor(page)` that receives the Playwright `page` and stores locators on `this`. |
| Modules: `require` / `module.exports` | Every file | Node.js's CommonJS module system — each file explicitly exports what other files are allowed to import, keeping boundaries clear. |
| `async` / `await` | Every test and every page-object method | Almost everything Playwright does (clicking, filling, navigating) happens in the browser and takes time, so it returns a **Promise**. `await` pauses the function until that Promise resolves. |
| Promises | Implicit under `await`, explicit in fixture `use()` calls | `await use(new LoginPage(page))` in `fixtures/pageFixtures.js` is Playwright's fixture lifecycle — it "yields" the object to the test and resumes after the test finishes (for cleanup, if any were needed). |
| `try` / `catch` | `productPage.addProductToCartByIndex()` uses `.catch(() => false)` on a visibility check | Used sparingly — Playwright's own retrying assertions handle most error cases without manual try/catch. |
| Loops & conditionals | `if (await continueShoppingButton.isVisible()...)` in `ProductPage.js` | Kept minimal on purpose — most "looping" in Playwright is done through locators matching multiple elements (`.first()`, `.nth()`, `.filter()`) rather than manual `for` loops. |
| Template literals | `api/apiEndpoints.js`, `generateUniqueEmail()` | `` `${API_BASE_URL}/users/${id}` `` — cleaner than string concatenation with `+`. |

---

## 2. Why Page Object Model?

Without POM, every test file re-types the same locators and the same multi-step actions. Two problems follow:
1. **Duplication** — the same `page.locator(...)` string appears in 10 different test files.
2. **Fragility** — when the site's markup changes, you have to find and fix it in all 10 places, and it's easy to miss one.

POM solves both by giving each page/screen its own class: locators live in the `constructor`, and any multi-step action (like `login()`) becomes a single method. Tests then call methods, not selectors — `tests/ui/login.spec.js` never contains the string `data-qa="login-email"`. If the site changes, exactly one file (`pages/LoginPage.js`) needs to change.

---

## 3. Locators — what and why

| Locator | Used for | Why |
|---|---|---|
| `page.getByRole('link', { name: /Products/i })` | Nav links, buttons | Matches how a real user (and screen reader) identifies the element — resilient to CSS/class changes. |
| `page.getByText('Cart is empty!')` | Confirmation/error text | Directly expresses intent: "this text should be visible." |
| `page.locator('[data-qa="login-email"]')` | Form fields on automationexercise.com | The site ships dedicated `data-qa` test hooks — the most stable option when available, because it's not tied to styling classes that change with a redesign. |
| `page.locator('#search_product')` | Search input (no `data-qa` hook exists here) | Falls back to a stable `id` attribute. |

**Why not XPath here?** Every element needed is reachable through a role, visible text, or a stable attribute — XPath is a fallback for when none of those exist, and using it by default makes tests harder to read and more brittle to layout changes.

---

## 4. Waiting & synchronization (why there's no `sleep()` anywhere)

Playwright **auto-waits**: before clicking or filling an element, it waits for that element to be attached, visible, stable (not animating), and enabled — up to `actionTimeout` (10s in `playwright.config.js`). Assertions like `expect(locator).toBeVisible()` also **retry** automatically for up to `expect.timeout` (5s) instead of checking once.

This eliminates the single biggest cause of flaky Selenium suites: hard-coded `Thread.sleep()` waits that are either too short (test fails intermittently) or too long (test suite becomes slow). The only time an explicit wait is ever justified in Playwright is waiting on a specific network response or a custom condition Playwright can't infer on its own (`page.waitForResponse(...)`), and this project doesn't need one.

**Other common causes of flakiness this project guards against:**
- Shared mutable state between tests → each test creates its own cart item rather than assuming another test already did
- Tests depending on execution order → every test calls `beforeEach` to reach a known starting state
- Race conditions after form submission → assertions on the *resulting UI state* (e.g., "cart is empty" after delete) instead of guessing a wait time

---

## 5. Assertions used and what they check

| Assertion | Meaning |
|---|---|
| `toBeVisible()` / `toBeHidden()` | Element is/isn't rendered and visible in the viewport |
| `toHaveText()` / `toContainText()` | Exact vs. partial text match |
| `toHaveValue()` | An input's current value |
| `toHaveURL()` | Current page URL matches a string or regex |
| `toBeEnabled()` / `toBeDisabled()` | Interactive state of a control |
| `toHaveCount()` | Number of elements matching a locator |

**Expected vs. actual:** every assertion states the *expected* condition first (`expect(loginPage.loggedInAsText).toBeVisible()`), and Playwright compares that against the *actual* DOM state, retrying until it matches or the timeout expires — this is different from a single point-in-time check in older frameworks.

---

## 6. Hooks & fixtures

- `test.beforeEach()` — runs before every test in a `describe` block; used here to navigate to a known starting page so tests don't depend on each other's order.
- `test.describe()` — groups related tests (and lets tags like `@regression` apply to the whole group via the block name).
- **Custom fixtures** (`fixtures/pageFixtures.js`) — extend Playwright's built-in `test` so that `loginPage`, `homePage`, `productPage`, `cartPage`, and `checkoutPage` are automatically constructed and injected into any test that names them as a parameter. This is the same mechanism Playwright uses internally for its own `page` and `request` fixtures.
- `request` fixture — used directly in `tests/api/users-api.spec.js` for API calls; no browser is spun up, which is why the API suite runs so much faster than the UI suite.

`beforeAll`/`afterAll` weren't needed in this project (no expensive one-time setup like seeding a database), but the API suite's `beforeAll` is used to print a one-time warning if `REQRES_API_KEY` is missing.

---

## 7. Debugging a failed test (interview-ready answer)

1. Open the HTML report: `npx playwright show-report`
2. Click the failed test — see the exact assertion that failed and the screenshot at that moment
3. Click "View trace" to open the Trace Viewer: a scrubbable timeline showing every action, the DOM snapshot at each step, network requests, and console logs
4. Reproduce locally in headed mode: `npx playwright test <file> --headed --debug` to step through with Playwright Inspector
5. Decide: is this a real bug, a locator that needs updating, or a flaky/timing issue? Fix accordingly rather than just increasing timeouts

---

## 8. HTTP methods & status codes (interview-friendly)

| Method | Purpose | Example in this project |
|---|---|---|
| GET | Read a resource, no side effects | `GET /users?page=2` — list users |
| POST | Create a new resource | `POST /users` — create a user |
| PUT | Replace a resource entirely | `PUT /users/2` — full update |
| PATCH | Update part of a resource | `PATCH /users/2` — update just `job` |
| DELETE | Remove a resource | `DELETE /users/2` |

| Code | Meaning | Seen in this project |
|---|---|---|
| 200 OK | Successful GET/PUT/PATCH | GET list, PUT/PATCH update |
| 201 Created | Successful POST | POST create user |
| 204 No Content | Successful DELETE, nothing to return | DELETE user |
| 400 Bad Request | Malformed request | Would apply to a real API rejecting a bad payload |
| 401 Unauthorized | Missing/invalid credentials | Request to reqres.in without `x-api-key` |
| 403 Forbidden | Authenticated but not allowed | Not exercised here; conceptually: valid key, wrong permission |
| 404 Not Found | Resource doesn't exist | `GET /users/23` |
| 409 Conflict | Request conflicts with current state | Conceptually: creating a duplicate unique resource |
| 500 Internal Server Error | Server-side failure | Not exercised — that's the server's bug, not something a client test induces deliberately |

---

## 9. Postman equivalent of the API tests

Every request in `tests/api/users-api.spec.js` can be reproduced manually in Postman:

1. **Create a Collection** — "Users API" — to group related requests, the same way `api/apiEndpoints.js` groups URLs.
2. **GET request** — `GET https://reqres.in/api/users?page=2`, header `x-api-key: <your key>`.
3. **POST request** — `POST https://reqres.in/api/users`, headers `Content-Type: application/json` + `x-api-key`, body (raw JSON): `{ "name": "Priya Sharma", "job": "QA Automation Engineer" }`.
4. **Path parameter example** — `/users/2` — `2` is a path parameter identifying which user.
5. **Query parameter example** — `?page=2` — controls pagination.
6. **Authorization concept** — this API uses a custom header (`x-api-key`) rather than Postman's built-in Bearer Token auth type; both achieve the same goal of proving the caller is allowed to make the request.
7. **Basic Postman test script** (Tests tab, JavaScript):
   ```javascript
   pm.test("Status code is 200", function () {
     pm.response.to.have.status(200);
   });

   pm.test("Response has a data array", function () {
     const body = pm.response.json();
     pm.expect(body.data).to.be.an('array');
   });
   ```

**Playwright API testing vs. Postman:**
| | Playwright | Postman |
|---|---|---|
| Best for | Automated, version-controlled, CI-integrated suites | Fast manual/exploratory testing, sharing requests with a team |
| Assertions | JavaScript (`expect`) | JavaScript (`pm.test`) — syntax is deliberately similar |
| Runs in CI | Yes, natively | Yes, via Newman (Postman's CLI runner) |
| UI vs API in one tool | Both, same framework | API only |

---

## 10. SQL concepts for backend data validation

Neither demo service in this project exposes a real database, so no live SQL runs here — but a QA engineer is often asked to validate that what the UI/API shows matches what's actually stored. Example queries you'd write against a real backend:

```sql
-- Confirm a user created via the API actually persisted
SELECT * FROM users WHERE email = 'priya.sharma@example.com';

-- Confirm only active products appear in the UI's product list
SELECT id, name, status FROM products WHERE status = 'active' ORDER BY name;

-- Count orders placed today, to cross-check an "orders today" dashboard metric
SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE;

-- Confirm a cart total matches the sum of its line items (join products to cart_items)
SELECT c.cart_id, SUM(p.price * ci.quantity) AS calculated_total
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
JOIN carts c ON c.id = ci.cart_id
WHERE c.cart_id = 123
GROUP BY c.cart_id;
```

**The three-way comparison a QA engineer often does:** UI shows a value → API response should match it exactly → the database row behind that API response should match both. A mismatch tells you *which layer* introduced the bug (frontend formatting, API logic, or data itself).

---

## 11. Observability — what a fresher needs to know

- **Logs** — timestamped records of what happened ("user X logged in", "payment failed: card declined"). First place to look when debugging a production issue.
- **Metrics** — numeric measurements over time (requests per second, error rate, response time). Good for spotting *that* something's wrong and *when* it started.
- **Traces** — the path a single request takes across multiple services (e.g., checkout → payment service → inventory service), showing where time was spent or where it failed. Conceptually the same idea as Playwright's own Trace Viewer, but for a distributed backend instead of a browser session.
- **Datadog** — a commercial observability platform that collects logs, metrics, and traces from applications/infrastructure into one dashboard with alerting. A QA engineer might use it to correlate "this test started failing" with "this deploy went out" or "error rate spiked."
- **Langfuse** — an open-source observability tool specifically for LLM/AI applications — tracing prompts, model responses, latency, and cost per call. Relevant if the product under test has AI features; conceptually it's "Datadog, but for LLM calls."
- **Monitoring** — the broader practice of continuously watching logs/metrics/traces (often via dashboards + alerts) so problems are caught before or as they happen, rather than only being discovered from a bug report.

---

## 12. Using AI assistants responsibly on this project

AI tools (ChatGPT, Claude, GitHub Copilot) were used while building this project the way a QA engineer is expected to use them on the job:

| Task | How AI helped | What I verified myself |
|---|---|---|
| Test skeletons | Generated a first draft of a `describe`/`test` structure | Read every assertion and confirmed it actually matched the app's real behavior, not an assumption |
| Understanding Playwright APIs | Asked "what's the difference between `toHaveText` and `toContainText`" instead of guessing | Confirmed against the official Playwright docs |
| Debugging failures | Pasted a stack trace and asked for likely causes | Reproduced the fix locally before trusting it |
| Improving locators | Asked for a more resilient locator than a brittle CSS class | Ran it against the real page to confirm it actually matched the right element |
| Test data | Asked for realistic sample data | Made sure no real/sensitive data was ever used |
| Code review | Asked "what would a senior QA engineer flag in this file" | Applied the useful suggestions, rejected the ones that added complexity without value |
| Explaining errors | Pasted an error message for a plain-English explanation | Cross-checked against Playwright's own error output/docs |

**How I verify AI-generated code instead of blindly copying it:**
1. Run it — does it pass, and does it actually exercise the behavior it claims to?
2. Deliberately break the app logic mentally and check the test would actually catch it (a test that always passes regardless of app behavior is worse than no test)
3. Read every locator against the real DOM (via `codegen` or browser inspector) rather than trusting it looks plausible
4. Check for deprecated APIs or made-up methods that don't exist in the installed Playwright version
