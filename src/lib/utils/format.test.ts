import { describe, expect, it } from "vitest";
import { initials, timeAgo } from "./format";

describe("format", () => {
  it("formats relative time against the demo clock", () => {
    expect(timeAgo("2026-11-08T18:39:00+01:00")).toBe("il y a 6 min");
    expect(timeAgo("2026-11-08T16:45:00+01:00")).toBe("il y a 2 h");
  });
  it("builds initials without rank prefixes", () => {
    expect(initials("Sgt Rich-man Ali")).toBe("RA");
    expect(initials("Esther Kabeya")).toBe("EK");
  });
});
