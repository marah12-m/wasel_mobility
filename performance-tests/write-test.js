import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";
import { sleep } from "k6";
import {
  DEFAULT_SUMMARY_TREND_STATS,
  buildApiUrl,
  buildJsonParams,
  buildThresholds,
  createReportPayload,
  randomPause,
  recordResponse,
  toNumber
} from "./helpers.js";

const REQUEST_NAME = "reports_create";
const REQUEST_LABEL = "POST /api/v1/reports";

const writeDuration = new Trend("write_duration", true);
const writeErrorRate = new Rate("write_error_rate");
const writeSuccessCount = new Counter("write_success_count");

export const options = {
  scenarios: {
    write_heavy: {
      executor: "constant-arrival-rate",
      exec: "submitReport",
      rate: toNumber(__ENV.WRITE_RATE, 4),
      timeUnit: "1s",
      duration: __ENV.WRITE_DURATION || "3m",
      preAllocatedVUs: toNumber(__ENV.WRITE_PREALLOCATED_VUS, 20),
      maxVUs: toNumber(__ENV.WRITE_MAX_VUS, 60)
    }
  },
  thresholds: {
    ...buildThresholds(REQUEST_NAME, {
      avgMs: toNumber(__ENV.WRITE_AVG_MS_THRESHOLD, 500),
      p95Ms: toNumber(__ENV.WRITE_P95_MS_THRESHOLD, 1000),
      errorRate: Number(__ENV.WRITE_ERROR_RATE_THRESHOLD || 0.05)
    }),
    write_duration: [`avg<${toNumber(__ENV.WRITE_AVG_MS_THRESHOLD, 500)}`, `p(95)<${toNumber(__ENV.WRITE_P95_MS_THRESHOLD, 1000)}`],
    write_error_rate: [`rate<${Number(__ENV.WRITE_ERROR_RATE_THRESHOLD || 0.05)}`],
    checks: ["rate>0.95"]
  },
  summaryTrendStats: DEFAULT_SUMMARY_TREND_STATS
};

export function submitReport() {
  const response = http.post(
    buildApiUrl("/reports"),
    JSON.stringify(createReportPayload()),
    buildJsonParams(REQUEST_NAME, { test_type: "write-heavy", endpoint: "reports", endpoint_label: REQUEST_LABEL }, true)
  );

  recordResponse(response, {
    expectedStatus: 201,
    endpointName: REQUEST_LABEL,
    durationTrend: writeDuration,
    errorRateMetric: writeErrorRate,
    successCounter: writeSuccessCount
  });

  sleep(randomPause(1, 2.5));
}

export default submitReport;
