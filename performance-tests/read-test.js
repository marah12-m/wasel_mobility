import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";
import { sleep } from "k6";
import {
  DEFAULT_SUMMARY_TREND_STATS,
  buildApiUrl,
  buildJsonParams,
  buildThresholds,
  randomPause,
  recordResponse,
  toNumber
} from "./helpers.js";

const REQUEST_NAME = "incidents_list";
const REQUEST_LABEL = "GET /api/v1/incidents";

const readDuration = new Trend("read_duration", true);
const readErrorRate = new Rate("read_error_rate");
const readSuccessCount = new Counter("read_success_count");

export const options = {
  scenarios: {
    read_heavy: {
      executor: "ramping-arrival-rate",
      exec: "readIncidents",
      startRate: toNumber(__ENV.READ_START_RATE, 5),
      timeUnit: "1s",
      preAllocatedVUs: toNumber(__ENV.READ_PREALLOCATED_VUS, 20),
      maxVUs: toNumber(__ENV.READ_MAX_VUS, 80),
      stages: [
        { target: toNumber(__ENV.READ_STAGE_1_RATE, 10), duration: __ENV.READ_STAGE_1_DURATION || "1m" },
        { target: toNumber(__ENV.READ_STAGE_2_RATE, 25), duration: __ENV.READ_STAGE_2_DURATION || "3m" },
        { target: 0, duration: __ENV.READ_STAGE_3_DURATION || "30s" }
      ]
    }
  },
  thresholds: {
    ...buildThresholds(REQUEST_NAME, {
      avgMs: toNumber(__ENV.READ_AVG_MS_THRESHOLD, 300),
      p95Ms: toNumber(__ENV.READ_P95_MS_THRESHOLD, 600),
      errorRate: Number(__ENV.READ_ERROR_RATE_THRESHOLD || 0.02)
    }),
    read_duration: [`avg<${toNumber(__ENV.READ_AVG_MS_THRESHOLD, 300)}`, `p(95)<${toNumber(__ENV.READ_P95_MS_THRESHOLD, 600)}`],
    read_error_rate: [`rate<${Number(__ENV.READ_ERROR_RATE_THRESHOLD || 0.02)}`],
    checks: ["rate>0.99"]
  },
  summaryTrendStats: DEFAULT_SUMMARY_TREND_STATS
};

export function readIncidents() {
  const response = http.get(
    buildApiUrl("/incidents"),
    buildJsonParams(REQUEST_NAME, { test_type: "read-heavy", endpoint: "incidents", endpoint_label: REQUEST_LABEL })
  );

  recordResponse(response, {
    expectedStatus: 200,
    endpointName: REQUEST_LABEL,
    durationTrend: readDuration,
    errorRateMetric: readErrorRate,
    successCounter: readSuccessCount
  });

  sleep(randomPause(0.5, 2));
}

export default readIncidents;
