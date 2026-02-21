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
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-900/20",
    blue: "from-blue-600 to-indigo-700 shadow-blue-900/20",
    amber: "from-amber-500 to-orange-600 shadow-orange-900/20",
    purple: "from-purple-600 to-violet-700 shadow-purple-900/20",
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colors[color] || colors.emerald} shadow-xl mb-6 mx-4 mt-2 transition-all duration-500 animate-scale-in`}>
      {/* Decorative Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: patterns[pattern]
        }} 
      />
      
      {/* Content */}
      <div className="relative z-10 px-6 py-8 pt-safe">
        {backLink && (
          <button 
            onClick={() => navigate(backLink)}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-amiri tracking-wide mb-1 drop-shadow-md">{title}</h1>
            {subtitle && <p className="text-emerald-50/90 text-xs font-medium tracking-wide uppercase">{subtitle}</p>}
          </div>
          {Icon && <Icon className="w-12 h-12 text-white/10 absolute right-4 bottom-4 rotate-12 scale-150 transform" />}
        </div>
      </div>
    </div>
  );
}
