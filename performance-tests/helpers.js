import { check, fail } from "k6";

const DEFAULT_BASE_URL = "http://localhost:3000";
const API_PREFIX = "/api/v1";

export const DEFAULT_SUMMARY_TREND_STATS = ["avg", "min", "med", "p(90)", "p(95)", "max"];

export const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getBaseUrl = () => (__ENV.BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

export const buildApiUrl = (path) => `${getBaseUrl()}${API_PREFIX}${path}`;

export const buildJsonParams = (name, extraTags = {}, requiresAuth = false) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  if (requiresAuth) {
    if (!__ENV.AUTH_TOKEN) {
      fail("AUTH_TOKEN environment variable is required for write-capable performance tests.");
    }

    headers.Authorization = `Bearer ${__ENV.AUTH_TOKEN}`;
  }

  return {
    headers,
    tags: {
      name,
      ...extraTags
    }
  };
};

export const buildThresholds = (name, { avgMs, p95Ms, errorRate }) => ({
  [`http_req_duration{name:${name}}`]: [`avg<${avgMs}`, `p(95)<${p95Ms}`],
  [`http_req_failed{name:${name}}`]: [`rate<${errorRate}`]
});

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const randomPause = (minSeconds, maxSeconds) => randomBetween(minSeconds, maxSeconds);

export const createReportPayload = () => {
  const latitude = Number(randomBetween(31.70, 31.92).toFixed(6));
  const longitude = Number(randomBetween(35.10, 35.32).toFixed(6));

  return {
    category_id: null,
    description: `Crowdsourced traffic report from k6 VU ${__VU} iteration ${__ITER}`,
    latitude,
    longitude,
    status: "pending",
    duplicate_of: null
  };
};

export const recordResponse = (
  response,
  { expectedStatus, endpointName, durationTrend, errorRateMetric, successCounter }
) => {
  durationTrend.add(response.timings.duration);

  const isValid = check(response, {
    [`${endpointName} returned ${expectedStatus}`]: (res) => res.status === expectedStatus,
    [`${endpointName} returned JSON`]: (res) => {
      const contentType = res.headers["Content-Type"] || res.headers["content-type"] || "";
      return contentType.includes("application/json");
    }
  });

  errorRateMetric.add(!isValid);

  if (isValid) {
    successCounter.add(1);
  }

  return isValid;
};
