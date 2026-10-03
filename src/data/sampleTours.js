export const sampleTours = [
  {
    _id: 'sample-bodh-gaya', slug: 'bodh-gaya-heritage', title: 'A day in Bodh Gaya', destination: 'Bodh Gaya',
    summary: 'Visit the Mahabodhi Temple and explore one of Buddhism’s most important pilgrimage sites.', category: 'Spiritual', durationDays: 1,
    price: 3200, averageRating: 4.96, reviewCount: 128, images: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Great_Buddha_statue_at_Bodh_Gaya%2C_Bihar%2C_India.jpg/1280px-Great_Buddha_statue_at_Bodh_Gaya%2C_Bihar%2C_India.jpg'],
    itinerary: [{ day: 1, title: 'Mahabodhi Temple and Great Buddha', description: 'Visit the UNESCO-listed temple complex and the Great Buddha statue.', location: 'Bodh Gaya' }],
    coordinates: { latitude: 24.6961, longitude: 84.9869 }, departures: [{ _id: 'bodh-gaya-oct', startDate: '2026-10-14', endDate: '2026-10-14', seatsAvailable: 8 }]
  },
  {
    _id: 'sample-rajgir', slug: 'rajgir-and-nalanda', title: 'Rajgir & ancient Nalanda', destination: 'Rajgir',
    summary: 'Take in Rajgir’s hills and visit the historic ruins of Nalanda.', category: 'Heritage', durationDays: 2,
    price: 5800, averageRating: 4.91, reviewCount: 86, images: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Another_view_of_the_Stupa_of_ancient_Nalanda_Mahavihara.jpg/960px-Another_view_of_the_Stupa_of_ancient_Nalanda_Mahavihara.jpg'],
    itinerary: [
      { day: 1, title: 'Rajgir hills and Peace Pagoda', description: 'Take in the hilltop views and visit the Vishwa Shanti Stupa.', location: 'Rajgir' },
      { day: 2, title: 'Ancient Nalanda', description: 'Walk through the remains of one of the world’s oldest universities.', location: 'Nalanda' }
    ],
    coordinates: { latitude: 25.0285, longitude: 85.4206 }, departures: [{ _id: 'rajgir-nov', startDate: '2026-11-09', endDate: '2026-11-10', seatsAvailable: 6 }]
  },
  {
    _id: 'sample-vaishali', slug: 'vaishali-heritage', title: 'The stories of Vaishali', destination: 'Vaishali',
    summary: 'Discover ancient sites and the history of one of Bihar’s earliest cities.', category: 'Heritage', durationDays: 1,
    price: 2800, averageRating: 4.88, reviewCount: 74, images: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Shanti_Stupa_%40_Vaishali_-_panoramio.jpg/1280px-Shanti_Stupa_%40_Vaishali_-_panoramio.jpg'],
    itinerary: [{ day: 1, title: 'Ashokan Pillar and ancient Vaishali', description: 'Explore the Ashokan Pillar and archaeological remains of the ancient city.', location: 'Vaishali' }],
    coordinates: { latitude: 25.9917, longitude: 85.1307 }, departures: [{ _id: 'vaishali-dec', startDate: '2026-12-21', endDate: '2026-12-21', seatsAvailable: 10 }]
  },
  {
    _id: 'sample-valmiki', slug: 'valmiki-wildlife', title: 'Into Valmiki Tiger Reserve', destination: 'Valmiki Nagar',
    summary: 'Spend two days among the forests and wildlife of north Bihar.', category: 'Nature', durationDays: 2,
    price: 7400, averageRating: 4.94, reviewCount: 102, images: ['https://upload.wikimedia.org/wikipedia/commons/4/49/Panthera_tigris_tigris.jpg'],
    itinerary: [
      { day: 1, title: 'Forest trails', description: 'Explore the sal forest and the reserve’s river-side landscape.', location: 'Valmiki Tiger Reserve' },
      { day: 2, title: 'Wildlife safari', description: 'Set out with a local guide to look for wildlife in the reserve.', location: 'Valmiki Tiger Reserve' }
    ],
    coordinates: { latitude: 27.3084, longitude: 84.0782 }, departures: [{ _id: 'valmiki-jan', startDate: '2027-01-18', endDate: '2027-01-19', seatsAvailable: 12 }]
  }
];