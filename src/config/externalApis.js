const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  openRouteService: {
    name: "openrouteservice",
    baseUrl: process.env.OPENROUTE_SERVICE_BASE_URL || "https://api.openrouteservice.org",
    apiKey: process.env.OPENROUTE_SERVICE_API_KEY || "",
    apiKeyHeader: "Authorization",
    timeoutMs: toNumber(process.env.OPENROUTE_SERVICE_TIMEOUT_MS, 5000),
    cacheTtlMs: toNumber(process.env.OPENROUTE_SERVICE_CACHE_TTL_MS, 300000),
    rateLimitMaxRequests: toNumber(process.env.OPENROUTE_SERVICE_RATE_LIMIT_MAX_REQUESTS, 40),
    rateLimitWindowMs: toNumber(process.env.OPENROUTE_SERVICE_RATE_LIMIT_WINDOW_MS, 60000),
    minIntervalMs: toNumber(process.env.OPENROUTE_SERVICE_MIN_INTERVAL_MS, 250),
    requiresApiKey: true,
    missingConfigEnv: "OPENROUTE_SERVICE_API_KEY"
  },
  nominatim: {
    name: "nominatim",
    baseUrl: process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org",
    timeoutMs: toNumber(process.env.NOMINATIM_TIMEOUT_MS, 5000),
    cacheTtlMs: toNumber(process.env.NOMINATIM_CACHE_TTL_MS, 300000),
    rateLimitMaxRequests: toNumber(process.env.NOMINATIM_RATE_LIMIT_MAX_REQUESTS, 60),
    rateLimitWindowMs: toNumber(process.env.NOMINATIM_RATE_LIMIT_WINDOW_MS, 60000),
    minIntervalMs: toNumber(process.env.NOMINATIM_MIN_INTERVAL_MS, 1000),
    defaultHeaders: {
      "User-Agent": process.env.NOMINATIM_USER_AGENT || "WaselMobility/1.0",
      "From": process.env.NOMINATIM_CONTACT_EMAIL || ""
    }
  },
  openMeteo: {
    name: "open-meteo",
    baseUrl: process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1",
    timeoutMs: toNumber(process.env.OPEN_METEO_TIMEOUT_MS, 5000),
    cacheTtlMs: toNumber(process.env.OPEN_METEO_CACHE_TTL_MS, 600000),
    rateLimitMaxRequests: toNumber(process.env.OPEN_METEO_RATE_LIMIT_MAX_REQUESTS, 60),
    rateLimitWindowMs: toNumber(process.env.OPEN_METEO_RATE_LIMIT_WINDOW_MS, 60000),
    minIntervalMs: toNumber(process.env.OPEN_METEO_MIN_INTERVAL_MS, 250)
  }
};
