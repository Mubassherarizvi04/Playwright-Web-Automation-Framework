// api/apiEndpoints.js
//
// Centralizing endpoint paths means if a base path ever changes, you fix it
// in ONE place instead of hunting through every test file. This mirrors how
// a Postman collection groups requests together.
//
// NOTE ON reqres.in: since its 2025 relaunch, EVERY request to /api/*
// requires a free "x-api-key" header (sign up at https://reqres.in/signup).
// Without it every call below returns 401 Unauthorized. That's why every
// test in tests/api/ sends the apiHeaders below instead of calling
// request.get(url) with no headers.

const API_BASE_URL = process.env.API_BASE_URL || 'https://reqres.in/api';

const apiHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.REQRES_API_KEY || '',
};

module.exports = {
  API_BASE_URL,
  apiHeaders,
  users: {
    list: (page = 1) => `${API_BASE_URL}/users?page=${page}`,
    getById: (id) => `${API_BASE_URL}/users/${id}`,
    create: `${API_BASE_URL}/users`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },
  auth: {
    register: `${API_BASE_URL}/register`,
    login: `${API_BASE_URL}/login`,
  },
};
