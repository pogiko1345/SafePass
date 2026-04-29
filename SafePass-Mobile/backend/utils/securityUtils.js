const DEFAULT_IDENTIFIER = "global";

const createRateLimiter = ({ windowMs, max, getKey }) => {
  const store = new Map();

  return {
    hit(context = {}) {
      const now = Number(context.now || Date.now());
      const keyValue = typeof getKey === "function" ? getKey(context) : DEFAULT_IDENTIFIER;
      const key = keyValue || DEFAULT_IDENTIFIER;
      const windowStart = now - windowMs;

      const existing = store.get(key);
      const recentHits = existing
        ? existing.hits.filter((timestamp) => timestamp > windowStart)
        : [];

      recentHits.push(now);
      store.set(key, { hits: recentHits });

      const count = recentHits.length;
      const resetAt = recentHits[0] + windowMs;

      return {
        allowed: count <= max,
        count,
        remaining: Math.max(0, max - count),
        resetAt,
      };
    },

    reset(key) {
      store.delete(key || DEFAULT_IDENTIFIER);
    },
  };
};

const buildClientIdentifier = ({ ip = "", identifier = "", scope = "" } = {}) =>
  [scope, String(ip || "unknown").trim(), String(identifier || DEFAULT_IDENTIFIER).trim()]
    .filter(Boolean)
    .join(":");

const getRateLimitKey = ({ req, identifier = "", scope = "" }) =>
  buildClientIdentifier({
    ip:
      req?.headers?.["x-forwarded-for"] ||
      req?.ip ||
      req?.connection?.remoteAddress ||
      "unknown",
    identifier,
    scope,
  });

module.exports = {
  buildClientIdentifier,
  createRateLimiter,
  getRateLimitKey,
};
