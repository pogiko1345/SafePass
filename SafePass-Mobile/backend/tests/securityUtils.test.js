const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildClientIdentifier,
  createRateLimiter,
  getRateLimitKey,
} = require("../utils/securityUtils");

test("buildClientIdentifier combines scope ip and identifier", () => {
  assert.equal(
    buildClientIdentifier({ scope: "login", ip: "127.0.0.1", identifier: "user@example.com" }),
    "login:127.0.0.1:user@example.com",
  );
});

test("getRateLimitKey falls back to request ip", () => {
  const key = getRateLimitKey({
    req: { ip: "10.0.0.8", headers: {} },
    identifier: "visitor@example.com",
    scope: "reset",
  });

  assert.equal(key, "reset:10.0.0.8:visitor@example.com");
});

test("createRateLimiter blocks requests after max within the same window", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    max: 2,
    getKey: ({ identifier }) => identifier,
  });

  assert.equal(limiter.hit({ identifier: "login", now: 100 }).allowed, true);
  assert.equal(limiter.hit({ identifier: "login", now: 200 }).allowed, true);
  assert.equal(limiter.hit({ identifier: "login", now: 300 }).allowed, false);
});

test("createRateLimiter resets after the window passes", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    max: 1,
    getKey: ({ identifier }) => identifier,
  });

  assert.equal(limiter.hit({ identifier: "otp", now: 100 }).allowed, true);
  assert.equal(limiter.hit({ identifier: "otp", now: 200 }).allowed, false);
  assert.equal(limiter.hit({ identifier: "otp", now: 1201 }).allowed, true);
});
