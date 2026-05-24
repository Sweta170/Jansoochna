const netaData = [
  {
    id: 'ward-42-ludhiana',
    name: 'Rajesh Kumar',
    designation: 'Ward Councillor',
    ward: 'Ward 42',
    party: 'AAP',
    pincodes: ['141001', '141002'],
    attendance: { meetings: 24, attended: 18 },
    funds: {
      allocated: 45, // lakhs
      spent: 31,
      projects: [
        { name: 'Sector 7 road repair', status: 'complete' },
        { name: 'Nali nirman Ward 42', status: 'stalled' },
        { name: 'Park renovation', status: 'ongoing' }
      ]
    },
    promises: [
      { text: '24 ghante paani supply', year: 2022, status: 'notdone' },
      { text: 'Nali nirman', year: 2022, status: 'partial' },
      { text: 'Street lights', year: 2022, status: 'done' }
    ],
    contact: { phone: '98760-12345', office: 'Municipal Corporation Office, Ludhiana' }
  },
  {
    id: 'ward-12-amritsar',
    name: 'Harpreet Singh',
    designation: 'Ward Councillor',
    ward: 'Ward 12',
    party: 'INC',
    pincodes: ['143001', '143005'],
    attendance: { meetings: 30, attended: 27 },
    funds: {
      allocated: 60, // lakhs
      spent: 54,
      projects: [
        { name: 'Heritage Street Cleanliness Drive', status: 'complete' },
        { name: 'CCTV Installation near Golden Temple', status: 'complete' },
        { name: 'Sewerage line replacement', status: 'ongoing' }
      ]
    },
    promises: [
      { text: 'Safai vyavastha sudhar', year: 2022, status: 'done' },
      { text: 'CCTV cameras for security', year: 2022, status: 'done' },
      { text: 'Free drinking water taps', year: 2022, status: 'partial' }
    ],
    contact: { phone: '98140-54321', office: 'Town Hall, Amritsar' }
  },
  {
    id: 'ward-5-jalandhar',
    name: 'Sarabjit Kaur',
    designation: 'Ward Councillor',
    ward: 'Ward 5',
    party: 'SAD',
    pincodes: ['144001', '144003'],
    attendance: { meetings: 20, attended: 12 },
    funds: {
      allocated: 40,
      spent: 20,
      projects: [
        { name: 'LED street light installation', status: 'complete' },
        { name: 'Community Hall construction', status: 'stalled' }
      ]
    },
    promises: [
      { text: 'LED street lights', year: 2022, status: 'done' },
      { text: 'New park development', year: 2022, status: 'notdone' }
    ],
    contact: { phone: '94170-98765', office: 'Municipal Corporation, Jalandhar' }
  },
  {
    id: 'ward-18-patiala',
    name: 'Manpreet Singh',
    designation: 'Ward Councillor',
    ward: 'Ward 18',
    party: 'AAP',
    pincodes: ['147001', '147002'],
    attendance: { meetings: 28, attended: 26 },
    funds: {
      allocated: 50,
      spent: 42,
      projects: [
        { name: 'Model School renovation', status: 'complete' },
        { name: 'Pothole repairs Patiala Club Road', status: 'complete' },
        { name: 'Solid Waste Segregation unit', status: 'ongoing' }
      ]
    },
    promises: [
      { text: 'Sarkari school sudhar', year: 2022, status: 'done' },
      { text: 'Koode ka sahi nikal', year: 2022, status: 'partial' },
      { text: 'Road repair', year: 2022, status: 'done' }
    ],
    contact: { phone: '98880-11223', office: 'MC Office, Near Baradari, Patiala' }
  },
  {
    id: 'ward-3-mohali',
    name: 'Gurmeet Singh',
    designation: 'Ward Councillor',
    ward: 'Ward 3',
    party: 'AAP',
    pincodes: ['160055', '160059', '160062'],
    attendance: { meetings: 25, attended: 22 },
    funds: {
      allocated: 75,
      spent: 62,
      projects: [
        { name: 'Sector 68 Stormwater drainage', status: 'complete' },
        { name: 'Phase 7 market parking upgrade', status: 'ongoing' },
        { name: 'Green belt jogging track', status: 'complete' }
      ]
    },
    promises: [
      { text: 'Water logging problem solution', year: 2022, status: 'done' },
      { text: 'Jogging tracks in parks', year: 2022, status: 'done' },
      { text: 'Parking space management', year: 2022, status: 'partial' }
    ],
    contact: { phone: '98720-65432', office: 'Municipal Bhawan, Sector 68, Mohali' }
  }
]

module.exports = netaData
