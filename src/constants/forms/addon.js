// @ts-check

/**
 * Add On Type Values
 * @type {AddOnType[]}
 */
export const ADDON_TYPES = ['activity', 'package', 'itinerary', 'transfer'];

/**
 * Add On Dropdown Options
 * @type {AddOnSelectOption[]}
 */
export const FORM_ADDON_ITEMTYPE = [
  { value: 'package', label: 'Package' },
  { value: 'itinerary', label: 'Itinerary' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'activity', label: 'Activity' },
];

/**
 * Add On Dropdown Options
 * @type {AddOnSelectOption[]}
 */
export const FORM_ADDON_PRICE_CALCULATION_BY = [
  { value: 'per_package', label: 'Per Package' },
  { value: 'per_activity', label: 'Per Activity' },
  { value: 'per_itinerary', label: 'Per Itinerary' },
  { value: 'per_transfer', label: 'Per Transfer' },
];

/**
 * Default value for Add On Form
 * @type {AddOnForm}
 */
export const FORM_ADDON_VALUES_DEFAULT = {
  name: '',
  type: '',
  description: '',
  price: 0,
  sale_price: 0,
  price_calculation: 'per_package',
  active_status: false,
};

/**
 * Add On Dropdown Options FOR STATUS QUERY
 * @type {AddOnSelectOption[]}
 */
export const FORM_ADDON_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'In Active' },
];
