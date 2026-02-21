import { getLayoutContainerClass } from '../layout/routeLayout';

/**
 * App-level container that adapts route canvas width without changing component architecture.
 * layoutVariant contract: 'shell' | 'wide'
 */
export default function AdaptivePageLayout({ layoutVariant = 'shell', children }) {
  const containerClass = getLayoutContainerClass(layoutVariant);

  return (
    <div
      data-layout-variant={layoutVariant}
      className={`${containerClass} mx-auto min-h-screen w-full bg-warm-50 dark:bg-gray-950 shadow-[0_0_60px_rgba(0,0,0,0.15)] relative transition-colors duration-300`}
    >
      {children}
    </div>
  );
}
