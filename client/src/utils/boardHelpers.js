// Post type metadata — colours, labels, icons
export const POST_TYPES = {
  notice: {
    label: 'सूचना',
    accentColor: '#185FA5',
    badgeBg: '#E6F1FB',
    badgeColor: '#0C447C',
    icon: 'ti-speakerphone',
  },
  outage: {
    label: 'कटौती',
    accentColor: '#E07B2A',
    badgeBg: '#FDF0E6',
    badgeColor: '#854F0B',
    icon: 'ti-bolt',
  },
  alert: {
    label: 'चेतावनी',
    accentColor: '#C0392B',
    badgeBg: '#FDECEA',
    badgeColor: '#7B241C',
    icon: 'ti-alert-triangle',
  },
  market: {
    label: 'बाज़ार',
    accentColor: '#1D9E75',
    badgeBg: '#E1F5EE',
    badgeColor: '#085041',
    icon: 'ti-shopping-cart',
  },
  emergency: {
    label: 'आपात',
    accentColor: '#C0392B',
    badgeBg: '#FDECEA',
    badgeColor: '#7B241C',
    icon: 'ti-ambulance',
  },
}

// Filter chips config
export const FILTER_CHIPS = [
  { key: 'all',       label: 'सभी' },
  { key: 'notice',    label: 'सूचना' },
  { key: 'outage',    label: 'कटौती' },
  { key: 'alert',     label: 'चेतावनी' },
  { key: 'market',    label: 'बाज़ार' },
  { key: 'emergency', label: 'आपात' },
]

// Relative time in Hindi
export function timeAgoHindi(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'अभी'
  if (mins < 60)  return `${mins} मिनट पहले`
  if (hours < 24) return `${hours} घंटे पहले`
  if (days === 1) return 'कल'
  return `${days} दिन पहले`
}

// Shorten location string
export function shortLocation(location) {
  if (!location) return ''
  const str = typeof location === 'string' ? location : location.address || ''
  // Remove pincodes in brackets, extra spaces
  const cleaned = str
    .replace(/\(\d{6}\)/g, '')
    .replace(/\([^)]*\)/g, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  // Return last 2 meaningful parts
  return cleaned.slice(-2).join(', ')
}

// Get initials from name
export function getInitials(name) {
  if (!name) return 'NA'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Avatar background by badge
export function avatarBg(badge) {
  const map = {
    'Nagarik': '#1D9E75', 'Sewak': '#0F6E56',
    'Jan Nayak': '#BA7517', 'Pratinidhi': '#534AB7',
  }
  return map[badge] || '#1D9E75'
}
