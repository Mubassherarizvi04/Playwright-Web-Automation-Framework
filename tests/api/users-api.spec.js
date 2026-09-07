// tests/api/users-api.spec.js
//
// API TESTING with Playwright's built-in `request` fixture.
// This is separate from the UI project because API tests don't need a
// browser at all — they're plain HTTP calls, which is why they run in
// milliseconds compared to UI tests. Run them alone with:
//   npm run test:api
//
// Target: https://reqres.in — a public REST API sandbox built specifically
// for practicing API testing. It requires a free "x-api-key" header on
// every request (see api/apiEndpoints.js for details / .env.example for setup).

const { test, expect } = require('@playwright/test');
const endpoints = require('../../api/apiEndpoints');

test.describe('Users API @regression', () => {
  test.beforeAll(() => {
    if (!process.env.REQRES_API_KEY) {
      console.warn(
        '\n⚠️  REQRES_API_KEY is not set. Every request below will return 401. ' +
          'Get a free key at https://reqres.in/signup and add it to .env.\n'
      );
    }
  });

  // ---------- GET ----------
  test('GET /users?page=2 returns 200 and a paginated list @smoke', async ({ request }) => {
    const response = await request.get(endpoints.users.list(2), { headers: endpoints.apiHeaders });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('page', 2);
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);

    // Validate the shape of one record — not just "it returned something".
    const firstUser = body.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('first_name');
  });

  test('GET /users/23 (does not exist) returns 404 @smoke', async ({ request }) => {
    const response = await request.get(endpoints.users.getById(23), { headers: endpoints.apiHeaders });

    expect(response.status()).toBe(404);
  });

  // ---------- POST ----------
  test('POST /users creates a user and returns 201 @smoke', async ({ request }) => {
    const newUser = { name: 'Priya Sharma', job: 'QA Automation Engineer' };

    const response = await request.post(endpoints.users.create, {
      headers: endpoints.apiHeaders,
      data: newUser,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
    expect(body.name).toBe(newUser.name);
    expect(body.job).toBe(newUser.job);
  });

  test('POST /users without required fields still returns a 2xx contract response', async ({
    request,
  }) => {
    // Negative-style case: reqres.in is a mock API and doesn't enforce
    // required fields server-side. The useful assertion here is that the
    // response still matches the documented contract — this is a common,
    // realistic situation with third-party/mock APIs and worth knowing
    // how to test defensively.
    const response = await request.post(endpoints.users.create, {
      headers: endpoints.apiHeaders,
      data: {},
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  // ---------- PUT ----------
  test('PUT /users/2 fully updates a user and returns 200 @smoke', async ({ request }) => {
    const updatedUser = { name: 'Priya Sharma', job: 'Senior QA Automation Engineer' };

    const response = await request.put(endpoints.users.update(2), {
      headers: endpoints.apiHeaders,
      data: updatedUser,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe(updatedUser.job);
    expect(body).toHaveProperty('updatedAt');
  });

  // ---------- PATCH ----------
  test('PATCH /users/2 partially updates a user and returns 200', async ({ request }) => {
    const response = await request.patch(endpoints.users.update(2), {
      headers: endpoints.apiHeaders,
      data: { job: 'Lead QA Automation Engineer' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe('Lead QA Automation Engineer');
  });

  // ---------- DELETE ----------
  test('DELETE /users/2 removes a user and returns 204 @smoke', async ({ request }) => {
    const response = await request.delete(endpoints.users.delete(2), {
      headers: endpoints.apiHeaders,
    });

    expect(response.status()).toBe(204);
    // 204 = No Content by definition — the body must be empty.
    const body = await response.body();
    expect(body.length).toBe(0);
  });

  // ---------- Auth-style negative case ----------
  test('a request without the x-api-key header is rejected with 401', async ({ request }) => {
    const response = await request.get(endpoints.users.list(1)); // no headers on purpose

    expect(response.status()).toBe(401);
  });
});
