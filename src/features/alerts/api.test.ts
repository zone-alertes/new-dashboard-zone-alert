import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/lib/mock/db";
import { alertsApi } from "./api";

describe("alerts api (mock)", () => {
  beforeEach(() => resetDb());

  it("matches the V2 dataset counters", async () => {
    const c = await alertsApi.counts();
    expect(c).toMatchObject({ actives: 18, en_qualification: 7, a_assigner: 2, intervention: 9 });
    expect(c.bySeverity).toEqual({ grave: 4, serieuse: 7, moderee: 7 });
  });

  it("runs the guiding case ALT-2481: validate then assign Alpha-3", async () => {
    await alertsApi.validate("ALT-2481", "Macgenius");
    const a = await alertsApi.assign("ALT-2481", { teamId: "alpha-3", notifySms: true }, "Macgenius");
    expect(a.status).toBe("intervention");
    expect(a.assignedTeamId).toBe("alpha-3");
    await expect(alertsApi.assign("ALT-2478", { teamId: "alpha-3", notifySms: true }, "Macgenius")).rejects.toThrow(/déjà en intervention/);
  });

  it("filters and paginates the list from URL filters", async () => {
    const page = await alertsApi.list({ tab: "actives", q: "", severity: ["grave"], page: 1 });
    expect(page.total).toBe(4);
    expect(page.items.every((a) => a.severity === "grave")).toBe(true);
  });
});
