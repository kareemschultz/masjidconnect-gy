import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHero({ title, subtitle, icon: Icon, backLink, pattern = 'geometric', color = 'emerald' }) {
  const navigate = useNavigate();

  // Pattern variants (using CSS opacity masks or SVG backgrounds)
  const patterns = {
    geometric: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    organic: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 70%)",
  };

  const colors = {
    emerald: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/20",
    blue: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/20",
    amber: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/20",
    purple: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/20",
  };

  const textColors = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    blue: "text-blue-700 dark:text-blue-400",
    amber: "text-amber-700 dark:text-amber-400",
    purple: "text-purple-700 dark:text-purple-400",
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${colors[color] || colors.emerald} border border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-none mb-6 mx-4 mt-2 transition-all duration-700 animate-fade-in group`}>
      {/* Dynamic Mesh Background (Vercel Style) */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
      
      {/* Subtle Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Central Graphic */}
      {Icon && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] dark:opacity-[0.1] transform scale-[2] pointer-events-none group-hover:scale-[2.2] group-hover:-rotate-3 transition-all duration-1000 ease-out">
          <Icon className="w-32 h-32" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-6 py-12 pt-safe text-center">
        {backLink && (
          <button 
            onClick={() => navigate(backLink)}
            className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-white/5 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col items-center gap-3">
          {Icon && (
            <div className={`p-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm border border-white/20 ring-1 ring-black/5 ${textColors[color] || textColors.emerald} mb-1 animate-float`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight mb-1.5 drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium tracking-widest uppercase opacity-90">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
