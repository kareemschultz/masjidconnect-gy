// ── Islamic Lecture Series ────────────────────────────────────────────────────
// Streamed from archive.org (open access, no account required)
// archiveId: the archive.org item identifier
// tracks: optional individual track list — if omitted, links to item page
// Direct URL format: https://archive.org/download/{archiveId}/{file}

export const lectureSeries = [

  // ── Seerah (Life of the Prophet ﷺ) ─────────────────────────────────────────

  {
    id: 'seerah-makkah',
    title: 'Life of Muhammad ﷺ — Makkan Period',
    speaker: 'Imam Anwar Al-Awlaki',
    category: 'Seerah',
    archiveId: 'lifeofmuhammadmakkah',
    description: 'A comprehensive study of the Prophet\'s ﷺ life in Makkah, based primarily on Ibn Kathir\'s Sirah. 16 sessions.',
    tracks: [
      { n: 1,  title: 'Introduction',                              file: 'CD1Introduction.mp3' },
      { n: 2,  title: 'Background History',                        file: 'CD2BackgroundHistory.mp3' },
      { n: 3,  title: 'Religious Situation of Pre-Islamic Arabia', file: 'CD3TheReligiousSituationOfPre-IslamicArabia.mp3' },
      { n: 4,  title: 'Early Life',                                file: 'CD4EarlyLife.mp3' },
      { n: 5,  title: 'Important Events',                          file: 'CD5ImportantEvents.mp3' },
      { n: 6,  title: 'In Pursuit of the Truth',                   file: 'CD6InPursuitOfTheTruth.mp3' },
      { n: 7,  title: 'The Glad Tidings',                          file: 'CD7TheGladTidings.mp3' },
      { n: 8,  title: 'The Revelation',                            file: 'CD8TheRevelation.mp3' },
      { n: 9,  title: 'The Reaction (Part 1)',                     file: 'CD9TheReactionPart1.mp3' },
      { n: 10, title: 'The Reaction (Part 2)',                     file: 'CD10TheReactionPart2.mp3' },
      { n: 11, title: 'The Early Immigrants (Part 1)',             file: 'CD11TheEarlyImmigrantsPart1.mp3' },
      { n: 12, title: 'The Early Immigrants (Part 2)',             file: 'CD12TheEarlyImmigrantsPart2.mp3' },
      { n: 13, title: 'Major Events',                              file: 'CD13MajorEvents.mp3' },
      { n: 14, title: 'The Later Years of Makkah',                 file: 'CD14TheLaterYearsOfMakkah.mp3' },
      { n: 15, title: 'In Search of a Base',                       file: 'CD15InSearchOfABase.mp3' },
      { n: 16, title: 'The Road to Madinah',                       file: 'CD16TheRoadToMadinah.mp3' },
    ],
  },

  {
    id: 'seerah-madinah',
    title: 'Life of Muhammad ﷺ — Madinan Period',
    speaker: 'Imam Anwar Al-Awlaki',
    category: 'Seerah',
    archiveId: 'lifeofmuhammadmadinah',
    description: 'The continuation covering the Prophet\'s ﷺ years in Madinah — the battles, treaties, and establishment of the Islamic state.',
    tracks: [],
  },

  {
    id: 'lives-of-prophets',
    title: 'Lives of the Prophets',
    speaker: 'Imam Anwar Al-Awlaki',
    category: 'Seerah',
    archiveId: 'LivesOfTheProphets',
    description: 'Stories of the Prophets mentioned in the Quran — from Adam (AS) to Isa (AS) — told with lessons for modern Muslims.',
    tracks: [],
  },

  // ── Aqeedah & the Hereafter ──────────────────────────────────────────────────

  {
    id: 'hereafter',
    title: 'The Hereafter Series',
    speaker: 'Imam Anwar Al-Awlaki',
    category: 'Aqeedah',
    archiveId: 'TheHereafter-AnwarAlAwlaki',
    description: 'A detailed journey through the events of the Last Day — death, the grave, resurrection, the Bridge, Paradise and Hellfire.',
    tracks: [],
  },

  // ── Classical Scholars ───────────────────────────────────────────────────────

  {
    id: 'foundations-of-tawheed',
    title: 'Foundations of Tawheed',
    speaker: 'Dr. Bilal Philips',
    category: 'Aqeedah',
    archiveId: 'FoundationsOfTawheedBilalPhilips',
    description: 'An introduction to Islamic monotheism — the three categories of Tawheed and their implications.',
    tracks: [],
  },

  {
    id: 'islamic-studies-bilal',
    title: 'Islamic Studies Lectures',
    speaker: 'Dr. Bilal Philips',
    category: 'General',
    archiveId: 'BilalPhilipsLectures',
    description: 'Wide-ranging lectures on Islamic theology, fiqh, and contemporary Muslim issues.',
    tracks: [],
  },

  // ── Fiqh & Practical Islam ──────────────────────────────────────────────────

  {
    id: 'best-of-creation',
    title: 'Best of Creation — The Angels',
    speaker: 'Imam Anwar Al-Awlaki',
    category: 'Aqeedah',
    archiveId: 'BestOfCreation-AnwarAlAwlaki',
    description: 'A study of the Angels — their nature, roles, and what we can learn from them.',
    tracks: [],
  },

];

export const lectureCategories = [...new Set(lectureSeries.map(s => s.category))];
