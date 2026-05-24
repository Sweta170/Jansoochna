export function timeAgoHindi(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) {
    return "अभी"
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} मिनट पहले`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} घंटे पहले`
  }

  const days = Math.floor(hours / 24)
  return `${days} दिन पहले`
}
