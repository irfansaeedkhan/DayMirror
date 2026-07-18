import { z } from "zod";

const hourSchema = z.number().int().min(0).max(23);

export const dayQuerySchema = z.object({
  date: z.string().date(),
});

export const dayWindowBodySchema = z
  .object({
    date: z.string().date(),
    startHour: hourSchema,
    endHour: hourSchema,
  })
  // Hours are inclusive (start === end is a valid 1-hour window).
  .refine((v) => v.startHour <= v.endHour, {
    message: "Start hour must be before or equal to end hour",
    path: ["endHour"],
  });

export const dayWindowDeleteQuerySchema = z.object({
  date: z.string().date(),
});

export const resetDayWindowSchema = z.object({
  date: z.string().date(),
});

export const trackerSettingsSchema = z
  .object({
    defaultStartHour: hourSchema,
    defaultEndHour: hourSchema,
  })
  .refine((v) => v.defaultStartHour <= v.defaultEndHour, {
    message: "Start hour must be before or equal to end hour",
    path: ["defaultEndHour"],
  });

export type DayWindowBody = z.infer<typeof dayWindowBodySchema>;
export type TrackerSettingsBody = z.infer<typeof trackerSettingsSchema>;

const sessionHourRange = z
  .object({
    startHour: hourSchema,
    endHour: hourSchema,
  })
  .refine((v) => v.startHour <= v.endHour, {
    message: "Start hour must be before or equal to end hour",
    path: ["endHour"],
  });

export const createSessionSchema = sessionHourRange.extend({
  date: z.string().date(),
  name: z.string().min(1).max(50).default("Session"),
});

export const updateSessionSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50).optional(),
    startHour: hourSchema.optional(),
    endHour: hourSchema.optional(),
  })
  .refine(
    (v) => {
      if (v.startHour !== undefined && v.endHour !== undefined) return v.startHour <= v.endHour;
      return true;
    },
    { message: "Start hour must be before or equal to end hour", path: ["endHour"] },
  );

export const deleteSessionSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSessionBody = z.infer<typeof createSessionSchema>;
export type UpdateSessionBody = z.infer<typeof updateSessionSchema>;
