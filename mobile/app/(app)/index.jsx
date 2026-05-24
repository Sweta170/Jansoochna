import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  View, Text, FlatList, ScrollView,
  TouchableOpacity, StatusBar, Share,
  StyleSheet, TextInput, Modal, DeviceEventEmitter, RefreshControl
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import { io } from 'socket.io-client'
import { router } from 'expo-router'
import PostCard from '../../components/PostCard'

// Shorten location — removes brackets and pincode, keeps city + state
function shortLocation(location) {
  if (!location) return ''
  const str = typeof location === 'string' ? location
    : location?.address || location?.city || ''
  const cleaned = str
    .replace(/\(\d{6}\)/g, '')   // remove (144402)
    .replace(/\([^)]*\)/g, ' ')  // remove (फगवाड़ा)
    .replace(/\s+/g, ' ')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return cleaned.slice(-2).join(', ')
}

// Relative time in Hindi
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

// Initials from name
function getInitials(name) {
  if (!name) return 'NA'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Post type config
const POST_TYPES = {
  notice:    { label: 'सूचना',    accent: '#185FA5', bg: '#E6F1FB', color: '#0C447C' },
  outage:    { label: 'कटौती',   accent: '#E07B2A', bg: '#FDF0E6', color: '#854F0B' },
  alert:     { label: 'चेतावनी', accent: '#C0392B', bg: '#FDECEA', color: '#7B241C' },
  market:    { label: 'बाज़ार',   accent: '#1D9E75', bg: '#E1F5EE', color: '#085041' },
  emergency: { label: 'आपात',    accent: '#C0392B', bg: '#FDECEA', color: '#7B241C' },
}

const FILTER_CHIPS = [
  { key: 'all',       label: 'सभी' },
  { key: 'outage',    label: 'कटौती' },
  { key: 'notice',    label: 'सूचना' },
  { key: 'alert',     label: 'चेतावनी' },
  { key: 'market',    label: 'बाज़ार' },
  { key: 'emergency', label: 'आपात' },
]

// Avatar colour by badge
function avatarBg(badge) {
  const map = {
    'Nagarik': '#1D9E75', 'Sewak': '#0F6E56',
    'Jan Nayak': '#BA7517', 'Pratinidhi': '#534AB7',
  }
  return map[badge] || '#1D9E75'
}

export default function MohallaBoard() {
  const { t } = useTranslation()
  const { user } = useContext(AuthContext)
  
  const [posts, setPosts] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [activeFilter, setActiveFilter] = useState('all')
  const [showPostModal, setShowPostModal] = useState(false)
  const [pendingPosts, setPendingPosts]   = useState([])
  const [newPostsBanner, setNewPostsBanner] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showJanBot, setShowJanBot] = useState(false)

  // Modal creation fields
  const [postBody, setPostBody] = useState('')
  const [postType, setPostType] = useState('notice')
  const [submitting, setSubmitting] = useState(false)
  const [postError, setPostError] = useState('')

  const flatListRef = useRef(null)

  useEffect(() => {
    if (user?.pincode) {
      fetchPosts()
      
      // Setup socket dynamically from API base URL
      const socketUrl = api.defaults.baseURL.replace('/api', '')
      const socket = io(socketUrl)
      socket.emit('join-pincode', user.pincode)
      
      // Update existing socket listener to buffer instead of auto-prepend
      socket.on('new-post', (post) => {
        if (post.pincode === user?.pincode) {
          setPendingPosts(prev => [post, ...prev])
          setNewPostsBanner(true)
        }
      })
      
      return () => socket.disconnect()
    }
  }, [user?.pincode])

  useEffect(() => {
    // Fetch unread notifications count
    api.get('/user/notifications')
      .then(res => {
        const unread = res.data.filter(n => !n.read).length
        setUnreadCount(unread)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (showJanBot) {
      DeviceEventEmitter.emit('open-janbot')
      setShowJanBot(false)
    }
  }, [showJanBot])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/posts?pincode=${user?.pincode || '000000'}`)
      setPosts(res.data.posts || res.data)
    } catch (err) {
      console.log('fetch posts error', err)
      // Mock data for UI presentation
      setPosts([
        { 
          _id: '1', 
          type: 'notice', 
          body: 'रविवार का बाज़ार बारिश के कारण नए ग्राउंड में शिफ्ट कर दिया गया है।', 
          author: { name: 'रामेश', badge: 'Sewak' }, 
          createdAt: new Date().toISOString() 
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }

  function loadPendingPosts() {
    setPosts(prev => [...pendingPosts, ...prev])
    setPendingPosts([])
    setNewPostsBanner(false)
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const handleCreatePost = async () => {
    if (!postBody.trim()) return

    if (postBody.length > 200) {
      setPostError('Post 200 letters se zyada nahi ho sakti.')
      return
    }

    setSubmitting(true)
    setPostError('')

    try {
      const response = await api.post('/posts', {
        body: postBody,
        type: postType
      })

      // Add to feed immediately
      setPosts(prev => [response.data.post || response.data, ...prev])
      
      // Close modal
      setShowPostModal(false)
      setPostBody('')
      setPostType('notice')
    } catch (err) {
      console.error(err)
      setPostError(err.response?.data?.error || 'Post share karne mein error aayi.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadMore = () => {
    // No-op
  }

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.type === activeFilter)

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D24" />

      {/* ── STICKY HEADER ─────────────────────── */}
      <View style={styles.header}>

        {/* Top row: title + buttons */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>आपका मोहल्ला</Text>
            <View style={styles.locationRow}>
              {/* Live dot */}
              <View style={styles.liveDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {shortLocation(user?.location)} · Live
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Bell / Notifications button — FIXED: proper TouchableOpacity */}
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.8)" />
              {/* Unread badge — show only if unreadCount > 0 */}
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* JanBot button */}
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: '#1D9E75' }]}
              onPress={() => setShowJanBot(true)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Open JanBot"
            >
              <Ionicons name="sparkles-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick post input */}
        <TouchableOpacity
          style={styles.quickPost}
          onPress={() => setShowPostModal(true)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Create a new post"
        >
          <Text style={styles.quickPostText}>
            अपने मोहल्ले को कुछ बताएं...
          </Text>
          <View style={styles.quickPostIcon}>
            <Ionicons name="pencil-outline" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_CHIPS.map(chip => {
            const isActive = activeFilter === chip.key
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(chip.key)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={`Filter by ${chip.label}`}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* ── NEW POSTS BANNER ──────────────────── */}
      {newPostsBanner && (
        <TouchableOpacity
          style={styles.newPostsBanner}
          onPress={loadPendingPosts}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-up" size={14} color="#5DC9A1" />
          <Text style={styles.newPostsBannerText}>
            {pendingPosts.length} नए पोस्ट देखें
          </Text>
        </TouchableOpacity>
      )}

      {/* ── FEED ──────────────────────────────── */}
      {loading ? (
        // Skeleton loaders
        <ScrollView
          contentContainerStyle={{ padding: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonAccent} />
              <View style={{ padding: 14, gap: 8 }}>
                <View style={[styles.skeletonLine, { width: 80, height: 18, borderRadius: 100 }]} />
                <View style={[styles.skeletonLine, { width: '100%', height: 12 }]} />
                <View style={[styles.skeletonLine, { width: '75%', height: 12 }]} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredPosts}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}        // keep existing loadMore function
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D9E75" />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onShare={(post) => {
                // Native share
                Share.share({
                  message: `${post.body}\n\n— JanSoochna मोहल्ला बोर्ड`,
                })
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {/* Icon in rounded square */}
              <View style={styles.emptyIcon}>
                <Ionicons name="newspaper-outline" size={28} color="#085041" />
              </View>

              <Text style={styles.emptyTitle}>
                {activeFilter === 'all'
                  ? 'अभी कोई पोस्ट नहीं'
                  : `कोई ${POST_TYPES[activeFilter]?.label || ''} पोस्ट नहीं`}
              </Text>

              <Text style={styles.emptySub}>
                {activeFilter === 'all'
                  ? 'पहले पोस्ट करें और अपने मोहल्ले को जागरूक करें!'
                  : 'इस category में अभी कोई update नहीं है।'}
              </Text>

              {activeFilter === 'all' && (
                <TouchableOpacity
                  style={styles.emptyCta}
                  onPress={() => setShowPostModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil-outline" size={15} color="#fff" />
                  <Text style={styles.emptyCtaText}>पोस्ट करें</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Post Creation Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>पोस्ट करें</Text>
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <Ionicons name="close-outline" size={24} color="#607068" />
              </TouchableOpacity>
            </View>

            {postError ? (
              <Text style={styles.modalError}>{postError}</Text>
            ) : null}

            {/* Category Selector */}
            <Text style={styles.modalLabel}>Category चुनें</Text>
            <View style={styles.modalCategoryRow}>
              {Object.keys(POST_TYPES).map((key) => {
                const type = POST_TYPES[key]
                const isSelected = postType === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.modalCatBtn, isSelected && styles.modalCatBtnActive]}
                    onPress={() => setPostType(key)}
                  >
                    <Text style={[styles.modalCatBtnText, isSelected && styles.modalCatBtnTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                multiline
                numberOfLines={4}
                maxLength={200}
                placeholder="अपने मोहल्ले को कुछ बताएं..."
                value={postBody}
                onChangeText={setPostBody}
              />
              <Text style={styles.charCount}>{postBody.length}/200</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleCreatePost}
              disabled={submitting || !postBody.trim()}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'पोस्ट हो रहा है...' : 'शेयर करें'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },

  // ── HEADER ────────────────────────────────
  header: {
    backgroundColor: '#0A3D24',
    paddingTop: 48, // Added safety padding for status bar area on modern screens
    // No shadow* — use boxShadow
    boxShadow: '0px 2px 12px rgba(10,61,36,0.18)',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 30,
    marginBottom: 4,
    fontFamily: 'Mukta-Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#5DC9A1',
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Mukta-Regular',
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  headerBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',   // for notif badge positioning
  },
  notifBadge: {
    position: 'absolute',
    top: -3, right: -3,
    backgroundColor: '#C0392B',
    borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: '#0A3D24',
  },
  notifBadgeText: {
    fontSize: 9, fontWeight: '700', color: '#fff',
  },

  // ── QUICK POST ────────────────────────────
  quickPost: {
    backgroundColor: '#1D9E75',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  quickPostText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Mukta-Regular',
  },
  quickPostIcon: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── FILTER CHIPS ──────────────────────────
  filtersScroll: {
    paddingBottom: 0,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Mukta-Medium',
  },
  chipTextActive: {
    color: '#0A3D24',
    fontWeight: '700',
    fontFamily: 'Mukta-Bold',
  },

  // ── NEW POSTS BANNER ──────────────────────
  newPostsBanner: {
    backgroundColor: '#0A3D24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 100,
  },
  newPostsBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5DC9A1',
    fontFamily: 'Mukta-SemiBold',
  },

  // ── FEED ──────────────────────────────────
  feedContent: {
    padding: 14,
    paddingBottom: 80,
  },

  // ── SKELETON ──────────────────────────────
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E8EDEA',
    overflow: 'hidden',
    marginBottom: 10,
  },
  skeletonAccent: {
    height: 3,
    backgroundColor: '#E8EDEA',
  },
  skeletonLine: {
    backgroundColor: '#F4F7F5',
    borderRadius: 6,
  },

  // ── EMPTY STATE ───────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  emptyIcon: {
    width: 68, height: 68,
    borderRadius: 20,
    backgroundColor: '#E1F5EE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B12',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Mukta-SemiBold',
  },
  emptySub: {
    fontSize: 14,
    color: '#607068',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Mukta-Regular',
    maxWidth: 240,
  },
  emptyCta: {
    backgroundColor: '#1D9E75',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Mukta-SemiBold',
  },

  // ── MODAL ─────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A3D24',
    fontFamily: 'Mukta-Bold',
  },
  modalError: {
    color: '#C0392B',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Mukta-Medium',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#607068',
    marginBottom: 8,
    fontFamily: 'Mukta-Medium',
  },
  modalCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalCatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EDEA',
    backgroundColor: '#F4F7F5',
  },
  modalCatBtnActive: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  modalCatBtnText: {
    fontSize: 12,
    color: '#607068',
    fontFamily: 'Mukta-Regular',
  },
  modalCatBtnTextActive: {
    color: '#fff',
    fontFamily: 'Mukta-Medium',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#0D1B12',
    fontFamily: 'Mukta-Regular',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 10,
    color: '#A8B5AD',
  },
  submitBtn: {
    backgroundColor: '#1D9E75',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Mukta-SemiBold',
  },

})
