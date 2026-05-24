import React from 'react'

const BADGE_STYLES = {
  'Nagarik': { bg: 'bg-gray-100 text-gray-800 border-gray-300', emoji: '👤' },
  'Sewak': { bg: 'bg-jan-green-lt text-jan-green-dk border-jan-green', emoji: '🌱' },
  'Jan Nayak': { bg: 'bg-jan-amber-lt text-jan-amber border-jan-amber', emoji: '👑' },
  'Pratinidhi': { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', emoji: '🏛️' },
}

const SewakBadge = ({ badge }) => {
  const style = BADGE_STYLES[badge] || BADGE_STYLES['Nagarik']
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>
      <span>{style.emoji}</span>
      <span>{badge}</span>
    </span>
  )
}

export default SewakBadge
