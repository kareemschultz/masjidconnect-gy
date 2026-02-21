export const LAYOUT_VARIANTS = Object.freeze({
  SHELL: 'shell',
  WIDE: 'wide',
});

const WIDE_LAYOUT_ROUTES = new Set([
  '/admin',
  '/events',
  '/map',
  '/masjids',
  '/quran',
  '/resources',
  '/timetable',
]);

export function getLayoutVariant(pathname) {
  if (pathname.startsWith('/quran/')) {
    return LAYOUT_VARIANTS.WIDE;
  }

  return WIDE_LAYOUT_ROUTES.has(pathname)
    ? LAYOUT_VARIANTS.WIDE
    : LAYOUT_VARIANTS.SHELL;
}

export function getLayoutContainerClass(layoutVariant) {
  return layoutVariant === LAYOUT_VARIANTS.WIDE
    ? 'max-w-md lg:max-w-5xl xl:max-w-6xl'
    : 'max-w-md';
}
