// Official Ramadan 1447 AH Timetable
// Source: Guyana Islamic Trust (GIT)
// Times for Georgetown / East Bank Demerara area
// Note: Ramadan 1447 — GIT (Sunni) started Feb 19, CIOG/some communities Feb 18
import { guyanaDate, guyanaRawTimeToMs } from '../utils/timezone';

export const RAMADAN_YEAR_HIJRI = 1447;

/** Possible start dates — two sighting methods differ by 1 day */
export const RAMADAN_START_OPTIONS = [
  { value: '2026-02-19', label: 'Feb 19 — Local/Regional sighting (GIT)' },
  { value: '2026-02-18', label: 'Feb 18 — Saudi/International sighting (CIOG)' },
];
export const DEFAULT_RAMADAN_START = '2026-02-19';

/** Read user's chosen Ramadan start from localStorage */
export function getUserRamadanStart() {
  return localStorage.getItem('ramadan_start') || DEFAULT_RAMADAN_START;
}

/** Persist user's chosen Ramadan start */
export function setUserRamadanStart(dateStr) {
  localStorage.setItem('ramadan_start', dateStr);
}

// Keep for backwards compat (some imports may use this)
export const RAMADAN_START_STR = DEFAULT_RAMADAN_START;

export const timetable = [
  // Feb 18 entry for communities that started a day earlier (approximated — prayer times ~same)
  { day: 0,  date: '2026-02-18', weekday: 'Wed', suhoor: '4:58', sunrise: '6:08', zuhr: '12:11', asrS: '3:27', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 1,  date: '2026-02-19', weekday: 'Thu', suhoor: '4:58', sunrise: '6:08', zuhr: '12:11', asrS: '3:27', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 2,  date: '2026-02-20', weekday: 'Fri', suhoor: '4:58', sunrise: '6:08', zuhr: '12:11', asrS: '3:26', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 3,  date: '2026-02-21', weekday: 'Sat', suhoor: '4:58', sunrise: '6:08', zuhr: '12:11', asrS: '3:26', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 4,  date: '2026-02-22', weekday: 'Sun', suhoor: '4:58', sunrise: '6:08', zuhr: '12:11', asrS: '3:26', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 5,  date: '2026-02-23', weekday: 'Mon', suhoor: '4:57', sunrise: '6:07', zuhr: '12:11', asrS: '3:25', asrH: '4:25', maghrib: '6:08', isha: '7:15' },
  { day: 6,  date: '2026-02-24', weekday: 'Tue', suhoor: '4:57', sunrise: '6:07', zuhr: '12:11', asrS: '3:25', asrH: '4:24', maghrib: '6:08', isha: '7:15' },
  { day: 7,  date: '2026-02-25', weekday: 'Wed', suhoor: '4:57', sunrise: '6:07', zuhr: '12:11', asrS: '3:25', asrH: '4:24', maghrib: '6:08', isha: '7:15' },
  { day: 8,  date: '2026-02-26', weekday: 'Thu', suhoor: '4:57', sunrise: '6:06', zuhr: '12:11', asrS: '3:24', asrH: '4:24', maghrib: '6:08', isha: '7:15' },
  { day: 9,  date: '2026-02-27', weekday: 'Fri', suhoor: '4:56', sunrise: '6:06', zuhr: '12:10', asrS: '3:24', asrH: '4:24', maghrib: '6:08', isha: '7:15' },
  { day: 10, date: '2026-02-28', weekday: 'Sat', suhoor: '4:56', sunrise: '6:06', zuhr: '12:10', asrS: '3:24', asrH: '4:24', maghrib: '6:08', isha: '7:14' },
  { day: 11, date: '2026-03-01', weekday: 'Sun', suhoor: '4:56', sunrise: '6:05', zuhr: '12:10', asrS: '3:23', asrH: '4:24', maghrib: '6:08', isha: '7:14' },
  { day: 12, date: '2026-03-02', weekday: 'Mon', suhoor: '4:55', sunrise: '6:05', zuhr: '12:10', asrS: '3:23', asrH: '4:24', maghrib: '6:08', isha: '7:14' },
  { day: 13, date: '2026-03-03', weekday: 'Tue', suhoor: '4:55', sunrise: '6:04', zuhr: '12:10', asrS: '3:22', asrH: '4:23', maghrib: '6:08', isha: '7:14' },
  { day: 14, date: '2026-03-04', weekday: 'Wed', suhoor: '4:55', sunrise: '6:04', zuhr: '12:09', asrS: '3:22', asrH: '4:23', maghrib: '6:08', isha: '7:14' },
  { day: 15, date: '2026-03-05', weekday: 'Thu', suhoor: '4:54', sunrise: '6:04', zuhr: '12:09', asrS: '3:21', asrH: '4:23', maghrib: '6:08', isha: '7:14' },
  { day: 16, date: '2026-03-06', weekday: 'Fri', suhoor: '4:54', sunrise: '6:03', zuhr: '12:09', asrS: '3:21', asrH: '4:23', maghrib: '6:08', isha: '7:14' },
  { day: 17, date: '2026-03-07', weekday: 'Sat', suhoor: '4:54', sunrise: '6:03', zuhr: '12:09', asrS: '3:20', asrH: '4:22', maghrib: '6:08', isha: '7:14' },
  { day: 18, date: '2026-03-08', weekday: 'Sun', suhoor: '4:53', sunrise: '6:02', zuhr: '12:08', asrS: '3:20', asrH: '4:22', maghrib: '6:08', isha: '7:14' },
  { day: 19, date: '2026-03-09', weekday: 'Mon', suhoor: '4:53', sunrise: '6:02', zuhr: '12:08', asrS: '3:19', asrH: '4:22', maghrib: '6:08', isha: '7:14' },
  { day: 20, date: '2026-03-10', weekday: 'Tue', suhoor: '4:52', sunrise: '6:02', zuhr: '12:08', asrS: '3:18', asrH: '4:22', maghrib: '6:07', isha: '7:14' },
  { day: 21, date: '2026-03-11', weekday: 'Wed', suhoor: '4:52', sunrise: '6:01', zuhr: '12:08', asrS: '3:18', asrH: '4:21', maghrib: '6:07', isha: '7:14' },
  { day: 22, date: '2026-03-12', weekday: 'Thu', suhoor: '4:51', sunrise: '6:01', zuhr: '12:07', asrS: '3:17', asrH: '4:21', maghrib: '6:07', isha: '7:13' },
  { day: 23, date: '2026-03-13', weekday: 'Fri', suhoor: '4:51', sunrise: '6:00', zuhr: '12:07', asrS: '3:16', asrH: '4:21', maghrib: '6:07', isha: '7:13' },
  { day: 24, date: '2026-03-14', weekday: 'Sat', suhoor: '4:51', sunrise: '6:00', zuhr: '12:07', asrS: '3:16', asrH: '4:20', maghrib: '6:07', isha: '7:13' },
  { day: 25, date: '2026-03-15', weekday: 'Sun', suhoor: '4:50', sunrise: '5:59', zuhr: '12:07', asrS: '3:15', asrH: '4:20', maghrib: '6:07', isha: '7:13' },
  { day: 26, date: '2026-03-16', weekday: 'Mon', suhoor: '4:50', sunrise: '5:59', zuhr: '12:06', asrS: '3:14', asrH: '4:20', maghrib: '6:07', isha: '7:13' },
  { day: 27, date: '2026-03-17', weekday: 'Tue', suhoor: '4:49', sunrise: '5:58', zuhr: '12:06', asrS: '3:14', asrH: '4:19', maghrib: '6:07', isha: '7:13' },
  { day: 28, date: '2026-03-18', weekday: 'Wed', suhoor: '4:49', sunrise: '5:58', zuhr: '12:06', asrS: '3:13', asrH: '4:19', maghrib: '6:07', isha: '7:13' },
  { day: 29, date: '2026-03-19', weekday: 'Thu', suhoor: '4:48', sunrise: '5:57', zuhr: '12:05', asrS: '3:12', asrH: '4:19', maghrib: '6:07', isha: '7:13' },
  { day: 30, date: '2026-03-20', weekday: 'Fri', suhoor: '4:48', sunrise: '5:57', zuhr: '12:05', asrS: '3:12', asrH: '4:18', maghrib: '6:06', isha: '7:12' },
];

