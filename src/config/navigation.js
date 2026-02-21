import {
  Home,
  BookMarked,
  CheckSquare,
  Building2,
  Sparkles,
  BookOpen,
  Compass,
  Scale,
  Star,
  UtensilsCrossed,
  Map,
  Calendar,
  Library,
  MessageCircle,
  GraduationCap,
  Sunrise,
  Settings2,
  User,
  Shield,
} from 'lucide-react';

export const PRIMARY_NAV_ITEMS = Object.freeze([
  { path: '/ramadan', label: 'Home', icon: Home, ariaLabel: 'Ramadan Home' },
  { path: '/quran', label: 'Quran', icon: BookMarked, ariaLabel: 'Quran Reader' },
  { path: '/tracker', label: 'Tracker', icon: CheckSquare, ariaLabel: 'Prayer Tracker' },
  { path: '/masjids', label: 'Masjids', icon: Building2, ariaLabel: 'Masjid Directory' },
]);

export const MORE_NAV_SECTIONS = Object.freeze([
  {
    title: 'Worship',
    items: [
      { path: '/adhkar', label: 'Morning & Evening Adhkar', icon: Sunrise, desc: 'Daily fortress of the Muslim' },
      { path: '/tasbih', label: 'Tasbih Counter', icon: Sparkles, desc: 'Digital dhikr beads' },
      { path: '/duas', label: 'Duas', icon: BookOpen, desc: 'Supplications & prayers' },
      { path: '/qibla', label: 'Qibla Compass', icon: Compass, desc: 'Find direction to the Kaaba' },
      { path: '/zakat', label: 'Zakat Calculator', icon: Scale, desc: 'Calculate your zakat estimate' },
    ],
  },
  {
    title: 'Education',
    items: [
      { path: '/madrasa', label: 'Madrasa', icon: GraduationCap, desc: 'Qaida and Arabic alphabet' },
      { path: '/resources', label: 'Resources', icon: Library, desc: 'Guides, PDFs, and learning links' },
      { path: '/quran', label: 'Quran Reader', icon: BookMarked, desc: 'Read and track progress' },
    ],
  },
  {
    title: 'Community',
    items: [
      { path: '/events', label: 'Events', icon: Star, desc: 'Community gatherings and programs' },
      { path: '/iftaar', label: 'Iftaar Reports', icon: UtensilsCrossed, desc: "Tonight's menus and updates" },
      { path: '/map', label: 'Map View', icon: Map, desc: 'Masjids near you' },
      { path: '/timetable', label: 'Prayer Timetable', icon: Calendar, desc: 'Monthly schedule' },
      { path: '/feedback', label: 'Feedback', icon: MessageCircle, desc: 'Report issues or ideas' },
      { path: '/settings', label: 'Settings', icon: Settings2, desc: 'Prayer, notification, and display settings' },
    ],
  },
]);

export const ACCOUNT_NAV_ITEMS = Object.freeze([
  { path: '/profile', label: 'Profile', desc: 'Your account', icon: User },
  { path: '/admin', label: 'Admin Panel', desc: 'Manage content', icon: Shield },
]);

export function isPrimaryRoute(pathname) {
  return PRIMARY_NAV_ITEMS.some(item =>
    pathname === item.path || (item.path === '/quran' && pathname.startsWith('/quran'))
  );
}

