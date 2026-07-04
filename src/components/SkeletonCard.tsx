export function SkeletonCard() {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-gray-100 rounded-full w-1/3" />
          <div className="h-7 bg-gray-100 rounded-[7px] w-16" />
        </div>
      </div>
    </div>
  );
}
