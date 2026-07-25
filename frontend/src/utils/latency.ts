import {
  type DbConnection,
  type ReducerEventContext,
} from "../../module_bindings";

const PING_INTERVAL_MS = 5_000;
const PING_WARMUP_INTERVAL_MS = 250;
const PING_WARMUP_SAMPLES = 5;
const PING_TIMEOUT_MS = 10_000;
const LATENCY_SAMPLE_WINDOW = 9;

export interface DatabaseLatency {
  /** Smoothed client -> database -> client round-trip time. */
  roundTripMs: number | null;
  /** Estimated database -> client time. This assumes a symmetric connection. */
  oneWayMs: number | null;
  jitterMs: number | null;
  sampleCount: number;
}

export const EMPTY_DATABASE_LATENCY: DatabaseLatency = {
  roundTripMs: null,
  oneWayMs: null,
  jitterMs: null,
  sampleCount: 0,
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

export const summarizeLatencySamples = (
  samples: number[],
): DatabaseLatency => {
  if (samples.length === 0) return EMPTY_DATABASE_LATENCY;

  const roundTripMs = median(samples);
  const differences = samples.slice(1).map((sample, index) =>
    Math.abs(sample - samples[index]),
  );

  return {
    roundTripMs,
    oneWayMs: roundTripMs / 2,
    jitterMs: differences.length > 0 ? median(differences) : 0,
    sampleCount: samples.length,
  };
};

export class SpacetimeLatencySampler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: { nonce: bigint; startedAt: number } | null = null;
  private nonce = 0n;
  private samples: number[] = [];
  private running = false;

  constructor(
    private readonly connection: DbConnection,
    private readonly onEstimate: (estimate: DatabaseLatency) => void,
  ) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.connection.setReducerFlags.ping("FullUpdate");
    this.connection.reducers.onPing(this.handlePing);
    this.schedulePing(0);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending = null;
    this.samples = [];
    this.connection.reducers.removeOnPing(this.handlePing);
  }

  private schedulePing(delayMs: number) {
    if (!this.running) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.sendPing, delayMs);
  }

  private sendPing = () => {
    if (!this.running || !this.connection.isActive) return;

    const nonce = ++this.nonce;
    this.pending = { nonce, startedAt: performance.now() };
    this.connection.reducers.ping({ nonce });

    this.timer = setTimeout(() => {
      if (this.pending?.nonce === nonce) this.pending = null;
      this.schedulePing(PING_INTERVAL_MS);
    }, PING_TIMEOUT_MS);
  };

  private handlePing = (
    ctx: ReducerEventContext,
    args: { nonce: bigint },
  ) => {
    if (!ctx.event.callerConnectionId?.isEqual(this.connection.connectionId)) {
      return;
    }

    const pending = this.pending;
    if (!pending || pending.nonce !== args.nonce) return;

    this.pending = null;
    const roundTripMs = performance.now() - pending.startedAt;
    this.samples = [...this.samples, roundTripMs].slice(
      -LATENCY_SAMPLE_WINDOW,
    );
    this.onEstimate(summarizeLatencySamples(this.samples));

    this.schedulePing(
      this.samples.length < PING_WARMUP_SAMPLES
        ? PING_WARMUP_INTERVAL_MS
        : PING_INTERVAL_MS,
    );
  };
}
