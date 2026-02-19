import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, Radio, Tv, Phone, Mail, CheckSquare, Square } from 'lucide-react';
import { getRamadanDay } from '../data/ramadanTimetable';

function Collapsible({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-50 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-50/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100 text-sm">
          <span>{icon}</span> {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 mb-2 last:mb-0">
      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs mb-1.5">{title}</h4>
      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}

function DailyChecklist() {
  const storageKey = `checklist-${new Date().toISOString().split('T')[0]}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const items = [
    { key: 'suhoor', label: 'Suhoor', time: 'Before Fajr', icon: '🌅' },
    { key: 'fajr', label: 'Fajr Prayer', time: '', icon: '🕌' },
    { key: 'quran', label: 'Quran Reading', time: '', icon: '📖' },
    { key: 'dhikr', label: 'Morning Dhikr', time: '', icon: '📿' },
    { key: 'dhuhr', label: 'Dhuhr Prayer', time: '', icon: '🕌' },
    { key: 'asr', label: 'Asr Prayer', time: '', icon: '🕌' },
    { key: 'dua', label: 'Dua before Iftaar', time: 'Before Maghrib', icon: '🤲' },
    { key: 'iftaar', label: 'Iftaar', time: 'At Maghrib', icon: '🍽️' },
    { key: 'maghrib', label: 'Maghrib Prayer', time: '', icon: '🕌' },
    { key: 'isha', label: 'Isha Prayer', time: '', icon: '🕌' },
    { key: 'taraweeh', label: 'Taraweeh Prayer', time: 'After Isha', icon: '🌙' },
    { key: 'nightdua', label: 'Night Dua & Reflection', time: 'Before sleep', icon: '✨' },
  ];

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {completedCount}/{items.length} completed today
        </p>
        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all ${
              checked[item.key]
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 line-through opacity-70'
                : 'bg-warm-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700'
            }`}
          >
            {checked[item.key]
              ? <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
            <span>{item.icon}</span>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.time && <span className="text-gray-400 dark:text-gray-500 text-[10px]">{item.time}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Resources() {
  const ramadan = getRamadanDay();

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
        Ramadan Resources
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Your complete Ramadan companion 📚
      </p>

      <div className="space-y-3">
        {/* Daily Checklist */}
        <Collapsible title="Daily Ramadan Checklist" icon="✅" defaultOpen={true}>
          <DailyChecklist />
        </Collapsible>

        {/* Fasting Rules */}
        <Collapsible title="Rules & Etiquette of Fasting" icon="📜">
          <InfoCard title="What Invalidates the Fast">
            <p>• Eating or drinking intentionally</p>
            <p>• Intentional vomiting</p>
            <p>• Sexual relations during fasting hours</p>
            <p>• Menstruation or post-natal bleeding</p>
            <p>• <strong>Note:</strong> Eating or drinking forgetfully does not break the fast — complete your fast and thank Allah</p>
          </InfoCard>
          <InfoCard title="What Does NOT Invalidate the Fast">
            <p>• Unintentional eating/drinking (forgetfulness)</p>
            <p>• Using miswak or toothbrush (without toothpaste)</p>
            <p>• Rinsing the mouth or nose (without exaggeration)</p>
            <p>• Blood tests or injections that are not nutritional</p>
            <p>• Swallowing saliva</p>
            <p>• Tasting food without swallowing (if necessary)</p>
          </InfoCard>
          <InfoCard title="Sunnah Acts During Fasting">
            <p>• Eat suhoor — even if a sip of water</p>
            <p>• Delay suhoor close to Fajr time</p>
            <p>• Hasten to break fast at Maghrib time</p>
            <p>• Break fast with dates, then water</p>
            <p>• Make dua at the time of breaking fast</p>
            <p>• Increase Quran recitation</p>
            <p>• Give generously in charity</p>
            <p>• Guard your tongue from backbiting and foul speech</p>
          </InfoCard>
        </Collapsible>

        {/* Who is Exempt */}
        <Collapsible title="Who is Exempt from Fasting" icon="💚">
          <InfoCard title="Temporary Exemptions (Must Make Up)">
            <p>• <strong>Travellers</strong> — may break fast and make up later</p>
            <p>• <strong>Sick persons</strong> — illness that worsens with fasting</p>
            <p>• <strong>Pregnant women</strong> — if fasting harms mother or baby</p>
            <p>• <strong>Breastfeeding women</strong> — if fasting affects milk supply</p>
            <p>• <strong>Menstruating women</strong> — must make up missed days</p>
          </InfoCard>
          <InfoCard title="Permanent Exemptions (Pay Fidyah)">
            <p>• <strong>Elderly</strong> who cannot fast without hardship</p>
            <p>• <strong>Chronically ill</strong> with no hope of recovery</p>
            <p>• <strong>Fidyah:</strong> Feed one poor person for each missed day</p>
          </InfoCard>
          <InfoCard title="Making Up Missed Fasts">
            <p>• Missed fasts should be made up before the next Ramadan</p>
            <p>• Can be fasted consecutively or spread throughout the year</p>
            <p>• If not made up before next Ramadan without valid excuse, fidyah is also required</p>
          </InfoCard>
        </Collapsible>

        {/* Laylatul Qadr */}
        <Collapsible title="Laylatul Qadr — The Night of Power" icon="🌟">
          <div className="bg-gradient-to-br from-emerald-50 to-gold-50 dark:from-emerald-900/20 dark:to-yellow-900/10 rounded-xl p-4 mb-2 text-center">
            <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 mb-1">لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">"The Night of Power is better than a thousand months" (Quran 97:3)</p>
          </div>
          <InfoCard title="When is Laylatul Qadr?">
            <p>• Seek it in the <strong>odd nights of the last 10 days</strong> of Ramadan</p>
            <p>• Nights of the 21st, 23rd, 25th, 27th, and 29th</p>
            <p>• Many scholars emphasize the <strong>27th night</strong>, but it could be any odd night</p>
            {ramadan.isRamadan && ramadan.day >= 21 && (
              <p className="mt-1 text-emerald-700 dark:text-emerald-400 font-bold">⭐ We are in the last 10 nights — seek it tonight!</p>
            )}
          </InfoCard>
          <InfoCard title="How to Worship on This Night">
            <p>• Pray Taraweeh and Tahajjud</p>
            <p>• Read and reflect on the Quran</p>
            <p>• Make abundant dua — especially: <em>"Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni"</em></p>
            <p>• Give charity (even small amounts)</p>
            <p>• Make dhikr and istighfar</p>
            <p>• Reflect on your relationship with Allah</p>
          </InfoCard>
        </Collapsible>

        {/* I'tikaf */}
        <Collapsible title="I'tikaf Guidelines" icon="🕌">
          <InfoCard title="What is I'tikaf?">
            <p>Spiritual retreat in the masjid during the last 10 days of Ramadan, following the Sunnah of the Prophet ﷺ.</p>
          </InfoCard>
          <InfoCard title="Rules of I'tikaf">
            <p>• Performed in the last 10 days of Ramadan (Sunnah)</p>
            <p>• Stay in the masjid — only leave for necessities</p>
            <p>• Focus on prayer, Quran, dhikr, and dua</p>
            <p>• Avoid unnecessary conversation and worldly distractions</p>
            <p>• Can be done by both men and women (women in designated area)</p>
            <p>• Minimum I'tikaf: some scholars say one day/night, others say the full 10 days</p>
          </InfoCard>
        </Collapsible>

        {/* Taraweeh Guide */}
        <Collapsible title="Taraweeh Prayer Guide" icon="🌙">
          <InfoCard title="About Taraweeh">
            <p>• Performed after Isha prayer every night of Ramadan</p>
            <p>• Prayed in sets of 2 rakaat</p>
            <p>• <strong>8 rakaat</strong> (Hanafi school says 20 rakaat) — both are valid</p>
            <p>• Best performed in congregation at the masjid</p>
            <p>• The entire Quran is typically completed during Ramadan</p>
          </InfoCard>
          <InfoCard title="Tips for Taraweeh">
            <p>• Arrive early and pray Isha with the congregation</p>
            <p>• Listen attentively to the Quran recitation</p>
            <p>• Maintain focus (khushu') in prayer</p>
            <p>• If you cannot stand, sitting is permissible</p>
            <p>• Make dua in the Witr prayer at the end</p>
          </InfoCard>
        </Collapsible>

        {/* Zakatul Fitr */}
        <Collapsible title="Zakatul Fitr for Guyana" icon="💰">
          <InfoCard title="What is Zakatul Fitr?">
            <p>Obligatory charity given before Eid prayer. It purifies the fasting person and provides food for the poor on Eid day.</p>
          </InfoCard>
          <InfoCard title="Rules">
            <p>• <strong>Who pays:</strong> Every Muslim who has food beyond their needs on Eid day</p>
            <p>• <strong>Pay for:</strong> Yourself and all dependents (including children)</p>
            <p>• <strong>When:</strong> Must be paid before Eid prayer</p>
            <p>• <strong>Best time:</strong> A day or two before Eid</p>
            <p>• <strong>Amount:</strong> One sa' (approximately 2.5-3 kg) of staple food per person</p>
          </InfoCard>
          <InfoCard title="Zakatul Fitr in Guyana">
            <p>• Consult <strong>CIOG</strong> or <strong>Guyana Islamic Trust</strong> for the current monetary equivalent</p>
            <p>• Can be given in rice, flour, or cash equivalent</p>
            <p>• Typical amount: approximately <strong>GY$1,500–2,500</strong> per person (check with local scholars for current year)</p>
            <p>• Distribute to the poor and needy in your community</p>
            <p>• Contact GIT: 📞 227-0115 / 225-5934</p>
          </InfoCard>
        </Collapsible>

        {/* Local Resources */}
        <Collapsible title="Guyana Islamic Organizations" icon="🇬🇾" defaultOpen={true}>
          <div className="space-y-2">
            {/* GIT */}
            <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Guyana Islamic Trust (GIT)</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">N ½ Lot 321, East Street, N/Cummingsburg, Georgetown</p>
              <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> 227-0115 / 225-5934</p>
                <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-600" /> gits@guyana.net.gy</p>
                <a
                  href="https://www.facebook.com/GuyanaIslamicTrust/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Facebook Page
                </a>
              </div>
            </div>

            {/* CIOG */}
            <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">CIOG — Central Islamic Organisation of Guyana</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Woolford Avenue, Georgetown</p>
              <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> 226-7495</p>
                <p>Regular Ramadan programs and Iftaar coordination</p>
              </div>
            </div>
          </div>
        </Collapsible>

        {/* Media Programs */}
        <Collapsible title="Ramadan Media Programs" icon="📺">
          <div className="space-y-2">
            <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Voice of Guyana Radio</h4>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">📻 102.5 FM / 560 AM</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">🌙 GIT Ramadan Program: <strong>4:00 – 4:30 AM daily</strong></p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Perfect to listen during Suhoor preparation</p>
            </div>

            <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">NCN Television</h4>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">📺 Channel 11</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">🌙 Daily program: <strong>4:15 – 4:45 AM</strong></p>
            </div>

            <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">GIT Perspectives</h4>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">📺 MTV Channel 14 / Cable 65</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">🗓️ <strong>Tuesdays at 8:30 PM</strong></p>
            </div>
          </div>
        </Collapsible>

        {/* Virtues of Ramadan */}
        <Collapsible title="Virtues of Ramadan" icon="🌙">
          <div className="space-y-2">
            {[
              { hadith: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.", source: "Bukhari & Muslim" },
              { hadith: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.", source: "Bukhari" },
              { hadith: "Every action of the son of Adam is for him except fasting, for that is solely for Me and I give the reward for it.", source: "Bukhari" },
              { hadith: "The fasting person has two joys: joy when he breaks his fast, and joy when he meets his Lord.", source: "Muslim" },
              { hadith: "There is a gate in Paradise called Ar-Rayyan, through which only those who fasted will enter.", source: "Bukhari & Muslim" },
              { hadith: "Whoever provides Iftaar for a fasting person earns the same reward without diminishing the faster's reward.", source: "Tirmidhi" },
            ].map((h, i) => (
              <div key={i} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">"{h.hadith}"</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 text-right">— {h.source}</p>
              </div>
            ))}
          </div>
        </Collapsible>

        {/* Notification Reminder */}
        <Collapsible title="Iftaar Reminder" icon="🔔">
          <IftaarReminder />
        </Collapsible>
      </div>
    </div>
  );
}

function IftaarReminder() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('');

  const enableReminder = async () => {
    if (!('Notification' in window)) {
      setStatus('Notifications not supported on this browser');
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setEnabled(true);
      setStatus('Reminder set! You\'ll be notified 30 minutes before Iftaar In sha Allah');

      // Schedule a reminder check
      const check = () => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        // If it's roughly 5:38 PM (30 min before 6:08 maghrib), notify
        if (h === 17 && m === 38) {
          new Notification('🌙 Iftaar Reminder', {
            body: 'Iftaar is in 30 minutes! Time to prepare. May Allah accept your fast.',
            icon: '🕌',
          });
        }
      };
      setInterval(check, 60000);
    } else {
      setStatus('Permission denied. Please enable notifications in your browser settings.');
    }
  };

  return (
    <div className="text-center py-2">
      {!enabled ? (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Get a browser notification 30 minutes before Iftaar to start preparing
          </p>
          <button
            onClick={enableReminder}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            🔔 Enable Iftaar Reminder
          </button>
        </>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">✅ {status}</p>
      )}
      {status && !enabled && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{status}</p>
      )}
    </div>
  );
}
