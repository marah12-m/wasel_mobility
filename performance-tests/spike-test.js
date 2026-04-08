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

const spikeDuration = new Trend("spike_duration", true);
const spikeErrorRate = new Rate("spike_error_rate");
const spikeSuccessCount = new Counter("spike_success_count");

export const options = {
  scenarios: {
    spike_load: {
      executor: "ramping-vus",
      exec: "spikeTraffic",
      startVUs: 0,
      stages: [
        { duration: __ENV.SPIKE_STAGE_1_DURATION || "30s", target: toNumber(__ENV.SPIKE_STAGE_1_TARGET, 10) },
        { duration: __ENV.SPIKE_STAGE_2_DURATION || "20s", target: toNumber(__ENV.SPIKE_STAGE_2_TARGET, 100) },
        { duration: __ENV.SPIKE_STAGE_3_DURATION || "30s", target: toNumber(__ENV.SPIKE_STAGE_3_TARGET, 100) },
        { duration: __ENV.SPIKE_STAGE_4_DURATION || "30s", target: toNumber(__ENV.SPIKE_STAGE_4_TARGET, 10) },
        { duration: __ENV.SPIKE_STAGE_5_DURATION || "20s", target: 0 }
      ]
    }
  },
  thresholds: {
    ...buildThresholds(READ_REQUEST_NAME, {
      avgMs: toNumber(__ENV.SPIKE_READ_AVG_MS_THRESHOLD, 600),
      p95Ms: toNumber(__ENV.SPIKE_READ_P95_MS_THRESHOLD, 1500),
      errorRate: Number(__ENV.SPIKE_READ_ERROR_RATE_THRESHOLD || 0.08)
    }),
    ...buildThresholds(WRITE_REQUEST_NAME, {
      avgMs: toNumber(__ENV.SPIKE_WRITE_AVG_MS_THRESHOLD, 900),
      p95Ms: toNumber(__ENV.SPIKE_WRITE_P95_MS_THRESHOLD, 2000),
      errorRate: Number(__ENV.SPIKE_WRITE_ERROR_RATE_THRESHOLD || 0.1)
    }),
    spike_duration: [`p(95)<${toNumber(__ENV.SPIKE_OVERALL_P95_MS_THRESHOLD, 1800)}`],
    spike_error_rate: [`rate<${Number(__ENV.SPIKE_ERROR_RATE_THRESHOLD || 0.1)}`]
  },
  summaryTrendStats: DEFAULT_SUMMARY_TREND_STATS
};

export function spikeTraffic() {
  const runRead = Math.random() < Number(__ENV.SPIKE_READ_RATIO || 0.8);

  if (runRead) {
    const response = http.get(
      buildApiUrl("/incidents"),
      buildJsonParams(READ_REQUEST_NAME, { test_type: "spike", endpoint: "incidents", endpoint_label: READ_REQUEST_LABEL })
    );

    recordResponse(response, {
      expectedStatus: 200,
      endpointName: READ_REQUEST_LABEL,
      durationTrend: spikeDuration,
      errorRateMetric: spikeErrorRate,
      successCounter: spikeSuccessCount
    });
  } else {
    const response = http.post(
      buildApiUrl("/reports"),
      JSON.stringify(createReportPayload()),
      buildJsonParams(WRITE_REQUEST_NAME, { test_type: "spike", endpoint: "reports", endpoint_label: WRITE_REQUEST_LABEL }, true)
    );

    recordResponse(response, {
      expectedStatus: 201,
      endpointName: WRITE_REQUEST_LABEL,
      durationTrend: spikeDuration,
      errorRateMetric: spikeErrorRate,
      successCounter: spikeSuccessCount
    });
  }

  sleep(randomPause(0.1, 0.5));
}

export default spikeTraffic;
