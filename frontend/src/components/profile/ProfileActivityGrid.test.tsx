// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GameRecord } from "../../types/stdb";
import { ProfileActivityGrid } from "./ProfileActivityGrid";

afterEach(cleanup);

describe("ProfileActivityGrid", () => {
  it("defaults to the rolling activity period", () => {
    const { getByRole, getByText } = render(
      <ProfileActivityGrid gameRecords={[] as GameRecord[]} />,
    );
    const select = getByRole("combobox", { name: "Activity period" });

    expect(select.textContent).toContain("Last 12 months");
    expect(getByText("races in the last 12 months")).not.toBeNull();
  });
});
