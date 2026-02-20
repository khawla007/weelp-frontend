// @ts-check
/**
 * Data type of Review Status
 * @typedef {"approved" | "pending"} ReviewStatus
 */

/**
 * Allowed item types for review dropdowns
 * @typedef {"itinerary" | "activity" | "package" |""} ItemType
 */

/**
 * Data type for a Review Select Option
 * @typedef {Object} ReviewSelectOption
 * @property {string} value - The value of the option (could be string or number)
 * @property {string} label - The display label for the option
 */

/**
 * Data type for a Review Select Option2
 * @typedef {Object} ReviewSelectOption2
 * @property {string|number} id - The value of the option (could be string or number)
 * @property {string} name - The display name for the option
 */

/**
 * Interface for Review Form Admin Side
 * @typedef {Object} ReviewFormValues
 * @property {number} user_id - ID of the user submitting the review
 * @property {string} item_type - Type of item being reviewed (e.g., "activity", "package", "itinerary")
 * @property {number} item_id - ID of the item being reviewed
 * @property {number} rating - Rating value (e.g., 1-5)
 * @property {string} review_text - The review content
 * @property {ReviewStatus} status - Status of the Review
 * @property {number[]} media_gallery - Array of image IDs attached to the review
 */

/** Interface for Review Form Customer Side
 * @typedef {Object} ReviewFormCustomer
 * @property {ItemType} item_type - Type of item being reviewed (e.g., "activity", "package", "itinerary")
 * @property {number} item_id - ID of the item being reviewed
 * @property {string|number} rating - Rating value (e.g., 1-5)
 * @property {string} review_text - The review content
 * @property {number[]} existing_media_ids
 * @property {Object[]} file
 */
