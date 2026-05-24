import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const POST_TYPES = {
  notice:    { label: 'सूचना',    accent: '#185FA5', bg: '#E6F1FB', color: '#0C447C', icon: 'megaphone-outline' },
  outage:    { label: 'कटौती',   accent: '#E07B2A', bg: '#FDF0E6', color: '#854F0B', icon: 'flash-outline' },
  alert:     { label: 'चेतावनी', accent: '#C0392B', bg: '#FDECEA', color: '#7B241C', icon: 'warning-outline' },
  market:    { label: 'बाज़ार',   accent: '#1D9E75', bg: '#E1F5EE', color: '#085041', icon: 'cart-outline' },
  emergency: { label: 'आपात',    accent: '#C0392B', bg: '#FDECEA', color: '#7B241C', icon: 'pulse-outline' },
}

function timeAgoHindi(dateStr) {
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

function getInitials(name) {
  if (!name) return 'NA'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function avatarBg(badge) {
  const map = {
    'Nagarik': '#1D9E75', 'Sewak': '#0F6E56',
    'Jan Nayak': '#BA7517', 'Pratinidhi': '#534AB7',
  }
  return map[badge] || '#1D9E75'
}

export default function PostCard({ post, onShare }) {
  const type = POST_TYPES[post?.type] || POST_TYPES.notice

  return (
    <View style={s.card}>
      {/* Coloured top accent bar */}
      <View style={[s.accent, { backgroundColor: type.accent }]} />

      <View style={s.body}>
        {/* Meta row */}
        <View style={s.metaRow}>
          {/* Type badge */}
          <View style={[s.badge, { backgroundColor: type.bg }]}>
            <Ionicons name={type.icon} size={11} color={type.color} />
            <Text style={[s.badgeText, { color: type.color }]}>
              {type.label}
            </Text>
          </View>
          {/* Time */}
          <Text style={s.time}>
            {timeAgoHindi(post?.createdAt)}
          </Text>
        </View>

        {/* Post text */}
        <Text style={s.postText}>{post?.body}</Text>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.authorRow}>
            {/* Avatar */}
            <View style={[s.avatar, { backgroundColor: avatarBg(post?.author?.badge) }]}>
              <Text style={s.avatarText}>
                {getInitials(post?.author?.name)}
              </Text>
            </View>
            {/* Name */}
            <Text style={s.authorName} numberOfLines={1}>
              {post?.author?.name || 'Nagarik'}
            </Text>
            {/* Badge pill */}
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>
                {post?.author?.badge || 'Nagarik'}
              </Text>
            </View>
          </View>

          {/* Share button */}
          <TouchableOpacity
            style={s.shareBtn}
            onPress={() => onShare?.(post)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Share post"
          >
            <Ionicons name="share-outline" size={15} color="#A8B5AD" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E8EDEA',
    overflow: 'hidden',
    marginBottom: 10,
  },
  accent: {
    height: 3,
  },
  body: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Mukta-SemiBold',
  },
  time: {
    fontSize: 11,
    color: '#A8B5AD',
    fontFamily: 'Mukta-Regular',
  },
  postText: {
    fontSize: 14,
    color: '#0D1B12',
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Mukta-Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  avatar: {
    width: 26, height: 26,
    borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 10, fontWeight: '600', color: '#fff',
  },
  authorName: {
    fontSize: 12, fontWeight: '500',
    color: '#607068',
    fontFamily: 'Mukta-Medium',
    maxWidth: 100,
  },
  badgePill: {
    backgroundColor: '#E1F5EE',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgePillText: {
    fontSize: 10, fontWeight: '500',
    color: '#085041',
    fontFamily: 'Mukta-Medium',
  },
  shareBtn: {
    width: 30, height: 30,
    borderRadius: 8,
    backgroundColor: '#F4F7F5',
    borderWidth: 0.5, borderColor: '#E8EDEA',
    alignItems: 'center', justifyContent: 'center',
  },
})
