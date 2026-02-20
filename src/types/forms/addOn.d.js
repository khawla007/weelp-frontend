// @ts-check

/**
 * Data type of AddOn Type Dropdowns
 * @typedef {"itinerary" | "activity" | "package" |"transfer" | "" } AddOnType
 */

/**
 * Data type for a add Review Select Option
 * @typedef {Object} AddOnSelectOption
 * @property {string} value - The value of the option (could be string or number)
 * @property {string} label - The display label for the option
 */

/**
 * @typedef {Object} AddOnForm
 * @property {string} name - The name of the add-on.
 * @property {AddOnType} type - The type/category of the add-on.
 * @property {string|null} [description] - A detailed description of the add-on.)
 * @property {number} price - The base price of the add-on.
 * @property {number} [sale_price] - The discounted price of the add-on.
 * @property {string} price_calculation - Defines how the price should be calculated.
 * @property {boolean} [active_status=false] - Whether the add-on is active or not. Defaults to `false`.
 */
