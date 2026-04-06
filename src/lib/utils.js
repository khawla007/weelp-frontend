import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Create Method for  Delay Execution Promise
 * @param {Number} ms pass number
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create Log method for checking where it come file
 * @param  {...any} args
 */
export const log = (...args) => {
  const error = new Error();
  const stack = error.stack.split('\n')[2].trim(); // Get the caller info from stack trace
  const match = stack.match(/(\/[^/]+)+:\d+:\d+/); // Extract file and line:column
  const filePath = match ? match[0] : 'unknown source';

  console.log(`🚀 [${filePath}] `, ...args); // Log with file info
};

/**
 * Create Slug of Product Based on Name
 * @param {*} value
 * @returns "string"
 */
export const generateSlug = (value) => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
};

/**
 * Get Actual date from Date Instances
 * @param {*} str
 * @returns "string"
 */
export const actualDate = (str) => {
  return String(str).split('T').at(0);
};

/**
 * Remove sign from Strings
 * @param {*} string
 * @returns string
 */
export const stringSignRemover = (string) => {
  return String(string).replace(/[^a-zA-Z0-9 ]/g, ' ');
};

/**
 * Remove key from Array of Objects { desiredkeytoremove: " " || {} }
 * @param {Array} array
 * @param {string} nestedKey
 * @returns []
 */
export function removeNestedKey(arr, keyToRemove) {
  return arr.map((item) => {
    if (isObject(item)) {
      const newItem = omit(item, keyToRemove); // Remove the key
      // Recursively remove the key from nested objects/values
      return mapValues(newItem, (val) => removeNestedKey([val], keyToRemove)[0]);
    }
    return item;
  });
}

/**
 * Format String Space to Comma "word1 word2" =>"word1 ,word2"
 * @param {String} string
 * @returns string
 */
export const addCommabetweenString = (string) => {
  return string
    .split(/[\s,]+/) // split by spaces or commas
    .filter(Boolean) // remove empty strings
    .join(' , ');
};

/**
 * Formats amount into a currency string.
 * @param {number} amount - Amount of currency in major units.
 * @param {string} currency - Currency code (ISO 4217), e.g. "USD", "INR", "EUR".
 * @param {string} [locale="en-US"] - Optional locale for formatting, defaults to "en-US".
 * @returns {string} - Formatted currency string.
 * @example
 * formatCurrency(60, "USD") // "$60.00"
 * formatCurrency(2500, "INR", "en-IN") // "₹2,500.00"
 * formatCurrency(1200, "JPY", "ja-JP") // "￥1,200"
 */
export function formatCurrency(amount, currency, locale = 'en-US') {
  if (amount === null && amount === undefined && currency === null) {
    return '';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Returns a human-readable relative time string (e.g., "5m ago", "2h ago")
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.4 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return 'Unknown';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
