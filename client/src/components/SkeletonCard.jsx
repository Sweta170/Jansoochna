import React from 'react'

const SkeletonCard = () => {
  return (
    <div className="bg-[#FDFFFE] border border-[#E8EDEA] p-4 rounded-[20px] shadow-card space-y-4">
      {/* Header tags shimmer */}
      <div className="flex justify-between items-center">
        <div className="w-16 h-5 skeleton rounded-full" />
        <div className="w-12 h-4 skeleton rounded-lg" />
      </div>

      {/* Title shimmer */}
      <div className="space-y-2">
        <div className="h-4 bg-[#E8EDEA] skeleton rounded w-3/4" />
        <div className="h-3 bg-[#E8EDEA] skeleton rounded w-1/2" />
      </div>

      {/* Description lines shimmer */}
      <div className="space-y-1.5">
        <div className="h-2.5 bg-[#E8EDEA] skeleton rounded w-full" />
        <div className="h-2.5 bg-[#E8EDEA] skeleton rounded w-5/6" />
      </div>

      {/* Media thumbnail placeholder shimmer */}
      <div className="w-full h-24 skeleton rounded-xl" />

      {/* Footer metadata & buttons shimmer */}
      <div className="flex items-center justify-between border-t border-[#E8EDEA] border-dashed pt-3">
        <div className="space-y-1">
          <div className="w-24 h-3 skeleton rounded" />
          <div className="w-16 h-2.5 skeleton rounded" />
        </div>
        <div className="w-20 h-8 skeleton rounded-xl" />
      </div>
    </div>
  )
}

export default SkeletonCard
export { SkeletonCard }
