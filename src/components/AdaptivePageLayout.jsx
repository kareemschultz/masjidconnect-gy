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
      className={`${containerClass} app-shell mx-auto min-h-screen w-full relative transition-colors duration-300`}
    >
      {children}
    </div>
  );
}
