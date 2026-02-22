import {
  Users, Heart, Target, Trophy, Star, Flame, Crown, Medal, Award,
  Bell, BookOpen, Moon, HandHeart, Sparkles, Gift,
  ArrowRight, ShieldCheck, Zap, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from './PageHero';

const STEPS = [
  {
    step: 1,
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    title: 'Find a Buddy',
    description: 'Pair up with a friend, family member, or someone from your masjid. The best buddy is someone you trust and who shares your desire to grow spiritually.',
  },
  {
    step: 2,
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    title: 'Set Challenges',
    description: 'Choose from pre-built challenges like 30-Day Prayer Streaks, Quran Khatam Races, or create your own. Each challenge has a goal, timeline, and point reward.',
  },
  {
    step: 3,
    icon: Bell,
    color: 'from-amber-500 to-orange-600',
    title: 'Stay Accountable',
    description: 'Send gentle nudges to remind each other about prayers, Quran reading, or any shared goal. A small reminder can make a huge difference in consistency.',
  },
  {
    step: 4,
    icon: Trophy,
    color: 'from-purple-500 to-pink-600',
    title: 'Earn and Compete',
    description: 'Earn points for completing prayers, reading Quran, fasting, and hitting challenge milestones. Climb the leaderboard and reach Gold tier.',
  },
];

const POINT_SYSTEM = [
  { action: 'Complete a daily prayer on time', points: 5, icon: HandHeart, color: 'text-emerald-500 dark:text-emerald-400' },
  { action: 'All 5 prayers in a day', points: 50, icon: ShieldCheck, color: 'text-emerald-500 dark:text-emerald-400' },
  { action: 'Read 1 page of Quran', points: 3, icon: BookOpen, color: 'text-purple-500 dark:text-purple-400' },
  { action: 'Complete a surah', points: 10, icon: BookOpen, color: 'text-purple-500 dark:text-purple-400' },
  { action: 'Fast a voluntary day', points: 25, icon: Moon, color: 'text-amber-500 dark:text-amber-400' },
  { action: 'Complete daily adhkar', points: 10, icon: Sparkles, color: 'text-cyan-500 dark:text-cyan-400' },
  { action: 'Reach a challenge milestone', points: 50, icon: Target, color: 'text-blue-500 dark:text-blue-400' },
  { action: 'Win a challenge', points: 100, icon: Trophy, color: 'text-amber-500 dark:text-amber-400' },
  { action: 'Maintain a 7-day streak', points: 30, icon: Flame, color: 'text-orange-500 dark:text-orange-400' },
  { action: 'Maintain a 30-day streak', points: 150, icon: Zap, color: 'text-yellow-500 dark:text-yellow-400' },
];

const TIERS = [
  {
    name: 'Bronze',
    range: '0 - 199 pts',
    icon: Award,
    gradient: 'from-orange-600 to-orange-700',
    border: 'border-orange-600/40',
    text: 'text-orange-600 dark:text-orange-400',
    description: 'Every journey begins with a single step. Start praying consistently and take on your first challenge.',
  },
  {
    name: 'Silver',
    range: '200 - 399 pts',
    icon: Medal,
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-400/40',
    text: 'text-gray-600 dark:text-gray-300',
    description: 'You are building strong habits. Your dedication is showing. Keep pushing and inspire your buddies.',
  },
  {
    name: 'Gold',
    range: '400+ pts',
    icon: Crown,
    gradient: 'from-amber-400 to-amber-600',
    border: 'border-amber-400/40',
    text: 'text-amber-600 dark:text-amber-400',
    description: 'The pinnacle of faith partnership. You are a role model for consistency, devotion, and spiritual growth.',
  },
];

const CHALLENGE_TYPES = [
  {
    icon: HandHeart,
    color: 'from-emerald-500 to-teal-600',
    title: 'Prayer Challenges',
    description: 'Compete to maintain the longest consecutive prayer streak. Includes all 5 daily prayers, sunnah prayers, and tahajjud.',
    examples: ['30-Day All Prayers', 'Sunnah Prayer Week', 'Tahajjud Challenge'],
  },
  {
    icon: BookOpen,
    color: 'from-purple-500 to-indigo-600',
    title: 'Quran Challenges',
    description: 'Race to complete a Khatam, memorize new surahs, or read a set number of pages. Track progress in real-time.',
    examples: ['Khatam Race', 'Memorize Juz Amma', '5 Pages a Day'],
  },
  {
    icon: Moon,
    color: 'from-amber-500 to-orange-600',
    title: 'Fasting Challenges',
    description: 'Fast together on voluntary days (Mondays and Thursdays), the White Days, or throughout Ramadan.',
    examples: ['Monday/Thursday Fasting', 'White Days Challenge', 'Ramadan Companion'],
  },
  {
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-600',
    title: 'Dhikr Challenges',
    description: 'Complete daily morning and evening adhkar, tasbih goals, or specific dhikr counts together.',
    examples: ['Daily Adhkar', '1000 Tasbih Week', 'Istighfar Challenge'],
  },
  {
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    title: 'Charity Challenges',
    description: 'Give sadaqah together every Friday, donate to a cause, or volunteer time for community service.',
    examples: ['Friday Sadaqah', 'Community Service', 'Charity Drive'],
  },
];

const HADITHS = [
  {
    text: '"A person is upon the religion of their close friend, so let one of you look at whom they befriend."',
    source: 'Abu Dawud and Tirmidhi',
  },
  {
    text: '"The believers in their mutual kindness, compassion, and sympathy are just like one body. When one limb suffers, the whole body responds to it with wakefulness and fever."',
    source: 'Sahih Muslim',
  },
  {
    text: '"Whoever guides someone to good, they will have a reward like the one who did it."',
    source: 'Sahih Muslim',
  },
];

function SettingGroup({ label, accentColor, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className={`h-4 w-1 rounded-full ${accentColor}`} />
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</h3>
      </div>
      {children}
    </div>
  );
}

export default function BuddyHowItWorks() {
  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <PageHero
        icon={Users}
        title="How It Works"
        subtitle="The Faith Buddy System"
        color="blue"
        backLink="/tracker"
      />

      <div className="space-y-6 px-4 pt-6 max-w-2xl mx-auto">
        {/* Intro */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            The Faith Buddy system pairs you with an accountability partner to help you stay consistent in your ibadah (worship). Compete in good deeds, encourage each other, and earn rewards as you grow together on your spiritual journey.
          </p>
        </div>

        {/* Hadith */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
          <p className="text-sm italic leading-relaxed text-amber-900 dark:text-amber-200">
            {HADITHS[0].text}
          </p>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">- {HADITHS[0].source}</p>
        </div>

        {/* Steps */}
        <SettingGroup label="Getting Started" accentColor="bg-blue-500">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {STEPS.map((step) => (
              <div key={step.step} className="flex items-start gap-4 p-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400">{step.step}</span>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* Point System */}
        <SettingGroup label="Point System" accentColor="bg-amber-500">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {POINT_SYSTEM.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                <span className="flex-1 text-xs text-gray-700 dark:text-gray-300">{item.action}</span>
                <span className="flex items-center gap-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Star className="h-2.5 w-2.5" /> +{item.points}
                </span>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* Tier System */}
        <SettingGroup label="Tier System" accentColor="bg-purple-500">
          <div className="space-y-3 p-4">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`rounded-xl border ${tier.border} p-4`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tier.gradient}`}>
                    <tier.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${tier.text}`}>{tier.name}</h4>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{tier.range}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tier.description}</p>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* Challenge Types */}
        <SettingGroup label="Challenge Categories" accentColor="bg-emerald-500">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {CHALLENGE_TYPES.map((cat) => (
              <div key={cat.title} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color}`}>
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{cat.title}</h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{cat.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 pl-[52px]">
                  {cat.examples.map((ex) => (
                    <span key={ex} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* More Hadiths */}
        <SettingGroup label="Inspiration from the Sunnah" accentColor="bg-amber-500">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {HADITHS.slice(1).map((h, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-sm italic leading-relaxed text-gray-700 dark:text-gray-300">{h.text}</p>
                    <p className="mt-1.5 text-[11px] text-amber-500 dark:text-amber-400">- {h.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* Tips */}
        <SettingGroup label="Tips for Success" accentColor="bg-cyan-500">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { icon: ShieldCheck, text: 'Choose a buddy who shares your spiritual goals and level of commitment' },
              { icon: Bell, text: 'Use the nudge feature before prayer times as a gentle reminder' },
              { icon: Target, text: 'Start with one challenge at a time. Build momentum before adding more' },
              { icon: Heart, text: 'Celebrate each other\'s wins. A kind word goes a long way' },
              { icon: Flame, text: 'Keep competition healthy. The goal is to grow together, not just to win' },
              { icon: Gift, text: 'Remember: the reward of guiding someone to good is equal to the deed itself' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500 dark:text-cyan-400" />
                <span className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">{tip.text}</span>
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* CTA */}
        <Link
          to="/tracker"
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
