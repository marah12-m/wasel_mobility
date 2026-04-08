const AppError = require("../errors/AppError");
const externalApiConfig = require("../config/externalApis");
const MemoryCache = require("../utils/memoryCache");
const FixedWindowRateLimiter = require("../utils/fixedWindowRateLimiter");

const sharedCache = new MemoryCache();

class ExternalApiClient {
  constructor(config) {
    this.name = config.name;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey || "";
    this.apiKeyHeader = config.apiKeyHeader || "";
    this.apiKeyQueryParam = config.apiKeyQueryParam || "";
    this.timeoutMs = config.timeoutMs;
    this.cacheTtlMs = config.cacheTtlMs;
    this.requiresApiKey = Boolean(config.requiresApiKey);
    this.missingConfigEnv = config.missingConfigEnv || null;
    this.defaultHeaders = Object.fromEntries(
      Object.entries(config.defaultHeaders || {}).filter(([, value]) => Boolean(value))
    );
    this.rateLimiter = new FixedWindowRateLimiter({
      maxRequests: config.rateLimitMaxRequests,
      windowMs: config.rateLimitWindowMs,
      minIntervalMs: config.minIntervalMs
    });
  }

  buildUrl(path, query = {}) {
    const url = new URL(`${this.baseUrl}${path}`);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    if (this.apiKey && this.apiKeyQueryParam) {
      url.searchParams.set(this.apiKeyQueryParam, this.apiKey);
    }

    return url;
  }

  ensureAuthenticationConfigured() {
    if (this.requiresApiKey && !this.apiKey) {
      throw new AppError(`${this.name} integration is not configured`, 503, {
        provider: this.name,
        missingEnv: this.missingConfigEnv
      });
    }
  }

  async request({ path, method = "GET", query, body, headers = {}, cacheTtlMs = this.cacheTtlMs }) {
    this.ensureAuthenticationConfigured();

    const url = this.buildUrl(path, query);
    const cacheKey = `${method}:${url.toString()}:${body ? JSON.stringify(body) : ""}`;
    const cached = cacheTtlMs > 0 ? sharedCache.get(cacheKey) : null;

    if (cached) {
      return { ...cached, meta: { ...cached.meta, cached: true } };
    }

    await this.rateLimiter.acquire();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const requestHeaders = {
        Accept: "application/json",
        ...this.defaultHeaders,
        ...headers
      };

      if (this.apiKey && this.apiKeyHeader) {
        requestHeaders[this.apiKeyHeader] = this.apiKey;
      }

      if (body) {
        requestHeaders["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      const payload = await this.parseResponse(response);

      if (response.status === 429) {
        throw new AppError(`${this.name} rate limit reached`, 503, {
          provider: this.name,
          upstreamStatus: response.status
        });
      }

      if (response.status === 401 || response.status === 403) {
        throw new AppError(`${this.name} authentication failed`, 502, {
          provider: this.name,
          upstreamStatus: response.status
        });
      }

      if (!response.ok) {
        throw new AppError(`${this.name} request failed`, 502, {
          provider: this.name,
          upstreamStatus: response.status,
          upstreamBody: payload
        });
      }

      const result = {
        provider: this.name,
        data: payload,
        meta: {
          cached: false,
          timeoutMs: this.timeoutMs
        }
      };

      if (cacheTtlMs > 0) {
        sharedCache.set(cacheKey, result, cacheTtlMs);
      }

      return result;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new AppError(`${this.name} request timed out`, 504, {
          provider: this.name,
          timeoutMs: this.timeoutMs
        });
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`${this.name} request failed`, 502, {
        provider: this.name,
        cause: error.message
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return text;
  }
}

const openRouteClient = new ExternalApiClient(externalApiConfig.openRouteService);
const nominatimClient = new ExternalApiClient(externalApiConfig.nominatim);
const openMeteoClient = new ExternalApiClient(externalApiConfig.openMeteo);

const toCoordinate = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }

  return parsed;
};

const getRoute = async (query) => {
  const startLat = toCoordinate(query.start_lat, "start_lat");
  const startLng = toCoordinate(query.start_lng, "start_lng");
  const endLat = toCoordinate(query.end_lat, "end_lat");
  const endLng = toCoordinate(query.end_lng, "end_lng");
  const profile = query.profile || "driving-car";

  const response = await openRouteClient.request({
    path: `/v2/directions/${profile}`,
    method: "POST",
    body: {
      coordinates: [
        [startLng, startLat],
        [endLng, endLat]
      ]
    }
  });

  const route = response.data.routes?.[0];

  if (!route) {
    throw new AppError("No route returned by routing provider", 502, {
      provider: response.provider
    });
  }

  return {
    provider: response.provider,
    profile,
    summary: route.summary || null,
    geometry: route.geometry || null,
    segments: route.segments || [],
    meta: response.meta
  };
};

const getContextSnapshot = async (query) => {
  const latitude = toCoordinate(query.latitude, "latitude");
  const longitude = toCoordinate(query.longitude, "longitude");

  const [locationResponse, weatherResponse] = await Promise.all([
    nominatimClient.request({
      path: "/reverse",
      query: {
        lat: latitude,
        lon: longitude,
        format: "jsonv2",
        addressdetails: 1
      }
    }),
    openMeteoClient.request({
      path: "/forecast",
      query: {
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        timezone: "auto",
        forecast_days: 1
      }
    })
  ]);

  return {
    coordinates: {
      latitude,
      longitude
    },
    location: {
      provider: locationResponse.provider,
      display_name: locationResponse.data.display_name || null,
      address: locationResponse.data.address || null,
      meta: locationResponse.meta
    },
    weather: {
      provider: weatherResponse.provider,
      timezone: weatherResponse.data.timezone || null,
      current: weatherResponse.data.current || null,
      current_units: weatherResponse.data.current_units || null,
      meta: weatherResponse.meta
    }
  };
};

module.exports = {
  getRoute,
  getContextSnapshot
};
