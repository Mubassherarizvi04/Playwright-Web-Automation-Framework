# Test Plan — Playwright Web Automation Framework

## 1. Scope

**In scope:**
- UI regression testing of the core shopping journey on automationexercise.com: login, product search, product details, cart, checkout
- REST API testing of user CRUD operations on reqres.in: GET, POST, PUT, PATCH, DELETE
- Cross-browser execution across Chromium, Firefox, and WebKit
- CI execution via GitHub Actions on every push/PR to `main`

**Out of scope:**
- Performance/load testing
- Security penetration testing
- Mobile-native app testing (mobile *web* viewport testing could be added later via Playwright's device emulation)
- Payment gateway testing beyond form validation (the demo site does not process real payments)
- Database-level testing (no real database is exposed by either demo service — see `LEARNING_NOTES.md` for how this would work with real backend access)

## 2. Test Types

| Type | Description | Example |
|---|---|---|
| Functional | Confirms a feature behaves as intended | Adding a product updates the cart |
| Regression | Re-run on every change to catch breakage | Full suite, tagged `@regression` |
| Smoke | Fast, high-value subset run first | Tagged `@smoke` — login, search, one API call each |
| API | Validates backend contracts directly | Status codes + response body shape |
| Negative | Confirms the system fails safely | Invalid login, missing required field, 404/401 |

## 3. Browser Coverage

| Browser | Engine | Priority |
|---|---|---|
| Chromium | Blink | Primary — run on every commit |
| Firefox | Gecko | Secondary — run on every commit |
| WebKit | WebKit (Safari) | Secondary — run on every commit |

All three run in the same CI job via Playwright's `projects` configuration — no test code is duplicated per browser.

## 4. Positive Scenarios

- Valid login succeeds and lands on the account page
- Searching an existing product returns matching, relevant results
- Opening a product shows correct detail fields (name, category, availability)
- Adding a product to the cart is reflected in cart quantity and price
- A full checkout with valid payment details ends in an order confirmation
- API: GET returns a well-formed paginated list; POST creates a resource (201); PUT/PATCH update a resource (200); DELETE removes a resource (204)

## 5. Negative Scenarios

- Login with an incorrect email/password shows an inline error and stays on the login page
- Login with empty fields is blocked by required-field validation
- Signing up with an already-registered email shows a duplicate-account error
- Searching a non-existent product returns zero results without erroring
- Submitting checkout payment with required fields empty does not confirm the order
- API: GET on a non-existent user ID returns 404; a request missing the API key returns 401

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Third-party demo site changes markup | Locators isolated inside `pages/*.js`; see README "Adapting to a different demo site" |
| Public API rate-limits or requires auth changes | Endpoint/header config centralized in `api/apiEndpoints.js` |
| Flaky tests from network latency on a shared public demo site | Playwright auto-waiting + assertion-based synchronization + 1 CI retry |
| Tests depending on shared, mutable server state (e.g., another user deleting "your" cart item) | Each test creates its own state (adds its own product to cart) rather than assuming pre-seeded data |
| Secrets leaking into the repo | `.env` is gitignored; CI secrets stored in GitHub Actions secrets, not in code |

## 7. Expected Results

A green run on `main` means: core login/search/cart/checkout flows work across all three browsers, and the five REST verbs against the API return their documented status codes and response shapes. A red run should be triaged first via the HTML report, then via the trace viewer for the specific failing test (see README > Reports section).
