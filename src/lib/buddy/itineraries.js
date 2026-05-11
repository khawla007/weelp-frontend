export const ITINERARIES = [
  {
    id: 'paris-weekend',
    keywords: ['paris', 'france weekend', 'romantic paris', 'weekend in paris', 'paris weekend'],
    title: 'A weekend in Paris',
    reply:
      "Day one is the classic loop — Eiffel Tower at sunrise, then the Louvre when it opens.\nDay two drifts uphill through Montmartre and finishes at Notre-Dame as the bells ring.\nWalk most of it; the Metro only earns its keep after dark.",
    markers: [
      { label: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
      { label: 'Louvre', lat: 48.8606, lng: 2.3376 },
      { label: 'Montmartre', lat: 48.8867, lng: 2.3431 },
      { label: 'Notre-Dame', lat: 48.853, lng: 2.3499 },
    ],
    route: {
      coordinates: [
        [2.2945, 48.8584],
        [2.3376, 48.8606],
        [2.3431, 48.8867],
        [2.3499, 48.853],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'tokyo-three-days',
    keywords: ['tokyo', '3 days in tokyo', 'three days tokyo', 'japan tokyo', 'tokyo trip'],
    title: '3 days in Tokyo',
    reply:
      "Start in Shibuya for the crossing and a long coffee, then drift north into Shinjuku Gyoen.\nDay two belongs to Asakusa and Senso-ji, with Meiji Shrine quiet enough to hear the gravel.\nFinish at Tokyo Tower after dark — the city looks calmer from up there than it feels.",
    markers: [
      { label: 'Shibuya Crossing', lat: 35.6595, lng: 139.7005 },
      { label: 'Shinjuku Gyoen', lat: 35.6852, lng: 139.71 },
      { label: 'Senso-ji', lat: 35.7148, lng: 139.7967 },
      { label: 'Meiji Shrine', lat: 35.6764, lng: 139.6993 },
      { label: 'Tokyo Tower', lat: 35.6586, lng: 139.7454 },
    ],
    route: {
      coordinates: [
        [139.7005, 35.6595],
        [139.71, 35.6852],
        [139.7967, 35.7148],
        [139.6993, 35.6764],
        [139.7454, 35.6586],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'rome-romantic',
    keywords: ['rome', 'romantic rome', 'italy rome', 'rome trip', 'eternal city'],
    title: 'Romantic Rome',
    reply:
      "Mornings are for the Colosseum and Forum before the heat lands.\nLunch near the Pantheon, then a slow loop through Trevi when the coin tossers thin out.\nClose the day across the river at the Vatican — golden hour does most of the work.",
    markers: [
      { label: 'Colosseum', lat: 41.8902, lng: 12.4922 },
      { label: 'Roman Forum', lat: 41.8925, lng: 12.4853 },
      { label: 'Pantheon', lat: 41.8986, lng: 12.4769 },
      { label: 'Trevi Fountain', lat: 41.9009, lng: 12.4833 },
      { label: 'Vatican City', lat: 41.9029, lng: 12.4534 },
    ],
    route: {
      coordinates: [
        [12.4922, 41.8902],
        [12.4853, 41.8925],
        [12.4769, 41.8986],
        [12.4833, 41.9009],
        [12.4534, 41.9029],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'nyc-classic',
    keywords: ['nyc', 'new york', 'new york city', 'manhattan', 'big apple'],
    title: 'A long weekend in New York',
    reply:
      "Start at Times Square only long enough to know you've been, then walk it off in Central Park.\nDay two is downtown — Empire State for the view, Brooklyn Bridge on foot at dusk.\nFerry to the Statue on the last morning, before flights make you sentimental.",
    markers: [
      { label: 'Times Square', lat: 40.758, lng: -73.9855 },
      { label: 'Central Park', lat: 40.7829, lng: -73.9654 },
      { label: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
      { label: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
      { label: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
    ],
    route: {
      coordinates: [
        [-73.9855, 40.758],
        [-73.9654, 40.7829],
        [-73.9857, 40.7484],
        [-73.9969, 40.7061],
        [-74.0445, 40.6892],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'bali-ubud',
    keywords: ['bali', 'ubud', 'indonesia bali', 'bali trip', 'ubud area'],
    title: 'Ubud and the hills above',
    reply:
      "Base yourself in Ubud — the Palace and Monkey Forest are a single afternoon.\nScooter up to Tegallalang for the rice terraces early, then Tirta Empul to cool down.\nIf you're awake before the world is, Mount Batur at sunrise is worth the lost sleep.",
    markers: [
      { label: 'Ubud Palace', lat: -8.5069, lng: 115.2625 },
      { label: 'Sacred Monkey Forest', lat: -8.5188, lng: 115.2588 },
      { label: 'Tegallalang Rice Terraces', lat: -8.4314, lng: 115.2776 },
      { label: 'Tirta Empul', lat: -8.4156, lng: 115.3151 },
      { label: 'Mount Batur', lat: -8.2421, lng: 115.3753 },
    ],
    route: {
      coordinates: [
        [115.2625, -8.5069],
        [115.2588, -8.5188],
        [115.2776, -8.4314],
        [115.3151, -8.4156],
        [115.3753, -8.2421],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'dubai-skyline',
    keywords: ['dubai', 'uae', 'emirates dubai', 'dubai trip', 'burj khalifa'],
    title: 'Dubai in two days',
    reply:
      "Burj Khalifa first thing, then drift through the Dubai Mall when the desert heat asks you to.\nAfternoon belongs to the Palm and Marina — the boardwalk earns the walk.\nFinish with a drink in sight of the Burj Al Arab; the silhouette never gets old.",
    markers: [
      { label: 'Burj Khalifa', lat: 25.1972, lng: 55.2744 },
      { label: 'Dubai Mall', lat: 25.1985, lng: 55.2796 },
      { label: 'Palm Jumeirah', lat: 25.1124, lng: 55.139 },
      { label: 'Dubai Marina', lat: 25.0817, lng: 55.1394 },
      { label: 'Burj Al Arab', lat: 25.1412, lng: 55.1853 },
    ],
    route: {
      coordinates: [
        [55.2744, 25.1972],
        [55.2796, 25.1985],
        [55.139, 25.1124],
        [55.1394, 25.0817],
        [55.1853, 25.1412],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'iceland-ring-road',
    keywords: ['iceland', 'reykjavik', 'ring road iceland', 'iceland ring road', 'golden circle'],
    title: 'Iceland — Reykjavik and the Golden Circle',
    reply:
      "Sleep in Reykjavik, but don't linger — Þingvellir is a short drive and quieter early.\nGeysir and Gullfoss come back to back; pack waterproofs, even if the sky lies.\nPush south to Seljalandsfoss and Vík if the days are long; otherwise loop home for soup.",
    markers: [
      { label: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
      { label: 'Þingvellir', lat: 64.2558, lng: -21.1295 },
      { label: 'Geysir', lat: 64.3104, lng: -20.3024 },
      { label: 'Gullfoss', lat: 64.3275, lng: -20.1199 },
      { label: 'Seljalandsfoss', lat: 63.6156, lng: -19.9888 },
      { label: 'Vík', lat: 63.4194, lng: -19.0073 },
    ],
    route: {
      coordinates: [
        [-21.9426, 64.1466],
        [-21.1295, 64.2558],
        [-20.3024, 64.3104],
        [-20.1199, 64.3275],
        [-19.9888, 63.6156],
        [-19.0073, 63.4194],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'barcelona-gaudi',
    keywords: ['barcelona', 'spain barcelona', 'gaudi', 'catalonia', 'barca trip'],
    title: 'Barcelona on foot',
    reply:
      "Sagrada Familia takes the morning — book the tower slot, the stairs are worth it.\nWalk up to Park Güell for the city laid flat, then back down via Casa Batlló.\nLas Ramblas drains into Barceloneta — end the day with your shoes off in the sand.",
    markers: [
      { label: 'Sagrada Família', lat: 41.4036, lng: 2.1744 },
      { label: 'Park Güell', lat: 41.4145, lng: 2.1527 },
      { label: 'Casa Batlló', lat: 41.3917, lng: 2.1649 },
      { label: 'La Rambla', lat: 41.3818, lng: 2.1727 },
      { label: 'Barceloneta Beach', lat: 41.3784, lng: 2.1925 },
    ],
    route: {
      coordinates: [
        [2.1744, 41.4036],
        [2.1527, 41.4145],
        [2.1649, 41.3917],
        [2.1727, 41.3818],
        [2.1925, 41.3784],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'bangkok-temples',
    keywords: ['bangkok', 'thailand bangkok', 'wat pho', 'bangkok trip', 'temples bangkok'],
    title: 'Bangkok temples and markets',
    reply:
      "Grand Palace at opening — modest sleeves, modest pace.\nWat Pho is next door for the reclining Buddha, then ferry across to Wat Arun.\nNorth to Chatuchak if it's a weekend, otherwise let Khao San find you after dark.",
    markers: [
      { label: 'Grand Palace', lat: 13.75, lng: 100.4914 },
      { label: 'Wat Pho', lat: 13.7465, lng: 100.4927 },
      { label: 'Wat Arun', lat: 13.7437, lng: 100.4889 },
      { label: 'Chatuchak Market', lat: 13.7997, lng: 100.55 },
      { label: 'Khao San Road', lat: 13.759, lng: 100.4977 },
    ],
    route: {
      coordinates: [
        [100.4914, 13.75],
        [100.4927, 13.7465],
        [100.4889, 13.7437],
        [100.55, 13.7997],
        [100.4977, 13.759],
      ],
    },
    fit_bounds: true,
  },
  {
    id: 'cape-town-peninsula',
    keywords: ['cape town', 'south africa', 'table mountain', 'cape peninsula', 'cape town trip'],
    title: 'Cape Town in three days',
    reply:
      "Take the cable car up Table Mountain on the clearest morning you get.\nV&A Waterfront for lunch, then ferry across to Robben Island when the wind allows.\nDay three is Bo-Kaap's colour and a long drive south to Cape Point.",
    markers: [
      { label: 'Table Mountain', lat: -33.9628, lng: 18.4098 },
      { label: 'V&A Waterfront', lat: -33.9036, lng: 18.4196 },
      { label: 'Robben Island', lat: -33.8067, lng: 18.3667 },
      { label: 'Bo-Kaap', lat: -33.9197, lng: 18.4138 },
      { label: 'Cape Point', lat: -34.3568, lng: 18.497 },
    ],
    route: {
      coordinates: [
        [18.4098, -33.9628],
        [18.4196, -33.9036],
        [18.3667, -33.8067],
        [18.4138, -33.9197],
        [18.497, -34.3568],
      ],
    },
    fit_bounds: true,
  },
];
