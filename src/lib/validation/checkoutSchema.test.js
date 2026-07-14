import { checkoutSchema } from './checkoutSchema';

const validCheckout = {
  country: 'United Arab Emirates',
  state: 'Dubai',
  city: 'Dubai',
  post_code: '00001',
  phone: '+971 50 123 4567',
  address_line_1: '15 Example Street',
  emergency_contact_name: 'Test Contact',
  emergency_contact_phone: '+971 50 765 4321',
  emergency_contact_relationship: 'Friend',
  special_requirements: '',
};

describe('checkoutSchema', () => {
  it('accepts trimmed international-looking contact details and keeps postcode zeroes', () => {
    const result = checkoutSchema.parse(validCheckout);

    expect(result.post_code).toBe('00001');
    expect(result.phone).toBe('+971 50 123 4567');
  });

  it.each([
    ['country', ''],
    ['state', ''],
    ['city', ''],
    ['post_code', '!'],
    ['phone', '12'],
    ['address_line_1', 'x'],
    ['emergency_contact_name', 'x'],
    ['emergency_contact_phone', 'phone'],
    ['emergency_contact_relationship', ''],
  ])('rejects an invalid %s', (field, value) => {
    const result = checkoutSchema.safeParse({ ...validCheckout, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors[field]).toBeDefined();
  });

  it('rejects excessive special requirements', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, special_requirements: 'x'.repeat(5001) });

    expect(result.success).toBe(false);
  });
});
