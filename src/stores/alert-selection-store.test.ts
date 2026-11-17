import { beforeEach, describe, expect, it } from "vitest";
import { useAlertSelection } from "./alert-selection-store";

describe("alert selection store", () => {
  beforeEach(() => useAlertSelection.getState().clear());

  it("toggles and bulk-selects without duplicates", () => {
    const s = useAlertSelection.getState();
    s.toggle("ALT-2481");
    s.setMany(["ALT-2481", "ALT-2480"], true);
    expect(useAlertSelection.getState().selected).toEqual(["ALT-2481", "ALT-2480"]);
    useAlertSelection.getState().setMany(["ALT-2481"], false);
    expect(useAlertSelection.getState().selected).toEqual(["ALT-2480"]);
  });
});
