const fs = require("fs");
const path = require("path");

const TEMPLATE_PATH = path.join(__dirname, "template.html");

const parseArgs = (argv) => {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[index + 1] : "true";
    args[key] = value;

    if (value !== "true") {
      index += 1;
    }
  }

  return args;
};

const quantile = (values, percentile) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * percentile;
  const base = Math.floor(position);
  const rest = position - base;

  if (sorted[base + 1] === undefined) {
    return sorted[base];
  }

  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
};

const formatNumber = (value, fractionDigits = 2) => Number(value || 0).toFixed(fractionDigits);

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const loadJsonLines = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const raw = fs.readFileSync(absolutePath, "utf8");

  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

const parseInputFiles = (value) => String(value)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const summarizeK6Output = (entries) => {
  const durations = [];
  const failedSamples = [];
  let totalRequests = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;

  for (const entry of entries) {
    if (entry.type !== "Point") {
      continue;
    }

    const value = Number(entry.data?.value);
    const timestamp = entry.data?.time ? new Date(entry.data.time).getTime() : null;

    if (timestamp !== null) {
      firstTimestamp = firstTimestamp === null ? timestamp : Math.min(firstTimestamp, timestamp);
      lastTimestamp = lastTimestamp === null ? timestamp : Math.max(lastTimestamp, timestamp);
    }

    if (entry.metric === "http_req_duration" && Number.isFinite(value)) {
      durations.push(value);
    }

    if (entry.metric === "http_req_failed" && Number.isFinite(value)) {
      failedSamples.push(value);
    }

    if (entry.metric === "http_reqs" && Number.isFinite(value)) {
      totalRequests += value;
    }
  }

  const durationSeconds = firstTimestamp !== null && lastTimestamp !== null && lastTimestamp > firstTimestamp
    ? (lastTimestamp - firstTimestamp) / 1000
    : 0;
  const averageResponseTime = durations.length > 0
    ? durations.reduce((sum, value) => sum + value, 0) / durations.length
    : 0;
  const p95Latency = quantile(durations, 0.95);
  const errorRate = failedSamples.length > 0
    ? failedSamples.reduce((sum, value) => sum + value, 0) / failedSamples.length
    : 0;
  const throughput = durationSeconds > 0 ? totalRequests / durationSeconds : 0;

  return {
    averageResponseTime,
    p95Latency,
    throughput,
    errorRate,
    totalRequests,
    sampleCount: durations.length,
    durationSeconds,
    startedAt: firstTimestamp ? new Date(firstTimestamp).toISOString() : "N/A",
    endedAt: lastTimestamp ? new Date(lastTimestamp).toISOString() : "N/A"
  };
};

const summarizeFiles = (inputFiles) => {
  const files = inputFiles.map((filePath) => {
    const entries = loadJsonLines(filePath);
    return {
      filePath,
      entries,
      summary: summarizeK6Output(entries)
    };
  });

  return {
    files,
    combinedEntries: files.flatMap((file) => file.entries),
    combinedSummary: summarizeK6Output(files.flatMap((file) => file.entries))
  };
};

const createFindings = (summary) => {
  const findings = [];

  if (summary.p95Latency > 1000) {
    findings.push("Tail latency is elevated. Investigate slow database queries, lock contention, or synchronous downstream calls.");
  }

  if (summary.errorRate > 0.03) {
    findings.push("Error rate exceeded a healthy baseline. Inspect authentication failures, validation failures, and database saturation.");
  }

  if (summary.throughput < 5) {
    findings.push("Throughput is relatively low. Review connection pooling, request fan-out, and application-level serialization.");
  }

  if (findings.length === 0) {
    findings.push("No obvious bottleneck is visible from request-level metrics alone. Confirm with infrastructure metrics and database traces.");
  }

  return findings;
};

const createLimitations = () => [
  "This report is derived from request-level k6 output only; CPU, memory, database, and network telemetry are not included.",
  "Application correctness is inferred from HTTP status codes and JSON responses, not from domain-specific assertions.",
  "Results depend on the environment under test, dataset size, and whether caches were warm or cold."
];

const createRootCauseAnalysis = (summary) => {
  if (summary.errorRate > 0.03) {
    return [
      "Elevated failures usually indicate application back-pressure, authentication issues, or database/resource contention under load.",
      "Correlate failure timestamps with server logs, slow queries, and connection pool usage."
    ];
  }

  if (summary.p95Latency > 1000) {
    return [
      "Latency outliers are likely caused by slow I/O paths rather than pure CPU saturation.",
      "Start with route-level tracing on `/api/v1/incidents` and `/api/v1/reports`, then inspect query plans and lock waits."
    ];
  }

  return [
    "No single root cause is confirmed from k6 metrics alone.",
    "Use this report as a triage artifact and validate with application logs and database instrumentation."
  ];
};

const createAppliedOptimizations = () => [
  "Database schema includes foreign-key indexes and a unique composite index on report votes to keep common lookups and integrity checks efficient.",
  "MySQL access uses a connection pool instead of opening a new database connection per request.",
  "External API calls use in-memory TTL caching to reduce repeated upstream requests.",
  "External API calls use fixed-window rate limiting and minimum request intervals to avoid upstream throttling.",
  "External API calls enforce timeouts with AbortController so slow providers do not block request handling indefinitely.",
  "Request validation happens before service and database work, reducing wasted processing on invalid input."
];

