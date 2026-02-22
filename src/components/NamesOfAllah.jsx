import { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import PageHero from './PageHero';

const NAMES_OF_ALLAH = [
  { number: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'The Most Gracious' },
  { number: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful' },
  { number: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King' },
  { number: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Holy' },
  { number: 5, arabic: 'السَّلَامُ', transliteration: 'As-Salam', meaning: 'The Source of Peace' },
  { number: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mu\'min', meaning: 'The Guardian of Faith' },
  { number: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Protector' },
  { number: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The Almighty' },
  { number: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Compeller' },
  { number: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Greatest' },
  { number: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator' },
  { number: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari\'', meaning: 'The Maker of Order' },
  { number: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Shaper of Beauty' },
  { number: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The Forgiving' },
  { number: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The Subduer' },
  { number: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Bestower' },
  { number: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The Provider' },
  { number: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener' },
  { number: 19, arabic: 'اَلْعَلِيْمُ', transliteration: 'Al-Aleem', meaning: 'The All-Knowing' },
  { number: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Constrictor' },
  { number: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', meaning: 'The Expander' },
  { number: 22, arabic: 'الْخَافِضُ', transliteration: 'Al-Khafid', meaning: 'The Abaser' },
  { number: 23, arabic: 'الرَّافِعُ', transliteration: 'Ar-Rafi\'', meaning: 'The Exalter' },
  { number: 24, arabic: 'الْمُعِزُّ', transliteration: 'Al-Mu\'izz', meaning: 'The Honourer' },
  { number: 25, arabic: 'المُذِلُّ', transliteration: 'Al-Mudhill', meaning: 'The Dishonourer' },
  { number: 26, arabic: 'السَّمِيعُ', transliteration: 'As-Sami\'', meaning: 'The All-Hearing' },
  { number: 27, arabic: 'الْبَصِيرُ', transliteration: 'Al-Basir', meaning: 'The All-Seeing' },
  { number: 28, arabic: 'الْحَكَمُ', transliteration: 'Al-Hakam', meaning: 'The Judge' },
  { number: 29, arabic: 'الْعَدْلُ', transliteration: 'Al-Adl', meaning: 'The Just' },
  { number: 30, arabic: 'اللَّطِيفُ', transliteration: 'Al-Latif', meaning: 'The Subtle One' },
  { number: 31, arabic: 'الْخَبِيرُ', transliteration: 'Al-Khabir', meaning: 'The All-Aware' },
  { number: 32, arabic: 'الْحَلِيمُ', transliteration: 'Al-Halim', meaning: 'The Forbearing' },
  { number: 33, arabic: 'الْعَظِيمُ', transliteration: 'Al-Azeem', meaning: 'The Magnificent' },
  { number: 34, arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafur', meaning: 'The All-Forgiving' },
  { number: 35, arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakur', meaning: 'The Appreciative' },
  { number: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-Ali', meaning: 'The Most High' },
  { number: 37, arabic: 'الْكَبِيرُ', transliteration: 'Al-Kabir', meaning: 'The Most Great' },
  { number: 38, arabic: 'الْحَفِيظُ', transliteration: 'Al-Hafiz', meaning: 'The Preserver' },
  { number: 39, arabic: 'المُقِيتُ', transliteration: 'Al-Muqit', meaning: 'The Nourisher' },
  { number: 40, arabic: 'الْحسِيبُ', transliteration: 'Al-Hasib', meaning: 'The Reckoner' },
  { number: 41, arabic: 'الْجَلِيلُ', transliteration: 'Al-Jalil', meaning: 'The Majestic' },
  { number: 42, arabic: 'الْكَرِيمُ', transliteration: 'Al-Karim', meaning: 'The Generous' },
  { number: 43, arabic: 'الرَّقِيبُ', transliteration: 'Ar-Raqib', meaning: 'The Watchful' },
  { number: 44, arabic: 'الْمُجِيبُ', transliteration: 'Al-Mujib', meaning: 'The Responsive' },
  { number: 45, arabic: 'الْوَاسِعُ', transliteration: 'Al-Wasi\'', meaning: 'The All-Encompassing' },
  { number: 46, arabic: 'الْحَكِيمُ', transliteration: 'Al-Hakim', meaning: 'The Wise' },
  { number: 47, arabic: 'الْوَدُودُ', transliteration: 'Al-Wadud', meaning: 'The Most Loving' },
  { number: 48, arabic: 'الْمَجِيدُ', transliteration: 'Al-Majid', meaning: 'The Most Glorious' },
  { number: 49, arabic: 'الْبَاعِثُ', transliteration: 'Al-Ba\'ith', meaning: 'The Resurrector' },
  { number: 50, arabic: 'الشَّهِيدُ', transliteration: 'Ash-Shahid', meaning: 'The Witness' },
  { number: 51, arabic: 'الْحَقُّ', transliteration: 'Al-Haqq', meaning: 'The Truth' },
  { number: 52, arabic: 'الْوَكِيلُ', transliteration: 'Al-Wakil', meaning: 'The Trustee' },
  { number: 53, arabic: 'الْقَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'The Most Strong' },
  { number: 54, arabic: 'الْمَتِينُ', transliteration: 'Al-Matin', meaning: 'The Firm One' },
  { number: 55, arabic: 'الْوَلِيُّ', transliteration: 'Al-Waliyy', meaning: 'The Protecting Friend' },
  { number: 56, arabic: 'الْحَمِيدُ', transliteration: 'Al-Hamid', meaning: 'The Praiseworthy' },
  { number: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', meaning: 'The Accounter' },
  { number: 58, arabic: 'الْمُبْدِئُ', transliteration: 'Al-Mubdi\'', meaning: 'The Originator' },
  { number: 59, arabic: 'الْمُعِيدُ', transliteration: 'Al-Mu\'id', meaning: 'The Restorer' },
  { number: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', meaning: 'The Giver of Life' },
  { number: 61, arabic: 'اَلْمُمِيتُ', transliteration: 'Al-Mumit', meaning: 'The Taker of Life' },
  { number: 62, arabic: 'الْحَيُّ', transliteration: 'Al-Hayy', meaning: 'The Ever Living' },
  { number: 63, arabic: 'الْقَيُّومُ', transliteration: 'Al-Qayyum', meaning: 'The Self-Existing' },
  { number: 64, arabic: 'الْوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'The Finder' },
  { number: 65, arabic: 'الْمَاجِدُ', transliteration: 'Al-Majid', meaning: 'The Glorious' },
  { number: 66, arabic: 'الْوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'The One' },
  { number: 67, arabic: 'اَلاَحَدُ', transliteration: 'Al-Ahad', meaning: 'The Unique' },
  { number: 68, arabic: 'الصَّمَدُ', transliteration: 'As-Samad', meaning: 'The Eternal' },
  { number: 69, arabic: 'الْقَادِرُ', transliteration: 'Al-Qadir', meaning: 'The Able' },
  { number: 70, arabic: 'الْمُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'The Powerful' },
  { number: 71, arabic: 'الْمُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'The Expediter' },
  { number: 72, arabic: 'الْمُؤَخِّرُ', transliteration: 'Al-Mu\'akhkhir', meaning: 'The Delayer' },
  { number: 73, arabic: 'الأوَّلُ', transliteration: 'Al-Awwal', meaning: 'The First' },
  { number: 74, arabic: 'الآخِرُ', transliteration: 'Al-Akhir', meaning: 'The Last' },
  { number: 75, arabic: 'الظَّاهِرُ', transliteration: 'Az-Zahir', meaning: 'The Manifest' },
  { number: 76, arabic: 'الْبَاطِنُ', transliteration: 'Al-Batin', meaning: 'The Hidden' },
  { number: 77, arabic: 'الْوَالِي', transliteration: 'Al-Wali', meaning: 'The Governor' },
  { number: 78, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Muta\'ali', meaning: 'The Most Exalted' },
  { number: 79, arabic: 'الْبَرُّ', transliteration: 'Al-Barr', meaning: 'The Source of Goodness' },
  { number: 80, arabic: 'التَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'The Acceptor of Repentance' },
  { number: 81, arabic: 'الْمُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'The Avenger' },
  { number: 82, arabic: 'العَفُوُّ', transliteration: 'Al-Afuww', meaning: 'The Pardoner' },
  { number: 83, arabic: 'الرَّؤُوفُ', transliteration: 'Ar-Ra\'uf', meaning: 'The Most Kind' },
  { number: 84, arabic: 'مَالِكُ الْمُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'Owner of Sovereignty' },
  { number: 85, arabic: 'ذُوالْجَلَالِ وَالإكْرَامِ', transliteration: 'Dhul-Jalali Wal-Ikram', meaning: 'Lord of Majesty & Bounty' },
  { number: 86, arabic: 'الْمُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'The Equitable' },
  { number: 87, arabic: 'الْجَامِعُ', transliteration: 'Al-Jami\'', meaning: 'The Gatherer' },
  { number: 88, arabic: 'الْغَنِيُّ', transliteration: 'Al-Ghani', meaning: 'The Self-Sufficient' },
  { number: 89, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', meaning: 'The Enricher' },
  { number: 90, arabic: 'اَلْمَانِعُ', transliteration: 'Al-Mani\'', meaning: 'The Preventer' },
  { number: 91, arabic: 'الضَّارَّ', transliteration: 'Ad-Darr', meaning: 'The Distresser' },
  { number: 92, arabic: 'النَّافِعُ', transliteration: 'An-Nafi\'', meaning: 'The Benefiter' },
  { number: 93, arabic: 'النُّورُ', transliteration: 'An-Nur', meaning: 'The Light' },
  { number: 94, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', meaning: 'The Guide' },
  { number: 95, arabic: 'الْبَدِيعُ', transliteration: 'Al-Badi\'', meaning: 'The Originator' },
  { number: 96, arabic: 'اَلْبَاقِي', transliteration: 'Al-Baqi', meaning: 'The Everlasting' },
  { number: 97, arabic: 'الْوَارِثُ', transliteration: 'Al-Warith', meaning: 'The Inheritor' },
  { number: 98, arabic: 'الرَّشِيدُ', transliteration: 'Ar-Rashid', meaning: 'The Guide to the Right Path' },
  { number: 99, arabic: 'الصَّبُورُ', transliteration: 'As-Sabur', meaning: 'The Patient' },
];

export default function NamesOfAllah() {
  const [search, setSearch] = useState('');

  const filtered = NAMES_OF_ALLAH.filter(
    (n) =>
      n.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase()) ||
      n.arabic.includes(search)
  );

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <PageHero
        icon={Sparkles}
        title="99 Names of Allah"
        subtitle="Al-Asma Al-Husna"
        color="amber"
        backLink="/ramadan"
      />

      {/* Search */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or meaning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      {/* Names Grid */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((name) => (
            <div
              key={name.number}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-5 transition-all"
            >
              <span className="text-[10px] font-medium text-amber-500/60">{name.number}</span>
              <p className="font-amiri text-2xl leading-tight text-amber-600 dark:text-amber-400">{name.arabic}</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{name.transliteration}</p>
              <p className="text-center text-[11px] leading-snug text-gray-500 dark:text-gray-400">{name.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
