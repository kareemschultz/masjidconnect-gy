export default function SkeletonCard({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-emerald-50 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-2" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