export const areaAdjustments = [
  { area: 'Skeldon to Letter Kenny', minutes: -4 },
  { area: 'Bloomfield to New Amsterdam', minutes: -3 },
  { area: 'Rosignol to Golden Fleece', minutes: -2 },
  { area: 'Paradise to Buxton', minutes: -1 },
  { area: 'Georgetown / East Bank Demerara', minutes: 0 },
  { area: 'Vreed-en-Hoop to DeKinderen', minutes: +1 },
  { area: 'Zeelught to Parika / Charity / Pomeroon / Essequibo Coast & Islands', minutes: +2 },
];

export const duas = {
  suhoor: {
    arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: "Wa bisawmi ghadin nawaytu min shahri Ramadan",
    translation: 'I intend to fast tomorrow in the month of Ramadan',
  },
  beforeBreaking: {
    arabic: 'بِسْمِ ٱللَّٰهِ',
    transliteration: 'Bismillah',
    translation: 'In the Name of Allah',
  },
  whileBreaking: {
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: "Allahumma laka sumtu wa 'ala rizq-ika aftartu",
    translation: 'O Allah! I fasted for You and I break my fast with Your sustenance',
  },
  afterBreaking: {
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: "Dhahabadh-dhama'u wab-tallatil 'urooqu wa thabatal ajru inshaAllah",
    translation: 'The thirst is gone, the veins are moistened and the reward is confirmed, if Allah Wills',
  },
  laylatalQadr: {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    translation: 'O Allah, You are the One who pardons, and You love to pardon, so pardon me',
  },
  forgiveness: {
    arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal khasireen",
    translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers',
  },
  general1: {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina 'adhaban-nar",
    translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire',
  },
  general2: {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    transliteration: "Rabbi-shrah li sadri wa yassir li amri",
    translation: 'My Lord, expand my chest and ease my affair for me',
  },
};

