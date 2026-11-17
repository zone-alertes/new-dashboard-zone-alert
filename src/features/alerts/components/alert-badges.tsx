import { Badge } from "@/components/ui";
import type { AlertStatus, Severity } from "@/types/domain";
import { SEVERITY_LABEL, SEVERITY_TONE, STATUS_LABEL, STATUS_TONE } from "../constants";

export const SeverityBadge = ({ severity, count }: { severity: Severity; count?: number }) => (
  <Badge tone={SEVERITY_TONE[severity]}>
    {SEVERITY_LABEL[severity]}
    {count !== undefined && ` · ${count}`}
  </Badge>
);

export const StatusBadge = ({ status, label }: { status: AlertStatus; label?: string }) => (
  <Badge tone={STATUS_TONE[status]}>{label ?? STATUS_LABEL[status]}</Badge>
);
