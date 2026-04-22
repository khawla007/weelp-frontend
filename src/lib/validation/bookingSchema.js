import { z } from 'zod';

/**
 * Shared Zod schema for activity/package/itinerary booking form
 * Used by ProductSidebar and SingleProductForm
 */
export const bookingSchema = z.object({
  dateRange: z
    .object({
      from: z.date().refine(Boolean, 'Start date is required'),
      to: z.date().refine(Boolean, 'End date is required'),
    })
    .refine((data) => data.from && data.to && data.from <= data.to, 'Please Select Date'),
  howMany: z.object({
    adults: z.number().min(1, 'At least 1 adult is required').max(10, 'Maximum 10 adults allowed'),
    children: z.number().min(0).max(10, 'Maximum 10 children allowed'),
    infants: z.number().min(0).max(5, 'Maximum 5 infants allowed'),
  }),
});
