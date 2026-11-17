import { describe, expect, it } from "vitest";
import { alertFiltersSchema, rejectSchema } from "./schemas";

describe("alert schemas", () => {
  it("parses URL params with safe defaults", () => {
    expect(alertFiltersSchema.parse({})).toEqual({ tab: "actives", q: "", severity: [], page: 1 });
    expect(alertFiltersSchema.parse({ tab: "nope", severity: "grave,foo", page: "2" })).toMatchObject({ tab: "actives", severity: ["grave"], page: 2 });
  });
  it("requires the original alert when rejecting as duplicate", () => {
    expect(rejectSchema.safeParse({ reason: "doublon" }).success).toBe(false);
    expect(rejectSchema.safeParse({ reason: "doublon", mergeInto: "ALT-2471" }).success).toBe(true);
  });
});
