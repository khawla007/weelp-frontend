//vehicle type
const VEHICLE_TYPES = [
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Van', value: 'van' },
  { label: 'Minibus', value: 'minibus' },
  { label: 'Bus', value: 'bus' },
  { label: 'Luxury Sedan', value: 'luxury_sedan' },
  { label: 'Luxury SUV', value: 'luxury_suv' },
  { label: 'Shuttle', value: 'shuttle' },
  { label: 'Coach', value: 'coach' },
];

// transfer type
const TRANSFER_TYPES = [
  { label: 'Airport Transfer', value: 'airport_transfer' },
  { label: 'Hotel Transfer', value: 'hotel_transfer' },
  { label: 'Point to Point', value: 'point_to_point' },
  { label: 'Tour Transfer', value: 'tour_transfer' },
];

// availability types for schedule filter
const AVAILABILITY_TYPES = [
  { label: 'Always Available', value: 'always_available' },
  { label: 'Weekdays', value: 'custom_schedule' },
];

// weekdays for schedule filter
const WEEKDAYS = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' },
];

export { VEHICLE_TYPES, TRANSFER_TYPES, AVAILABILITY_TYPES, WEEKDAYS };
