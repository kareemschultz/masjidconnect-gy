// ─── Verified Masjid List — Georgetown & surrounding areas, Guyana ──────────
// Coordinates verified via OpenStreetMap, prayersconnect.com, eSalah, Wikidata
// Plus Codes decoded using Open Location Code algorithm
// Last updated: 2026-02-19

export const masjids = [

  // ── Georgetown — Verified ────────────────────────────────────────────────

  {
    id: 'queenstown',
    name: 'Queenstown Jama Masjid',
    address: '295 Church Street, Queenstown, Georgetown',
    lat: 6.810161,
    lng: -58.151108,
    contact: '',
    notes: "Georgetown's principal masjid, founded 1895. Three-storey building, capacity 1,000. Two iconic octagonal minarets. Listed on GIT Lecture Tour 2026.",
    features: ['parking', 'sisters_section', 'wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'woolford',
    name: 'Woolford Avenue Mosque (MYO/CIOG)',
    address: 'Woolford Avenue, Thomas Lands, Georgetown',
    lat: 6.818086,
    lng: -58.153222,
    contact: '592-225-6167',
    notes: 'Home of the Muslim Youth Organisation (MYO) and CIOG headquarters. Hosts the National Ramadan Village on MYO lawns.',
    features: ['parking', 'sisters_section', 'wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'kitty',
    name: 'Kitty Jamaat Masjid',
    address: '79 Sandy Babb Street, Kitty, Georgetown',
    lat: 6.817111,
    lng: -58.140062,
    contact: '',
    notes: 'Well-established masjid in the heart of Kitty. Active Ramadan programs. Listed on GIT Lecture Tour 2026.',
    features: ['parking', 'sisters_section', 'wudu_facilities'],
    image: null,
    verified: true,
    prayerTimes: {
      Fajr: '5:20 AM',
      Zuhr: '12:40 PM',
      Asr: '5:00 PM',
      Maghrib: '6:05 PM',
      Isha: '7:30 PM',
      "Jumu'ah": '12:30 PM',
    },
    prayerNote: 'These are Adhan times. Salah begins 10 minutes after.',
    masjidInfo: {
      imam: { name: 'Moulana Abdullah Khan', contact: '', bio: '' },
      taraweeh: [
        { name: 'Mufti Sajid Khan', contact: '', bio: '' },
        { name: 'Hafiz Anas', contact: '', bio: '' },
      ],
    },
  },

  {
    id: 'darul_uloom',
    name: 'Darul Uloom Mosque',
    address: '310 East Street, Alberttown, Georgetown',
    lat: 6.8137,
    lng: -58.1563,
    contact: '+592 223 0579',
    notes: 'Darul Uloom masjid serving the Alberttown area on East Street.',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'sunnatul',
    name: 'East Georgetown Sunnatul Jama Masjid',
    address: 'Prashad Nagar, East Georgetown',
    lat: 6.812188,
    lng: -58.130063,
    contact: '+592 231 6575',
    notes: 'Sunni masjid in the Prashad Nagar / East Georgetown area.',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'anjuman_lahore',
    name: "Ahmadiyya Anjuman Isha'at-I-Islam Lahore",
    address: '76 Brickdam & Winter Place, Stabroek, Georgetown',
    lat: 6.806106,
    lng: -58.156321,
    contact: '',
    notes: 'Lahore Ahmadiyya community mosque at the Brickdam headquarters, near Stabroek Market.',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'baitul_noor',
    name: 'Baitul Noor Mosque',
    address: '198 Oronoque & Lance Gibbs Streets, Queenstown, Georgetown',
    lat: 6.8131,
    lng: -58.1509,
    contact: '+592 226-7634',
    notes: 'Ahmadiyya Muslim Community mosque. Note: As of late 2025, the building was demolished to make way for a new 2-storey masjid complex — construction ongoing.',
    features: ['sisters_section', 'wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'old_mosque',
    name: 'Old Mosque',
    address: 'Georgetown',
    lat: 6.794688,
    lng: -58.167188,
    contact: '+592 621 5331',
    notes: 'Historic mosque in southern Georgetown. Plus Code: QRVM+V4F.',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  // ── East Georgetown / East Bank Demerara ─────────────────────────────────

  {
    id: 'turkeyen',
    name: 'Turkeyen Masjid',
    address: 'Turkeyen, East Georgetown',
    lat: 6.801188,
    lng: -58.118063,
    contact: '+592 219 4286',
    notes: 'Sunni mosque serving the Turkeyen and Sophia communities, associated with the Turkeyen Muslim Association.',
    features: ['parking', 'sisters_section', 'wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'mcdoom',
    name: 'McDoom Masjid',
    address: 'McDoom, East Bank Demerara',
    lat: 6.782563,
    lng: -58.169563,
    contact: '+592 227 1546',
    notes: 'Community masjid serving the McDoom area on the East Bank.',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  {
    id: 'providence',
    name: 'Providence Sunnatul Masjid',
    address: 'East Bank Public Road, Providence, East Bank Demerara',
    lat: 6.755937,
    lng: -58.181063,
    contact: '',
    notes: 'Masjid serving the Providence community on the East Bank Demerara.',
    features: ['parking', 'wudu_facilities'],
    image: null,
    verified: true,
  },

  // ── Alexander Village ─────────────────────────────────────────────────────

  {
    id: 'alexander_old',
    name: 'Old Mosque (Alexander Village)',
    address: 'Alexander Village, Georgetown',
    lat: 6.7960,
    lng: -58.1642,
    contact: '',
    notes: 'Long-established masjid in Alexander Village. Exact street address to be confirmed.',
    features: ['wudu_facilities'],
    image: null,
    verified: false,
  },

  {
    id: 'alexander_new',
    name: 'New Mosque (Alexander Village)',
    address: 'Alexander Village, Georgetown',
    lat: 6.7960,
    lng: -58.1642,
    contact: '',
    notes: 'Newer masjid in Alexander Village. Exact street address and coordinates to be confirmed.',
    features: ['wudu_facilities'],
    image: null,
    verified: false,
  },

  // ── West Bank / Cross-River ───────────────────────────────────────────────

  {
    id: 'masjid_an_nur',
    name: 'Masjid An Nur',
    address: 'Westminster, West Bank Demerara',
    lat: 6.774438,
    lng: -58.228313,
    contact: '',
    notes: 'Masjid serving the Westminster community on the West Bank Demerara (accessible via Demerara Harbour Bridge).',
    features: ['wudu_facilities'],
    image: null,
    verified: true,
  },

  // ── Albouystown ───────────────────────────────────────────────────────────────

  {
    id: 'masjid_an_najm',
    name: 'Masjid An-Najm & Social Centre',
    address: 'Albouystown, Georgetown (former Star Cinema)',
    lat: 6.8003,
    lng: -58.1625,
    contact: '',
    notes: 'GIT-affiliated masjid and social centre opened 2012 at the former Star Cinema in Albouystown. Runs community outreach programs.',
    features: ['wudu_facilities'],
    image: null,
    verified: false,
  },

  // ── Mandela Avenue ────────────────────────────────────────────────────────────

  {
    id: 'mandela_masjid',
    name: 'Mandela Masjid',
    address: 'Mandela Avenue area, Georgetown',
    lat: 6.8050,
    lng: -58.1580,
    contact: '',
    notes: 'Masjid in the Mandela Avenue area of Georgetown. Exact address and coordinates to be confirmed.',
    features: ['wudu_facilities'],
    image: null,
    verified: false,
  },

];

export const featureLabels = {
  parking:         { label: 'Parking',         icon: '🅿️' },
  sisters_section: { label: 'Sisters Section', icon: '👩' },
  wudu_facilities: { label: 'Wudu',            icon: '💧' },
  wheelchair:      { label: 'Wheelchair',       icon: '♿' },
};
