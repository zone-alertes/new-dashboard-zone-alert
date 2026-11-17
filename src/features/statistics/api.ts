import { mockRequest } from "@/lib/api/http";
import { STATISTICS } from "@/lib/mock/data/analytics";

export const statisticsApi = {
  monthly: (period: string) => mockRequest(() => ({ ...STATISTICS, period })),
};
