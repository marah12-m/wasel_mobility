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

const mixedDuration = new Trend("mixed_duration", true);
const mixedErrorRate = new Rate("mixed_error_rate");
const mixedSuccessCount = new Counter("mixed_success_count");

export const options = {
  scenarios: {
    mixed_workload: {
      executor: "ramping-vus",
      exec: "mixedWorkflow",
      startVUs: toNumber(__ENV.MIXED_START_VUS, 5),
      stages: [
        { duration: __ENV.MIXED_STAGE_1_DURATION || "1m", target: toNumber(__ENV.MIXED_STAGE_1_TARGET, 15) },
        { duration: __ENV.MIXED_STAGE_2_DURATION || "3m", target: toNumber(__ENV.MIXED_STAGE_2_TARGET, 30) },
        { duration: __ENV.MIXED_STAGE_3_DURATION || "1m", target: toNumber(__ENV.MIXED_STAGE_3_TARGET, 10) },
        { duration: __ENV.MIXED_STAGE_4_DURATION || "30s", target: 0 }
      ]
    }
  },
  thresholds: {
    ...buildThresholds(READ_REQUEST_NAME, {
      avgMs: toNumber(__ENV.MIXED_READ_AVG_MS_THRESHOLD, 350),
      p95Ms: toNumber(__ENV.MIXED_READ_P95_MS_THRESHOLD, 700),
      errorRate: Number(__ENV.MIXED_READ_ERROR_RATE_THRESHOLD || 0.03)
    }),
    ...buildThresholds(WRITE_REQUEST_NAME, {
      avgMs: toNumber(__ENV.MIXED_WRITE_AVG_MS_THRESHOLD, 650),
      p95Ms: toNumber(__ENV.MIXED_WRITE_P95_MS_THRESHOLD, 1200),
      errorRate: Number(__ENV.MIXED_WRITE_ERROR_RATE_THRESHOLD || 0.05)
    }),
    mixed_duration: [`p(95)<${toNumber(__ENV.MIXED_OVERALL_P95_MS_THRESHOLD, 900)}`],
    mixed_error_rate: [`rate<${Number(__ENV.MIXED_ERROR_RATE_THRESHOLD || 0.04)}`],
    checks: ["rate>0.96"]
  },
  summaryTrendStats: DEFAULT_SUMMARY_TREND_STATS
};

export function mixedWorkflow() {
  const runRead = Math.random() < Number(__ENV.MIXED_READ_RATIO || 0.7);

  if (runRead) {
    const response = http.get(
      buildApiUrl("/incidents"),
      buildJsonParams(READ_REQUEST_NAME, { test_type: "mixed", endpoint: "incidents", endpoint_label: READ_REQUEST_LABEL })
    );

    recordResponse(response, {
      expectedStatus: 200,
      endpointName: READ_REQUEST_LABEL,
      durationTrend: mixedDuration,
      errorRateMetric: mixedErrorRate,
      successCounter: mixedSuccessCount
    });
  } else {
    const response = http.post(
      buildApiUrl("/reports"),
      JSON.stringify(createReportPayload()),
      buildJsonParams(WRITE_REQUEST_NAME, { test_type: "mixed", endpoint: "reports", endpoint_label: WRITE_REQUEST_LABEL }, true)
    );

    recordResponse(response, {
      expectedStatus: 201,
      endpointName: WRITE_REQUEST_LABEL,
      durationTrend: mixedDuration,
      errorRateMetric: mixedErrorRate,
      successCounter: mixedSuccessCount
    });
  }

  sleep(randomPause(0.5, 1.5));
}

export default mixedWorkflow;
