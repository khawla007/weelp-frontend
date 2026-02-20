// src/utils/__tests__/generateSlug.test.ts
import { generateSlug } from "@/lib/utils";

describe('generateSlug', () => {
  test('converts a normal string to lowercase and hyphenated', () => {
    expect(generateSlug('My Product Name')).toBe('my-product-name');
  });

  test('removes special characters', () => {
    expect(generateSlug('Cool! Product@123')).toBe('cool-product123');
  });

  test('trims leading and trailing spaces', () => {
    expect(generateSlug('   Leading and trailing   ')).toBe('leading-and-trailing');
  });

  test('replaces multiple spaces with single hyphen', () => {
    expect(generateSlug('Multiple   spaces')).toBe('multiple-spaces');
  });

  test('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  test('handles numbers only', () => {
    expect(generateSlug('123 456')).toBe('123-456');
  });
});

