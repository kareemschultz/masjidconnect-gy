// Ramadan Companion — static reminder data
// Structured by time-of-day and themed by 10-day period
import { guyanaHour } from '../utils/timezone';

export const themes = {
  mercy: {
    days: Array.from({ length: 10 }, (_, i) => i + 1),
    label: 'Days of Mercy',
    subtitle: 'Seeking Allah\'s Rahmah',
    focus: 'Ya Rahman, Ya Raheem',
    arabic: 'يَا رَحْمَٰنُ يَا رَحِيمُ',
    dua: 'Allahuma innaka Rahmanun tuhibbul \'afwa fa\'fu \'anni',
    color: 'emerald',
    icon: '💚',
    bgGradient: 'from-emerald-900 to-emerald-700',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  forgiveness: {
    days: Array.from({ length: 10 }, (_, i) => i + 11),
    label: 'Days of Forgiveness',
    subtitle: 'Seeking Allah\'s Maghfirah',
    focus: 'Istighfar — Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    dua: 'Astaghfirullaha wa atubu ilayh',
    color: 'blue',
    icon: '💙',
    bgGradient: 'from-blue-900 to-blue-700',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  protection: {
    days: Array.from({ length: 10 }, (_, i) => i + 21),
    label: 'Protection from Hellfire',
    subtitle: 'Last 10 Nights — Seek Laylatul Qadr',
    focus: 'Laylatul Qadr — The Night of Power',
    arabic: 'لَيْلَةُ ٱلْقَدْرِ',
    dua: 'Allahumma innaka Afuwwun tuhibbul \'afwa fa\'fu \'anni',
    color: 'gold',
    icon: '⭐',
    bgGradient: 'from-amber-900 to-amber-700',
    badgeColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    isLastTen: true,
  },
};

export const timeSlots = [
  {
    id: 'after_fajr',
    label: 'After Fajr',
    icon: '🌅',
    description: 'Start your day with Allah\'s remembrance',
    reminders: {
      mercy: {
        title: 'Morning Dhikr',
        text: 'Recite SubhanAllah 100 times. Just 5 minutes after Fajr sets a blessed tone for your whole day.',
        action: 'Say: سُبْحَانَ اللّهِ (SubhanAllah) × 100',
        tip: 'Use your fingers or a tasbih to keep count.',
      },
      forgiveness: {
        title: 'Morning Istighfar',
        text: 'Before the day begins, seek forgiveness. Recite Astaghfirullah 100 times — let this be your daily reset.',
        action: 'Say: أَسْتَغْفِرُ اللَّه (Astaghfirullah) × 100',
        tip: 'The Prophet ﷺ sought forgiveness 70+ times daily.',
      },
      protection: {
        title: 'Fajr Qiyam Intention',
        text: 'You prayed Fajr — now stay awake a bit longer. Read Qur\'an until sunrise. These are blessed moments of Laylatul Qadr season.',
        action: 'Read Qur\'an for 15–20 minutes after Fajr',
        tip: 'Even 2 pages count. Consistency matters more than quantity.',
      },
    },
  },
  {
    id: 'mid_morning',
    label: 'Mid-Morning',
    icon: '☀️',
    description: 'Keep your heart connected while the world gets busy',
    reminders: {
      mercy: {
        title: 'Salawat on the Prophet ﷺ',
        text: 'Send 100 blessings on the Prophet ﷺ. It takes just 3 minutes and Allah sends 10 blessings back to you for each one.',
        action: 'Say: اللَّهُمَّ صَلِّ عَلَى مُحَمَّد × 100',
        tip: 'You can do this during any light activity — commuting, walking, etc.',
      },
      forgiveness: {
        title: 'Short Istighfar Break',
        text: 'Take 2 minutes right now. Just whisper Astaghfirullah quietly wherever you are. Allah hears every single one.',
        action: 'Say: أَسْتَغْفِرُ اللَّه × 100',
        tip: 'Don\'t wait for "the right moment". Do it now.',
      },
      protection: {
        title: 'Dua for Laylatul Qadr',
        text: 'We may be in the blessed nights. Recite the special Laylatul Qadr dua throughout the day.',
        action: 'Say: اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
        tip: 'Keep your tongue moist with this dua on odd nights especially.',
      },
    },
  },
  {
    id: 'before_dhuhr',
    label: 'Before Dhuhr',
    icon: '🕛',
    description: 'Midday — reconnect before the prayer',
    reminders: {
      mercy: {
        title: 'Read 2 Pages of Qur\'an',
        text: 'Open the Mushaf and read just 2 pages before Dhuhr. Small, consistent acts are beloved to Allah.',
        action: 'Open Qur\'an — read 2 pages (both sides)',
        tip: 'If you read 2 pages before every salah, you\'ll finish the Qur\'an this Ramadan.',
      },
      forgiveness: {
        title: 'Tawbah Intention',
        text: 'Before Dhuhr, take a moment of sincere regret for any shortcomings today. Allah loves those who return to Him.',
        action: 'Make a short, heartfelt tawbah in your own words',
        tip: 'Tawbah doesn\'t require Arabic — speak to Allah in your language.',
      },
      protection: {
        title: 'Qur\'an Recitation Focus',
        text: 'The last 10 nights call for more Qur\'an. Try to read a full juz today. Split it into small sessions if needed.',
        action: 'Read Qur\'an for 20 minutes before Dhuhr',
        tip: 'A juz is about 20 pages. 4 pages × 5 prayer times = done!',
      },
    },
  },
  {
    id: 'before_maghrib',
    label: 'Before Iftaar',
    icon: '🌇',
    description: 'The fasting person\'s dua before iftaar is never rejected',
    reminders: {
      mercy: {
        title: 'Your Dua Window Is Now Open',
        text: 'The moments before Maghrib are a golden window. The fasting person\'s dua is accepted. Make your list and ask!',
        action: 'Spend 5 minutes making sincere dua for yourself and loved ones',
        tip: 'Write down what you want to ask — it helps you focus.',
      },
      forgiveness: {
        title: 'Ask for Forgiveness Before You Break Fast',
        text: 'Before the food arrives, bow your heart in humility. Ask Allah to forgive every sin, known and unknown.',
        action: 'Say: "Allahumma-ghfir li dhunubi kullaha, sirriha wa \'alaniyyatiha"',
        tip: 'This moment of hunger + humility = immense spiritual power.',
      },
      protection: {
        title: 'Laylatul Qadr Dua — Make It Count',
        text: 'You\'re almost at Maghrib. This could be one of the last odd nights. Pour your heart out now.',
        action: 'Spend the last 10 minutes before Iftaar in silent dua',
        tip: 'Ask for dunya and akhirah. Don\'t hold back. Allah loves to be asked.',
      },
    },
  },
  {
    id: 'after_isha',
    label: 'After Isha',
    icon: '🌙',
    description: 'Night — the season of extra worship',
    reminders: {
      mercy: {
        title: 'Pray 2 Extra Rak\'ahs',
        text: 'After Taraweeh, pray 2 extra rak\'ahs of nafl. These voluntary prayers carry immense reward in Ramadan.',
        action: 'Pray 2 rak\'ahs nafl with khushu\'',
        tip: 'Make it slow and deliberate. Quality over speed.',
      },
      forgiveness: {
        title: 'Night Istighfar & Sleep with Wudu',
        text: 'End the day with 100 Astaghfirullah. Make wudu before sleep — you will be counted among those who worship through the night.',
        action: 'Astaghfirullah × 100, then sleep with wudu',
        tip: 'If you die in wudu, you die in a state of purity.',
      },
      protection: {
        title: 'Tahajjud Tonight',
        text: 'Set your alarm for 2 hours before Suhoor. Pray Tahajjud — even 2 rak\'ahs in the last third of the night is worth more than a lifetime of ordinary worship.',
        action: 'Set alarm → Wake up → Pray 4–8 rak\'ahs Tahajjud',
        tip: 'Ask Allah for guidance, forgiveness, and Jannah while others sleep.',
      },
    },
  },
];

export function getThemeForDay(day) {
  if (!day || day < 1 || day > 30) return null;
  if (day <= 10) return themes.mercy;
  if (day <= 20) return themes.forgiveness;
  return themes.protection;
}

export function getThemeKey(day) {
  if (!day || day < 1) return 'mercy';
  if (day <= 10) return 'mercy';
  if (day <= 20) return 'forgiveness';
  return 'protection';
}

export function getCurrentTimeSlot() {
  const hour = guyanaHour();
  if (hour >= 4 && hour < 8) return 'after_fajr';
  if (hour >= 8 && hour < 12) return 'mid_morning';
  if (hour >= 12 && hour < 15) return 'before_dhuhr';
  if (hour >= 15 && hour < 19) return 'before_maghrib';
  return 'after_isha';
}
