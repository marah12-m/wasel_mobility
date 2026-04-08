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

const READ_REQUEST_NAME = "incidents_list";
const WRITE_REQUEST_NAME = "reports_create";
const READ_REQUEST_LABEL = "GET /api/v1/incidents";
const WRITE_REQUEST_LABEL = "POST /api/v1/reports";

const soakDuration = new Trend("soak_duration", true);
const soakErrorRate = new Rate("soak_error_rate");
const soakSuccessCount = new Counter("soak_success_count");

export const options = {
  scenarios: {
    soak_load: {
      executor: "constant-vus",
      exec: "soakTraffic",
      vus: toNumber(__ENV.SOAK_VUS, 15),
      duration: __ENV.SOAK_DURATION || "30m"
    }
  },
  thresholds: {
    ...buildThresholds(READ_REQUEST_NAME, {
      avgMs: toNumber(__ENV.SOAK_READ_AVG_MS_THRESHOLD, 400),
      p95Ms: toNumber(__ENV.SOAK_READ_P95_MS_THRESHOLD, 900),
      errorRate: Number(__ENV.SOAK_READ_ERROR_RATE_THRESHOLD || 0.03)
    }),
    ...buildThresholds(WRITE_REQUEST_NAME, {
      avgMs: toNumber(__ENV.SOAK_WRITE_AVG_MS_THRESHOLD, 700),
      p95Ms: toNumber(__ENV.SOAK_WRITE_P95_MS_THRESHOLD, 1400),
      errorRate: Number(__ENV.SOAK_WRITE_ERROR_RATE_THRESHOLD || 0.05)
    }),
    soak_duration: [`p(95)<${toNumber(__ENV.SOAK_OVERALL_P95_MS_THRESHOLD, 1200)}`],
    soak_error_rate: [`rate<${Number(__ENV.SOAK_ERROR_RATE_THRESHOLD || 0.04)}`],
    checks: ["rate>0.96"]
  },
  summaryTrendStats: DEFAULT_SUMMARY_TREND_STATS
};

export function soakTraffic() {
  const runRead = Math.random() < Number(__ENV.SOAK_READ_RATIO || 0.75);

  if (runRead) {
    const response = http.get(
      buildApiUrl("/incidents"),
      buildJsonParams(READ_REQUEST_NAME, { test_type: "soak", endpoint: "incidents", endpoint_label: READ_REQUEST_LABEL })
    );

    recordResponse(response, {
      expectedStatus: 200,
      endpointName: READ_REQUEST_LABEL,
      durationTrend: soakDuration,
      errorRateMetric: soakErrorRate,
      successCounter: soakSuccessCount
    });
  } else {
    const response = http.post(
      buildApiUrl("/reports"),
      JSON.stringify(createReportPayload()),
      buildJsonParams(WRITE_REQUEST_NAME, { test_type: "soak", endpoint: "reports", endpoint_label: WRITE_REQUEST_LABEL }, true)
    );

    recordResponse(response, {
      expectedStatus: 201,
      endpointName: WRITE_REQUEST_LABEL,
      durationTrend: soakDuration,
      errorRateMetric: soakErrorRate,
      successCounter: soakSuccessCount
    });
  }

  sleep(randomPause(1, 3));
}

export default soakTraffic;
