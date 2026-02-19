import { Moon, MapPin, Clock } from 'lucide-react';
import { getTodayTimetable, getRamadanDay, RAMADAN_YEAR_HIJRI } from '../data/ramadanTimetable';

export default function Header() {
  const ramadan = getRamadanDay();
  const today = getTodayTimetable();

  return (
    <header className="gradient-islamic text-white relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      
      <div className="relative z-10 px-4 pt-6 pb-6">
        {/* Bismillah */}
        <p className="text-center text-gold-400 font-amiri text-2xl md:text-3xl mb-2 leading-relaxed">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="text-center text-emerald-300/70 text-xs mb-4">
          In the Name of Allah, the Most Gracious, the Most Merciful
        </p>
        
        {/* Title */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Moon className="w-7 h-7 text-gold-400 lantern-glow" />
            <h1 className="text-2xl md:text-3xl font-bold font-amiri tracking-wide">
              Georgetown Iftaar Guide
            </h1>
            <Moon className="w-7 h-7 text-gold-400 lantern-glow" style={{ transform: 'scaleX(-1)' }} />
          </div>
          <div className="flex items-center justify-center gap-1 text-emerald-200 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>Central Georgetown, Guyana</span>
          </div>
        </div>

        {/* Ramadan Progress */}
        {ramadan.isRamadan && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-w-md mx-auto mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gold-400 font-bold text-sm">
                🌙 Ramadan Day {ramadan.day} of {ramadan.total}
              </span>
              <span className="text-emerald-200 text-xs font-medium">
                {RAMADAN_YEAR_HIJRI} AH
              </span>
            </div>
            <div className="w-full bg-emerald-900/50 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-gold-400 to-gold-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${ramadan.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Today's Key Times */}
        {today && (
          <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap">
            <TimeChip icon="🌅" label="Suhoor ends" time={today.suhoor} />
            <TimeChip icon="🌇" label="Iftaar" time={today.maghrib} highlight />
            <TimeChip icon="🌙" label="Isha" time={today.isha} />
          </div>
        )}
      </div>
    </header>
  );
}

function TimeChip({ icon, label, time, highlight }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${
      highlight 
        ? 'bg-gold-400/20 border border-gold-400/40 text-gold-400 font-bold text-sm' 
        : 'bg-white/5 text-emerald-200'
    }`}>
      <span>{icon}</span>
      <span>{label}:</span>
      <span className={highlight ? '' : 'text-white font-semibold'}>{time}</span>
    </div>
  );
}
