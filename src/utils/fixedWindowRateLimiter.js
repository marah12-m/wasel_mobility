class FixedWindowRateLimiter {
  constructor({ maxRequests, windowMs, minIntervalMs = 0 }) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.minIntervalMs = minIntervalMs;
    this.requestTimestamps = [];
    this.lastRequestAt = 0;
  }

  async acquire() {
    while (true) {
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < this.windowMs);

      const waitForWindow = this.requestTimestamps.length >= this.maxRequests
        ? this.windowMs - (now - this.requestTimestamps[0])
        : 0;
      const waitForInterval = this.lastRequestAt > 0
        ? this.minIntervalMs - (now - this.lastRequestAt)
        : 0;
      const waitMs = Math.max(waitForWindow, waitForInterval, 0);

      if (waitMs === 0) {
        this.requestTimestamps.push(now);
        this.lastRequestAt = now;
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

module.exports = FixedWindowRateLimiter;
