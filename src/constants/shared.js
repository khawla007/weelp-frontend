const SORT_BY = [
  { name: 'Price: Low to High', value: 'price_asc' },
  { name: 'Price: High to Low', value: 'price_desc' },
  { name: 'Name: A to Z', value: 'name_asc' },
  { name: 'Name: Z to A', value: 'name_desc' },
  { name: 'ID: Oldest First', value: 'id_asc' },
  { name: 'ID: Newest First', value: 'id_desc' },
  { name: 'Featured First', value: 'featured' },
  { name: 'Default (Newest First)', value: 'default' },
];

const LANGUAGES = [
  { label: 'English', value: 'english' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'French', value: 'french' },
  { label: 'German', value: 'german' },
  { label: 'Italian', value: 'italian' },
  { label: 'Portuguese', value: 'portuguese' },
  { label: 'Arabic', value: 'arabic' },
  { label: 'Hindi', value: 'hindi' },
  { label: 'Turkish', value: 'turkish' },
];

const CURRENCY = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];

const GMT_TIMEZONE = [
  { value: 'GMT-12:00', label: 'GMT-12:00' },
  { value: 'GMT-11:00', label: 'GMT-11:00' },
  { value: 'GMT-10:00', label: 'GMT-10:00' },
  { value: 'GMT-09:00', label: 'GMT-09:00' },
  { value: 'GMT-08:00', label: 'GMT-08:00' },
  { value: 'GMT-07:00', label: 'GMT-07:00' },
  { value: 'GMT-06:00', label: 'GMT-06:00' },
  { value: 'GMT-05:00', label: 'GMT-05:00' },
  { value: 'GMT-04:00', label: 'GMT-04:00' },
  { value: 'GMT-03:00', label: 'GMT-03:00' },
  { value: 'GMT-02:00', label: 'GMT-02:00' },
  { value: 'GMT-01:00', label: 'GMT-01:00' },
  { value: 'GMT+00:00', label: 'GMT+00:00' },
  { value: 'GMT+01:00', label: 'GMT+01:00' },
  { value: 'GMT+02:00', label: 'GMT+02:00' },
  { value: 'GMT+03:00', label: 'GMT+03:00' },
  { value: 'GMT+04:00', label: 'GMT+04:00' },
  { value: 'GMT+05:00', label: 'GMT+05:00' },
  { value: 'GMT+05:30', label: 'GMT+05:30' },
  { value: 'GMT+06:00', label: 'GMT+06:00' },
  { value: 'GMT+07:00', label: 'GMT+07:00' },
  { value: 'GMT+08:00', label: 'GMT+08:00' },
  { value: 'GMT+09:00', label: 'GMT+09:00' },
  { value: 'GMT+10:00', label: 'GMT+10:00' },
  { value: 'GMT+11:00', label: 'GMT+11:00' },
  { value: 'GMT+12:00', label: 'GMT+12:00' },
];

const LOCAL_CUISINE = [
  { value: 'local_specialties', label: 'Local Specialties' },
  { value: 'street_food', label: 'Street Food' },
  { value: 'fine-dining', label: 'Fine Dining' },
  { value: 'cafes', label: 'Cafes' },
  { value: 'markets', label: 'Markets' },
  { value: 'traditional-restaurants', label: 'Traditional Restaurants' },
];

const PUBLIC_TRANSPORTATION = [
  { value: 'bus', label: 'Bus' },
  { value: 'train', label: 'Train' },
  { value: 'metro', label: 'Metro' },
  { value: 'tram', label: 'Tram' },
  { value: 'subway', label: 'Subway' },
  { value: 'light_rail', label: 'Light rail' },
  { value: 'ferry', label: 'Ferry' },
  { value: 'cable_car', label: 'Cable car' },
  { value: 'monorail', label: 'Monorail' },
  { value: 'trolleybus', label: 'Trolleybus' },
  { value: 'rickshaw', label: 'Rickshaw' },
  { value: 'shared_taxi', label: 'Shared taxi' },
  { value: 'shuttle_bus', label: 'Shuttle bus' },
  { value: 'bike_share', label: 'Bike share' },
  { value: 'scooter_share', label: 'Scooter share' },
];

const CALENDAR_MONTHS = [
  { value: 'january', label: 'January' },
  { value: 'february', label: 'February' },
  { value: 'march', label: 'March' },
  { value: 'april', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'june', label: 'June' },
  { value: 'july', label: 'July' },
  { value: 'august', label: 'August' },
  { value: 'september', label: 'September' },
  { value: 'october', label: 'October' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' },
];

const SEASON_ACTIVITIES = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'beach_activities', label: 'Beach Activities' },
  { value: 'winter_sports', label: 'Winter Sports' },
  { value: 'cultural_events', label: 'Cultural Events' },
  { value: 'festivals', label: 'Festivals' },
];

const EVENT_TYPES = [
  { value: 'cultural', label: 'Cultural' },
  { value: 'festival', label: 'Festival' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'food', label: 'Food' },
  { value: 'religious', label: 'Religious' },
];

const NAV_MENU_ITEMS = [
  {
    title: 'Tour & Experience',
    href: '/',
  },
  {
    title: 'Transfer & Holidays',
    href: '/transfers',
  },
  {
    title: 'Trips',
    href: '/holiday',
  },
  {
    title: 'Explore',
    href: '/explore',
  },
];

export { SORT_BY, LANGUAGES, CURRENCY, GMT_TIMEZONE, LOCAL_CUISINE, PUBLIC_TRANSPORTATION, CALENDAR_MONTHS, SEASON_ACTIVITIES, EVENT_TYPES, NAV_MENU_ITEMS };
