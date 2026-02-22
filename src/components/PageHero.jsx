import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function IslamicStar({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="currentColor">
      <path d="M100 10 L115 63 L164 36 L137 85 L190 100 L137 115 L164 164 L115 137 L100 190 L85 137 L36 164 L63 115 L10 100 L63 85 L36 36 L85 63 Z" />
      <circle cx="100" cy="100" r="22" opacity="0.7" />
    </svg>
  );
}

const THEMES = {
  emerald: {
    gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #065f46 100%)",
    glow: "rgba(52, 211, 153, 0.12)",
    pill: "bg-emerald-800/70 border border-emerald-600/30 text-emerald-100",
    starColor: "rgba(212, 168, 67, 0.22)",
    starColorSmall: "rgba(212, 168, 67, 0.12)",
  },
  blue: {
    gradient: "linear-gradient(135deg, #0d1f4c 0%, #1e3a7a 55%, #1e40af 100%)",
    glow: "rgba(96, 165, 250, 0.12)",
    pill: "bg-blue-900/70 border border-blue-700/30 text-blue-100",
    starColor: "rgba(212, 168, 67, 0.20)",
    starColorSmall: "rgba(212, 168, 67, 0.10)",
  },
  amber: {
    gradient: "linear-gradient(135deg, #431407 0%, #7c2d12 55%, #9a3412 100%)",
    glow: "rgba(251, 146, 60, 0.15)",
    pill: "bg-orange-900/70 border border-orange-700/30 text-orange-100",
    starColor: "rgba(212, 168, 67, 0.25)",
    starColorSmall: "rgba(212, 168, 67, 0.13)",
  },
  purple: {
    gradient: "linear-gradient(135deg, #1e0b3b 0%, #3b1c6e 55%, #4c1d95 100%)",
    glow: "rgba(167, 139, 250, 0.12)",
    pill: "bg-purple-900/70 border border-purple-700/30 text-purple-100",
    starColor: "rgba(212, 168, 67, 0.20)",
    starColorSmall: "rgba(212, 168, 67, 0.10)",
  },
  teal: {
    gradient: "linear-gradient(135deg, #042a28 0%, #065f52 55%, #047857 100%)",
    glow: "rgba(20, 184, 166, 0.12)",
    pill: "bg-teal-900/70 border border-teal-700/30 text-teal-100",
    starColor: "rgba(212, 168, 67, 0.20)",
    starColorSmall: "rgba(212, 168, 67, 0.10)",
  },
  rose: {
    gradient: "linear-gradient(135deg, #3c0e1c 0%, #7b1c3c 55%, #9f1239 100%)",
    glow: "rgba(251, 113, 133, 0.12)",
    pill: "bg-rose-900/70 border border-rose-700/30 text-rose-100",
    starColor: "rgba(212, 168, 67, 0.22)",
    starColorSmall: "rgba(212, 168, 67, 0.12)",
  },
};

export default function PageHero({ title, subtitle, icon: Icon, backLink, color = "emerald" }) {
  const navigate = useNavigate();
  const theme = THEMES[color] || THEMES.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="relative overflow-hidden mb-6 mx-4 mt-2 rounded-[2rem] border border-white/5"
      style={{ background: theme.gradient }}
    >
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 islamic-pattern" style={{ opacity: 0.12 }} />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/3 w-56 h-56 rounded-full blur-[70px] pointer-events-none"
        style={{ background: theme.glow }}
        aria-hidden="true"
      />

      {/* Large Islamic 8-pointed star — top right, partially off-screen */}
      <div className="absolute -top-8 -right-8 pointer-events-none" style={{ color: theme.starColor }} aria-hidden="true">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        >
          <IslamicStar size={200} />
        </motion.div>
      </div>

      {/* Small Islamic star — bottom left, partially off-screen */}
      <div className="absolute -bottom-6 -left-6 pointer-events-none" style={{ color: theme.starColorSmall }} aria-hidden="true">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          <IslamicStar size={130} />
        </motion.div>
      </div>

      {/* Thin gold accent line at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)" }} />

      {/* Content */}
      <div className="relative z-10 px-6 py-10 pt-safe text-center">
        {backLink && (
          <button
            onClick={() => navigate(backLink)}
            aria-label="Go back"
            className="absolute top-4 left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-90 text-white border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center gap-4">
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-amber-400/30"
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
          )}

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white font-display tracking-tight mb-3 drop-shadow-md"
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className={`text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full backdrop-blur-sm ${theme.pill}`}>
                  {subtitle}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
