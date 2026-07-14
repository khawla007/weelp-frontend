import { z } from 'zod';

const requiredText = (label, min = 1, max = 200) => z.string().trim().min(min, `${label} is required`).max(max, `${label} is too long`);

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .max(32, 'Phone number is too long')
  .regex(/^\+?[0-9()\-\s]+$/, 'Enter a valid phone number')
  .refine((value) => value.replace(/\D/g, '').length >= 7, 'Enter a valid phone number');

export const checkoutSchema = z.object({
  country: requiredText('Country', 1, 100),
  state: requiredText('State', 1, 100),
  city: requiredText('City', 1, 100),
  post_code: z
    .string()
    .trim()
    .min(2, 'Enter a valid postcode')
    .max(16, 'Postcode is too long')
    .regex(/^[\p{L}\p{N}\s-]+$/u, 'Enter a valid postcode'),
  phone: phoneSchema,
  address_line_1: requiredText('Address', 5, 300),
  emergency_contact_name: requiredText('Emergency contact name', 2, 200),
  emergency_contact_phone: phoneSchema,
  emergency_contact_relationship: requiredText('Relationship', 1, 100),
  special_requirements: z.string().trim().max(5000, 'Special requirements are too long').optional().default(''),
});
