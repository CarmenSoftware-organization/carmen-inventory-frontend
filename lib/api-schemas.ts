import { z } from "zod";

// Base wrapper for all paginated API responses
export const paginateSchema = z.object({
  total: z.number(),
  page: z.number(),
  perpage: z.number(),
  pages: z.number(),
});

export function paginatedResponse<T extends z.ZodType>(itemSchema: T) {
  return z.looseObject({
    data: z.array(itemSchema),
    paginate: paginateSchema,
  });
}

// API envelope (backend wraps data in { data: ... })
export function apiEnvelope<T extends z.ZodType>(dataSchema: T) {
  return z.object({ data: dataSchema });
}