const buildComparisonRows = (current, baseline) => {
  const metrics = [
    { label: "Average Response Time (ms)", current: current.averageResponseTime, baseline: baseline?.averageResponseTime },
    { label: "p95 Latency (ms)", current: current.p95Latency, baseline: baseline?.p95Latency },
    { label: "Throughput (req/s)", current: current.throughput, baseline: baseline?.throughput },
    { label: "Error Rate (%)", current: current.errorRate * 100, baseline: baseline ? baseline.errorRate * 100 : undefined }
  ];

  return metrics
    .map((metric) => {
      const baselineValue = metric.baseline === undefined ? "N/A" : formatNumber(metric.baseline);
      const delta = metric.baseline === undefined ? "N/A" : formatNumber(metric.current - metric.baseline);

      return `
        <tr>
          <td>${escapeHtml(metric.label)}</td>
          <td>${baselineValue}</td>
          <td>${formatNumber(metric.current)}</td>
          <td>${delta}</td>
        </tr>
      `;
    })
    .join("");
};

const buildList = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

const buildMetricCards = (summary) => `
  <div class="metrics-grid">
    <div class="metric-card"><h3>Average Response Time</h3><strong>${formatNumber(summary.averageResponseTime)} ms</strong></div>
    <div class="metric-card"><h3>p95 Latency</h3><strong>${formatNumber(summary.p95Latency)} ms</strong></div>
    <div class="metric-card"><h3>Throughput</h3><strong>${formatNumber(summary.throughput)} req/s</strong></div>
    <div class="metric-card"><h3>Error Rate</h3><strong>${formatNumber(summary.errorRate * 100)}%</strong></div>
  </div>
`;

const buildScenarioRows = (scenarioFiles) => scenarioFiles
  .map((scenario) => `
    <tr>
      <td>${escapeHtml(path.basename(scenario.filePath))}</td>
      <td>${formatNumber(scenario.summary.averageResponseTime)} ms</td>
      <td>${formatNumber(scenario.summary.p95Latency)} ms</td>
      <td>${formatNumber(scenario.summary.throughput)} req/s</td>
      <td>${formatNumber(scenario.summary.errorRate * 100)}%</td>
    </tr>
  `)
  .join("");

const buildReportBody = ({ title, sourceFile, baseUrl, summary, baselineSummary, scenarioFiles }) => `
  <div class="hero">
    <h1>${escapeHtml(title)}</h1>
    <p><span class="pill">Generated ${escapeHtml(new Date().toISOString())}</span><span class="pill">Source ${escapeHtml(sourceFile)}</span></p>
    <p class="muted">BASE_URL: ${escapeHtml(baseUrl || "N/A")}</p>
  </div>
  ${buildMetricCards(summary)}
  <section>
    <h2>1. Required Test Scenarios</h2>
    <table>
      <tr><th>Scenario File</th><th>Average</th><th>p95</th><th>Throughput</th><th>Error Rate</th></tr>
      ${buildScenarioRows(scenarioFiles)}
    </table>
  </section>
  <section>
    <h2>2. Required Metrics</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Average Response Time</td><td>${formatNumber(summary.averageResponseTime)} ms</td></tr>
      <tr><td>p95 Latency</td><td>${formatNumber(summary.p95Latency)} ms</td></tr>
      <tr><td>Throughput</td><td>${formatNumber(summary.throughput)} req/s</td></tr>
      <tr><td>Error Rate</td><td>${formatNumber(summary.errorRate * 100)}%</td></tr>
    </table>
  </section>
  <section><h2>3. Identified Bottlenecks</h2>${buildList(createFindings(summary))}</section>
  <section><h2>4. Observed Limitations</h2>${buildList(createLimitations())}</section>
  <section><h2>5. Root Causes</h2>${buildList(createRootCauseAnalysis(summary))}</section>
  <section><h2>6. Optimizations Applied</h2>${buildList(createAppliedOptimizations())}</section>
  <section>
    <h2>7. Before vs After Comparison</h2>
    <table>
      <tr><th>Metric</th><th>Baseline</th><th>Current</th><th>Delta</th></tr>
      ${buildComparisonRows(summary, baselineSummary)}
    </table>
  </section>
`;

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input;

  if (!inputPath) {
    console.error("Usage: node reports/generate-report.js --input <k6-json-file> [--output <html-file>] [--title <report-title>] [--baseline <k6-json-file>] [--base-url <url>]");
    process.exit(1);
  }

  const inputFiles = parseInputFiles(inputPath);
  const inputBundle = summarizeFiles(inputFiles);
  const summary = inputBundle.combinedSummary;
  const baselineSummary = args.baseline ? summarizeFiles(parseInputFiles(args.baseline)).combinedSummary : null;
  const title = args.title || `${path.basename(inputPath, path.extname(inputPath))} Performance Report`;
  const sourceFile = inputFiles.length === 1
    ? path.relative(process.cwd(), path.resolve(inputFiles[0]))
    : inputFiles.map((file) => path.relative(process.cwd(), path.resolve(file))).join(", ");
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const body = buildReportBody({
    title,
    sourceFile,
    baseUrl: args["base-url"] || "",
    summary,
    baselineSummary,
    scenarioFiles: inputBundle.files
  });
  const html = template
    .replace("{{TITLE}}", escapeHtml(title))
    .replace("{{BODY}}", body);
  const outputPath = path.resolve(args.output || path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}.html`));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");

  console.log(`HTML report written to ${outputPath}`);
};

main();
