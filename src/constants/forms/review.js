// @ts-check

/**
 * @type {ReviewStatus[]}
 */
export const REVIEW_STATUS = ['approved', 'pending'];

/**
 * For Admin Form
 * @type {ReviewFormValues}
 */
export const FORM_REVIEWS_VALUES_DEFAULT = {
  user_id: null,
  item_type: '',
  item_id: null,
  rating: null,
  review_text: '',
  media_gallery: [],
  status: 'approved',
};

/**
 * @type {ReviewSelectOption[]}
 */
export const FORM_REVIEW_ITEM_TYPE = [
  { value: 'package', label: 'Package' },
  { value: 'activity', label: 'Activity' },
  { value: 'itinerary', label: 'Itinerary' },
];

/**
 * For Customer Form For Reviews
 * @type {ReviewFormCustomer}
 * @param {ReviewFormCustomer} reviewFormData
 */
export const CUSTOMER_REVIEW_VALUES_DEFAULT = {
  item_type: null,
  item_id: null,
  rating: null,
  review_text: '',
  existing_media_ids: [],
  file: [],
};
