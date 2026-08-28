import { describe, expect, it } from "vitest";
import { parsePlayerSettings } from "./playerSettings";

describe("player settings", () => {
  it("uses the authentication avatar by default", () => {
    expect(parsePlayerSettings(null).useAuthenticationAvatar).toBe(true);
    expect(parsePlayerSettings("not json").useAuthenticationAvatar).toBe(true);
  });

  it("reads an explicit avatar opt-out", () => {
    expect(parsePlayerSettings(
      '{"useAuthenticationAvatar":false}',
    ).useAuthenticationAvatar).toBe(false);
  });
});
