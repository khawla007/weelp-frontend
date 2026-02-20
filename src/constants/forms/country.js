//  CREATE AND EDIT COUNTRY FORM
const FORM_COUNTRY_VALUES_DEFAULT = {
  name: '',
  slug: '',
  code: '',
  description: '',
  featured_destination: false,

  location_details: {
    latitude: '',
    longitude: '',
    capital_city: '',
    population: 0,
    currency: '',
    timezone: '',
    language: [],
    local_cuisine: [],
  },

  travel_info: {
    airport: '',
    public_transportation: [],
    taxi_available: false,
    rental_cars_available: false,
    hotels: false,
    hostels: false,
    apartments: false,
    resorts: false,
    visa_requirements: '',
    best_time_to_visit: '',
    travel_tips: '',
    safety_information: '',
  },

  seasons: [
    {
      name: '',
      months: '',
      weather: '',
      activities: '',
    },
  ],

  events: [
    {
      name: '',
      type: [],
      date: '',
      location: '',
      description: '',
    },
  ],

  additional_info: [],
  media_gallery: [],
  faqs: [],
  seo: {},
};

//  CREATE AND EDIT STATE FORM VALUES
const FORM_STATE_VALUES_DEFAULT = {
  ...FORM_COUNTRY_VALUES_DEFAULT,
  country_id: '',
};

//  CREATE AND EDIT CITY FORM VALUES
const FORM_CITY_VALUES_DEFAULT = {
  ...FORM_COUNTRY_VALUES_DEFAULT,
  state_id: '',
};

//  CREATE AND EDIT CITY FORM VALUES
const FORM_PLACE_VALUES_DEFAULT = {
  ...FORM_COUNTRY_VALUES_DEFAULT,
  city_id: '',
};
export { FORM_COUNTRY_VALUES_DEFAULT, FORM_STATE_VALUES_DEFAULT, FORM_CITY_VALUES_DEFAULT, FORM_PLACE_VALUES_DEFAULT };