export function getTodayTimetable() {
  const today = guyanaDate(); // YYYY-MM-DD in Guyana time
  return timetable.find(t => t.date === today) || null;
}

export function getRamadanDay() {
  const todayStr = guyanaDate(); // 'YYYY-MM-DD' in Guyana
  const userStart = getUserRamadanStart();
  // Use plain date strings for diff — avoids UTC/local midnight issues
  const startMs = new Date(userStart + 'T00:00:00Z').getTime();
  const todayMs = new Date(todayStr + 'T00:00:00Z').getTime();
  const diff = Math.floor((todayMs - startMs) / 86400000);
  if (diff < 0) return { isRamadan: false, daysUntil: Math.abs(diff), day: 0, total: 30 };
  if (diff >= 30) return { isRamadan: false, daysUntil: 0, day: 30, total: 30, ended: true };
  return { isRamadan: true, day: diff + 1, total: 30, progress: ((diff + 1) / 30) * 100 };
}

/**
 * Get seconds until today's iftaar (maghrib) time.
 * Returns negative if iftaar has passed.
 * All times in timetable are Guyana local time.
 */
export function getSecondsUntilIftaar() {
  const entry = getTodayTimetable();
  if (!entry) return null;
  const [h, m] = entry.maghrib.split(':').map(Number);
  // Maghrib is always PM in this timetable (range 6:xx)
  const h24 = h < 12 ? h + 12 : h;
  const iftaarMs = guyanaRawTimeToMs(h24, m);
  return Math.floor((iftaarMs - Date.now()) / 1000);
}

/**
 * Get seconds until suhoor ends.
 * All times in timetable are Guyana local time.
 */
export function getSecondsUntilSuhoor() {
  const entry = getTodayTimetable();
  if (!entry) return null;
  const [h, m] = entry.suhoor.split(':').map(Number);
  // Suhoor is always AM (4:xx–5:xx range)
  const suhoorMs = guyanaRawTimeToMs(h, m);
  return Math.floor((suhoorMs - Date.now()) / 1000);
}
