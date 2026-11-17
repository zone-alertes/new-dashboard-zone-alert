import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeverityBadge, StatusBadge } from "@/features/alerts/components/alert-badges";

describe("badges", () => {
  it("renders severity with text, not colour only", () => {
    render(<SeverityBadge severity="grave" count={4} />);
    expect(screen.getByText("Grave · 4")).toBeInTheDocument();
  });
  it("maps statuses to the Figma labels", () => {
    render(<StatusBadge status="intervention" />);
    expect(screen.getByText("Intervention en cours")).toBeInTheDocument();
  });
});
