const test = require("node:test");
const assert = require("node:assert/strict");
const { createDatabase } = require("../src/config/database");
const { createApp } = require("../src/app");

process.env.JWT_SECRET = "test-secret-with-at-least-32-random-characters";
process.env.JWT_EXPIRES_IN = "1h";

const database = createDatabase(":memory:");
const app = createApp(database);
let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  server.close();
  database.close();
});

async function request(method, path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

test("health endpoint, validation, and unknown routes", async () => {
  const health = await request("GET", "/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.status, "ok");

  const missing = await request("POST", "/api/auth/register", {
    body: { name: "", email: "bad", password: "short" },
  });
  assert.equal(missing.status, 400);
  assert.equal(missing.body.message, "Validation failed");
  assert.ok(Array.isArray(missing.body.errors));

  const unknown = await request("GET", "/api/unknown");
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.message, "Route not found");
});

test("registration, login, password storage, and duplicate email", async () => {
  const registration = await request("POST", "/api/auth/register", {
    body: {
      name: "  Ganesh  ",
      email: "Ganesh@Example.com",
      password: "StrongPass123",
    },
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.user.name, "Ganesh");
  assert.equal(registration.body.user.email, "ganesh@example.com");
  assert.equal("password" in registration.body.user, false);
  assert.equal("password_hash" in registration.body.user, false);

  const stored = database.prepare(
    "SELECT password_hash FROM users WHERE email = ?"
  ).get("ganesh@example.com");
  assert.notEqual(stored.password_hash, "StrongPass123");
  assert.ok(stored.password_hash.startsWith("$2"));

  const duplicate = await request("POST", "/api/auth/register", {
    body: {
      name: "Another Name",
      email: "GANESH@example.com",
      password: "StrongPass123",
    },
  });
  assert.equal(duplicate.status, 409);

  const login = await request("POST", "/api/auth/login", {
    body: { email: "ganesh@example.com", password: "StrongPass123" },
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const badPassword = await request("POST", "/api/auth/login", {
    body: { email: "ganesh@example.com", password: "WrongPass123" },
  });
  assert.equal(badPassword.status, 401);
  assert.equal(badPassword.body.message, "Invalid email or password");

  const unknownEmail = await request("POST", "/api/auth/login", {
    body: { email: "nobody@example.com", password: "StrongPass123" },
  });
  assert.equal(unknownEmail.status, 401);
  assert.equal(unknownEmail.body.message, badPassword.body.message);
});

test("protected CRUD and user data isolation", async () => {
  for (const path of ["/api/tasks", "/api/tasks/1"]) {
    const response = await request("GET", path);
    assert.equal(response.status, 401);
  }

  const userARegistration = await request("POST", "/api/auth/register", {
    body: { name: "User A", email: "a@example.com", password: "PasswordA123" },
  });
  const userALogin = await request("POST", "/api/auth/login", {
    body: { email: "a@example.com", password: "PasswordA123" },
  });
  const tokenA = userALogin.body.token;

  const createA = await request("POST", "/api/tasks", {
    headers: { authorization: `Bearer ${tokenA}` },
    body: {
      title: "Private task",
      description: "Only User A",
      status: "pending",
    },
  });
  assert.equal(userARegistration.status, 201);
  assert.equal(createA.status, 201);
  const taskAId = createA.body.task.id;

  await request("POST", "/api/auth/register", {
    body: { name: "User B", email: "b@example.com", password: "PasswordB123" },
  });
  const userBLogin = await request("POST", "/api/auth/login", {
    body: { email: "b@example.com", password: "PasswordB123" },
  });
  const tokenB = userBLogin.body.token;

  const listB = await request("GET", "/api/tasks", {
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.equal(listB.status, 200);
  assert.equal(listB.body.count, 0);
  assert.deepEqual(listB.body.tasks, []);

  for (const method of ["GET", "PUT", "DELETE"]) {
    const response = await request(method, `/api/tasks/${taskAId}`, {
      headers: { authorization: `Bearer ${tokenB}` },
      body: method === "PUT" ? { status: "completed" } : undefined,
    });
    assert.equal(response.status, 404);
  }

  const invalidToken = await request("GET", "/api/tasks", {
    headers: { authorization: "Bearer invalid.token.value" },
  });
  assert.equal(invalidToken.status, 401);

  const emptyCreate = await request("POST", "/api/tasks", {
    headers: { authorization: `Bearer ${tokenA}` },
    body: { title: "   ", description: "bad" },
  });
  assert.equal(emptyCreate.status, 400);

  const readA = await request("GET", `/api/tasks/${taskAId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
  });
  assert.equal(readA.status, 200);
  assert.equal(readA.body.task.title, "Private task");

  const updateA = await request("PUT", `/api/tasks/${taskAId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
    body: { title: "Updated task", status: "in_progress" },
  });
  assert.equal(updateA.status, 200);
  assert.equal(updateA.body.task.status, "in_progress");

  const emptyUpdate = await request("PUT", `/api/tasks/${taskAId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
    body: {},
  });
  assert.equal(emptyUpdate.status, 400);

  const deleteA = await request("DELETE", `/api/tasks/${taskAId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
  });
  assert.equal(deleteA.status, 200);

  const deleted = await request("GET", `/api/tasks/${taskAId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
  });
  assert.equal(deleted.status, 404);
});
