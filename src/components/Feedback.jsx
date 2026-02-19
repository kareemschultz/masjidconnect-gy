import { MessageSquare, AlertTriangle, PlusCircle, Clock, Bug, Star } from 'lucide-react';

const REQUEST_TYPES = [
  {
    icon: AlertTriangle,
    label: 'Correction',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    description: 'Something is wrong or outdated — address, name, times, etc.',
  },
  {
    icon: PlusCircle,
    label: 'Add New Masjid',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    description: 'Know a masjid in Georgetown we\'ve missed?',
  },
  {
    icon: Clock,
    label: 'Prayer Time Fix',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    description: 'Reported salah times are inaccurate.',
  },
  {
    icon: Star,
    label: 'Feature Request',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    description: 'Have an idea to make MasjidConnect GY better?',
  },
  {
    icon: Bug,
    label: 'Bug Report',
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    description: 'Something is broken or not working as expected.',
  },
];

export default function Feedback() {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
          Feedback &amp; Corrections
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Help us keep MasjidConnect GY accurate and useful for the community!
        </p>
      </div>

      {/* Request types */}
      <div className="space-y-3 mb-6">
        {REQUEST_TYPES.map(({ icon: Icon, label, color, description }) => (
          <a
            key={label}
            href="https://github.com/kareemschultz/masjidconnect-gy/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-emerald-50 dark:border-gray-700 card-hover transition-all"
          >
            <div className={`p-2 rounded-xl shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            </div>
            <MessageSquare className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
          </a>
        ))}
      </div>

      {/* GitHub link */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
        <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-2">
          All feedback is handled via GitHub Issues
        </p>
        <a
          href="https://github.com/kareemschultz/masjidconnect-gy/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Open an Issue on GitHub
        </a>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
          JazakAllah Khair for helping improve the ummah's digital tools 🤲
        </p>
      </div>
    </div>
  );
}
