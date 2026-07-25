import { describe, expect, it } from "vitest";
import { summarizeLatencySamples } from "./latency";

describe("summarizeLatencySamples", () => {
  it("returns an empty estimate without samples", () => {
    expect(summarizeLatencySamples([])).toEqual({
      roundTripMs: null,
      oneWayMs: null,
      jitterMs: null,
      sampleCount: 0,
    });
  });

  it("uses median RTT and half of that value for one-way latency", () => {
    expect(summarizeLatencySamples([120, 40, 80])).toMatchObject({
      roundTripMs: 80,
      oneWayMs: 40,
      sampleCount: 3,
    });
  });

  it("reports median movement between consecutive samples as jitter", () => {
    expect(summarizeLatencySamples([50, 70, 65, 95])).toMatchObject({
      roundTripMs: 67.5,
      oneWayMs: 33.75,
      jitterMs: 20,
    });
  });
});
