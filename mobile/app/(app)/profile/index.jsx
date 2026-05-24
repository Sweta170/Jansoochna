import React, { useContext, useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Modal, Switch, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthContext } from '../../../context/AuthContext'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../../services/api'
import { getPincodeName } from '../../../utils/pincodeMap'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी', labelEn: 'Hindi', flag: '🇮🇳' },
  { code: 'en', label: 'English', labelEn: 'English', flag: '🇬🇧' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', labelEn: 'Punjabi', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', labelEn: 'Marathi', flag: '🇮🇳' },
]

// Generates initials from a name string
function getInitials(name) {
  if (!name) return 'NA'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Cleans up the raw location string from the API
function formatLocation(location) {
  if (!location) return '—'
  if (typeof location === 'object') {
    const ward = location.ward
    const district = location.district
    const state = location.state
    const pincode = location.pincode
    const city = location.city || location.area

    const parts = [ward, city || district, district, state].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)
    if (parts.length > 0) {
      return parts.join(', ') + (pincode ? ` · ${pincode}` : '')
    }

    const address = location.address
    const fallbackParts = [address, district, state].filter(Boolean)
    return fallbackParts.join(', ') + (pincode ? ` · ${pincode}` : '')
  }
  if (typeof location === 'string') {
    const pincode = location.match(/\d{6}/)?.[0]
    const cleaned = location
      .replace(/\(\d{6}\)/g, '')
      .replace(/\([^)]*\)/g, ', ')
      .replace(/,\s*,/g, ',')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const short = cleaned.slice(-3).join(', ')
    return pincode ? `${short} · ${pincode}` : short
  }
  return String(location)
}

// Badge dot colour
function getBadgeColor(badge) {
  const map = {
    'Nagarik':     '#5DC9A1',
    'Sewak':       '#1D9E75',
    'Jan Nayak':   '#C9A227',
    'Pratinidhi':  '#8B5CF6',
  }
  return map[badge] || '#5DC9A1'
}

// Badge progress thresholds
const BADGE_ORDER = ['Nagarik', 'Sewak', 'Jan Nayak', 'Pratinidhi']
const BADGE_THRESHOLDS = {
  'Nagarik': 0, 'Sewak': 100, 'Jan Nayak': 250, 'Pratinidhi': 500
}
const BADGE_ICONS = {
  'Nagarik': 'person-outline',
  'Sewak': 'leaf-outline',
  'Jan Nayak': 'star-outline',
  'Pratinidhi': 'trophy-outline',
}

function getProgressData(points, badge) {
  const currentIndex = BADGE_ORDER.indexOf(badge || 'Nagarik')
  const nextBadge = BADGE_ORDER[currentIndex + 1]
  const currentThreshold = BADGE_THRESHOLDS[badge || 'Nagarik']
  const nextThreshold = BADGE_THRESHOLDS[nextBadge] || 500
  const pct = Math.min(
    ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
    100
  )
  const remaining = nextThreshold - points
  return { nextBadge, nextThreshold, pct: Math.max(pct, 0), remaining }
}

export default function ProfileScreen() {
  const { user, logout, updateUserProfile } = useContext(AuthContext)
  const { i18n, t } = useTranslation()
  const [points, setPoints] = useState(0)
  const [showLangModal, setShowLangModal] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [currentLang, setCurrentLang] = useState(i18n.language || 'hi')

  // Location editing states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPincode, setEditPincode] = useState('')
  const [editState, setEditState] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editWard, setEditWard] = useState('')
  const [editArea, setEditArea] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)

  const handleOpenEditLocation = () => {
    setEditPincode(user?.pincode || '')
    setEditState(user?.state || user?.location?.state || '')
    setEditDistrict(user?.district || user?.location?.district || '')
    setEditCity(user?.city || user?.location?.city || '')
    setEditWard(user?.ward || user?.location?.ward || '')
    setEditArea(user?.area || user?.location?.address || '')
    setEditError('')
    setShowEditModal(true)
  }

  const handleEditPincodeChange = async (val) => {
    const cleanVal = val.replace(/\D/g, '')
    setEditPincode(cleanVal)
    setEditError('')

    if (cleanVal.length === 6 && /^\d{6}$/.test(cleanVal)) {
      setPincodeLoading(true)
      try {
        const response = await api.get(`/auth/lookup-pincode?pincode=${cleanVal}`)
        setEditState(response.data.state || '')
        setEditDistrict(response.data.district || '')
        setEditCity(response.data.city || '')
      } catch (err) {
        setEditError('Pincode nahi mila — manually bharen')
        setEditState('')
        setEditDistrict('')
        setEditCity('')
      } finally {
        setPincodeLoading(false)
      }
    }
  }

  const handleSaveLocation = async () => {
    if (editPincode.length !== 6) {
      setEditError('Zaroori: 6-digit Pincode enter karein.')
      return
    }
    if (!editState.trim() || !editDistrict.trim()) {
      setEditError('Zaroori: State and District enter karein.')
      return
    }

    setEditLoading(true)
    setEditError('')
    try {
      const response = await api.patch('/user/location', {
        pincode: editPincode,
        state: editState.trim(),
        district: editDistrict.trim(),
        city: editCity.trim() || editDistrict.trim(),
        ward: editWard.trim(),
        area: editArea.trim()
      })
      
      await updateUserProfile(response.data.user)
      setShowEditModal(false)
    } catch (err) {
      console.error('Error saving location:', err)
      setEditError(err.response?.data?.error || 'Location update fail ho gaya.')
    } finally {
      setEditLoading(false)
    }
  }
  
  // Notification preferences
  const [notifIssues, setNotifIssues] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)
  const [notifChat, setNotifChat] = useState(false)

  // Dynamic states
  const [stats, setStats] = useState({ issuesReported: 0, votesCast: 0, postsMade: 0 })
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeader, setLoadingLeader] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load saved preferences
  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem('appLanguage')
        if (savedLang) {
          setCurrentLang(savedLang)
          i18n.changeLanguage(savedLang)
        }
        const savedNotifs = await AsyncStorage.getItem('notifPrefs')
        if (savedNotifs) {
          const prefs = JSON.parse(savedNotifs)
          setNotifIssues(prefs.issues ?? true)
          setNotifUpdates(prefs.updates ?? true)
          setNotifChat(prefs.chat ?? false)
        }
      } catch (e) { /* ignore */ }
    })()
  }, [])

  const changeLanguage = async (langCode) => {
    i18n.changeLanguage(langCode)
    setCurrentLang(langCode)
    await AsyncStorage.setItem('appLanguage', langCode)
    setShowLangModal(false)
  }

  const saveNotifPrefs = async (key, value) => {
    const prefs = { issues: notifIssues, updates: notifUpdates, chat: notifChat, [key]: value }
    if (key === 'issues') setNotifIssues(value)
    if (key === 'updates') setNotifUpdates(value)
    if (key === 'chat') setNotifChat(value)
    await AsyncStorage.setItem('notifPrefs', JSON.stringify(prefs))
  }

  // Load user dynamic data
  useEffect(() => {
    if (user?.pincode) {
      setLoading(true)
      Promise.all([fetchProfileStats(), fetchLeaderboard()]).finally(() => {
        setLoading(false)
      })
    } else if (user) {
      setLoading(false)
    }
  }, [user])

  const fetchProfileStats = async () => {
    try {
      const res = await api.get('/user/me')
      if (res.data && res.data.stats) {
        setStats(res.data.stats)
      }
    } catch (err) {
      console.log('fetchProfileStats error', err)
    }
  }

  const fetchLeaderboard = async () => {
    setLoadingLeader(true)
    try {
      const res = await api.get(`/user/leaderboard?pincode=${user?.pincode}`)
      setLeaderboard(res.data || [])
    } catch (err) {
      console.log('fetchLeaderboard error', err)
    } finally {
      setLoadingLeader(false)
    }
  }

  // Number count up animation for points
  useEffect(() => {
    let start = 0
    const target = user?.points || 0
    const duration = 1500
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setPoints(target)
        clearInterval(timer)
      } else {
        setPoints(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [user])

  const handleLogout = () => {
    Alert.alert(
      t('Log Out'),
      t('Are you sure you want to log out?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Log Out'), style: 'destructive', onPress: logout }
      ]
    )
  }

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

  // At top of component — animated progress bar width
  const progressAnim = useSharedValue(0)
  const { pct, nextBadge, remaining } = getProgressData(
    user?.points || 0,
    user?.badge
  )
  const currentBadgeIndex = BADGE_ORDER.indexOf(user?.badge || 'Nagarik')

  // Animate progress bar on mount / pct change
  useEffect(() => {
    progressAnim.value = withTiming(pct, { duration: 900 })
  }, [pct])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }))

  if (loading) return (
    <View style={styles.root}>
      <View style={[styles.hero, { height: 160 }]} />
      <View style={{ padding: 16, gap: 12, marginTop: -28 }}>
        {/* Float card skeleton */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 16,
          height: 80,
        }} />
        {/* Progress card skeleton */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 16,
          height: 140, marginTop: 18,
        }} />
        {/* Stats grid skeleton */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          {[1,2,3,4].map(i => (
            <View key={i} style={{
              backgroundColor: '#fff', borderRadius: 16,
              height: 90, width: '47.5%',
            }} />
          ))}
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── HERO BAND ─────────────────────────────── */}
        <View style={styles.hero}>
          {/* Settings button top-right */}
          <View style={styles.heroTop}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setShowNotifModal(true)}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(user?.name)}
              </Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.heroName}>{user?.name || 'Nagarik'}</Text>
              <View style={styles.badgePill}>
                <View style={[
                  styles.badgeDot,
                  { backgroundColor: getBadgeColor(user?.badge) }
                ]} />
                <Text style={styles.badgePillText}>
                  {user?.badge || 'Nagarik'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── FLOATING INFO CARD ────────────────────── */}
        <View style={styles.floatCard}>
          {/* Location row */}
          <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Ionicons name="location-outline" size={15} color="#A8B5AD" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>AREA</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {formatLocation(user?.location && typeof user?.location === 'object' ? user.location : user)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenEditLocation}
              style={{
                backgroundColor: '#E1F5EE',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#1D9E75', fontSize: 11, fontWeight: '700' }}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Ward row (render if exists) */}
          {(user?.ward || user?.location?.ward) ? (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={15} color="#A8B5AD" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>WARD</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {user?.ward || user?.location?.ward}
                </Text>
              </View>
            </>
          ) : null}

          {/* Divider */}
          <View style={styles.infoDivider} />
          {/* Points row */}
          <View style={styles.infoRow}>
            <Ionicons name="medal-outline" size={15} color="#A8B5AD" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>POINTS</Text>
            <Text style={[styles.infoValue, { color: '#1D9E75', fontWeight: '600' }]}>
              {points} pts · {user?.badge || 'Nagarik'} badge
            </Text>
          </View>
        </View>

        {/* ── LEVEL PROGRESS ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level progress</Text>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {user?.badge || 'Nagarik'} → {nextBadge || 'Max level'}
              </Text>
              <Text style={styles.progressPts}>
                {points} / {BADGE_THRESHOLDS[nextBadge] || 500} pts
              </Text>
            </View>

            {/* Animated progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>

            {/* Badge milestone steps */}
            <View style={styles.milestoneRow}>
              {BADGE_ORDER.map((badge, i) => {
                const isDone   = i < currentBadgeIndex
                const isActive = i === currentBadgeIndex
                return (
                  <View key={badge} style={styles.milestoneStep}>
                    <View style={[
                      styles.milestoneIcon,
                      isDone   && styles.milestoneIconDone,
                      isActive && styles.milestoneIconActive,
                    ]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={15} color="#085041" />
                      ) : (
                        <Ionicons
                          name={BADGE_ICONS[badge]}
                          size={15}
                          color={isActive ? '#fff' : '#A8B5AD'}
                        />
                      )}
                    </View>
                    <Text style={[
                      styles.milestoneLabel,
                      isDone   && { color: '#085041' },
                      isActive && { color: '#0A3D24', fontWeight: '600' },
                    ]}>
                      {badge}
                    </Text>
                  </View>
                )
              })}
            </View>

            {/* Hint chip */}
            {nextBadge && (
              <View style={styles.hintChip}>
                <Text style={styles.hintText}>
                  {remaining} more points to reach {nextBadge}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── ACTIVITY STATS ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.statsGrid}>
            {[
              {
                icon: 'warning-outline',
                iconBg: '#EAF3DE', iconColor: '#3B6D11',
                value: stats?.issuesReported ?? 0,
                label: 'Issues reported',
              },
              {
                icon: 'thumbs-up-outline',
                iconBg: '#FAEEDA', iconColor: '#854F0B',
                value: stats?.votesCast ?? 0,
                label: 'Votes cast',
              },
              {
                icon: 'chatbubble-outline',
                iconBg: '#E6F1FB', iconColor: '#185FA5',
                value: stats?.postsMade ?? 0,
                label: 'Posts made',
              },
              {
                icon: 'star-outline',
                iconBg: '#E1F5EE', iconColor: '#085041',
                value: user?.points ?? 0,
                label: 'Total points',
              },
            ].map((item, i) => (
              <View key={i} style={styles.statCard}>
                <View style={styles.statTop}>
                  <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={17} color={item.iconColor} />
                  </View>
                </View>
                <Text style={styles.statNum}>
                  {item.value.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── LEADERBOARD ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Leaderboard · {user?.pincode || '—'}
          </Text>
          <View style={styles.card}>
            {leaderboard?.length > 0 ? (
              leaderboard.map((entry, i) => {
                const isMe = entry._id === user?._id
                return (
                  <View key={entry._id} style={[
                    styles.lbRow,
                    i > 0 && styles.lbRowBorder,
                    isMe && styles.lbRowMe,
                  ]}>
                    <Text style={[
                      styles.lbRank,
                      i === 0 && { color: '#BA7517', fontWeight: '700' },
                    ]}>
                      #{i + 1}
                    </Text>
                    <View style={styles.lbAvatar}>
                      <Text style={styles.lbAvatarText}>
                        {getInitials(entry.name)}
                      </Text>
                    </View>
                    <View style={styles.lbInfo}>
                      <Text style={styles.lbName}>
                        {entry.name}
                        {isMe && (
                          <Text style={styles.lbYou}> (you)</Text>
                        )}
                      </Text>
                      <Text style={styles.lbBadge}>{entry.badge}</Text>
                    </View>
                    <View style={[styles.lbPtsPill, isMe && styles.lbPtsPillMe]}>
                      <Text style={[styles.lbPts, isMe && styles.lbPtsMe]}>
                        {entry.points} pts
                      </Text>
                    </View>
                  </View>
                )
              })
            ) : (
              // Empty state
              <View style={styles.lbEmpty}>
                <Ionicons name="people-outline" size={28} color="#A8B5AD" />
                <Text style={styles.lbEmptyText}>No other citizens in your ward yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── SETTINGS ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            {[
              {
                icon: 'language-outline',
                iconBg: '#E6F1FB', iconColor: '#185FA5',
                title: 'Language',
                sub: currentLangObj.flag + ' ' + currentLangObj.label + ' (' + currentLangObj.labelEn + ')',
                onPress: () => setShowLangModal(true),
              },
              {
                icon: 'notifications-outline',
                iconBg: '#FAEEDA', iconColor: '#854F0B',
                title: 'Notifications',
                sub: [notifIssues && 'Issues', notifUpdates && 'Updates', notifChat && 'Chat'].filter(Boolean).join(', ') || 'All off',
                onPress: () => setShowNotifModal(true),
              },
              {
                icon: 'shield-checkmark-outline',
                iconBg: '#E1F5EE', iconColor: '#085041',
                title: 'Privacy policy',
                sub: 'How we use your data',
                onPress: () => Alert.alert('Privacy Policy', 'JanSoochna is committed to protecting your privacy. Your location data is used solely for Mohalla Board rooms and issues mapping.'),
              },
              {
                icon: 'information-circle-outline',
                iconBg: '#EEEDFE', iconColor: '#534AB7',
                title: 'About JanSoochna',
                sub: 'Version 1.0.0',
                onPress: () => Alert.alert('About JanSoochna', 'JanSoochna is a hyperlocal civic-engagement web and mobile application designed for Indian citizens.'),
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.settingRow, i > 0 && styles.settingRowBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.settingIconWrap, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View style={styles.settingBody}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A8B5AD" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LOG OUT ───────────────────────────────── */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#A32D2D" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ===== LANGUAGE MODAL ===== */}
      <Modal visible={showLangModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌐 Choose Language</Text>
              <Pressable onPress={() => setShowLangModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✖</Text>
              </Pressable>
            </View>

            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={[
                  styles.langRow,
                  currentLang === lang.code ? styles.langRowActive : styles.langRowInactive
                ]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <View style={styles.langInfo}>
                  <Text style={[styles.langLabel, currentLang === lang.code && styles.langLabelActive]}>
                    {lang.label}
                  </Text>
                  <Text style={styles.langSub}>{lang.labelEn}</Text>
                </View>
                {currentLang === lang.code && (
                  <View style={styles.langCheck}>
                    <Text style={styles.langCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== NOTIFICATIONS MODAL ===== */}
      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notifications</Text>
              <Pressable onPress={() => setShowNotifModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✖</Text>
              </Pressable>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchEmoji}>📢</Text>
                <View>
                  <Text style={styles.switchTitle}>Issue Updates</Text>
                  <Text style={styles.switchSubtitle}>Status of your reported issues</Text>
                </View>
              </View>
              <Switch
                value={notifIssues}
                onValueChange={(v) => saveNotifPrefs('issues', v)}
                trackColor={{ false: '#E5E7EB', true: '#1D9E75' }}
                thumbColor={notifIssues ? '#fff' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchEmoji}>📰</Text>
                <View>
                  <Text style={styles.switchTitle}>App Updates</Text>
                  <Text style={styles.switchSubtitle}>New features and gov updates</Text>
                </View>
              </View>
              <Switch
                value={notifUpdates}
                onValueChange={(v) => saveNotifPrefs('updates', v)}
                trackColor={{ false: '#E5E7EB', true: '#1D9E75' }}
                thumbColor={notifUpdates ? '#fff' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchEmoji}>💬</Text>
                <View>
                  <Text style={styles.switchTitle}>JanBot Chat</Text>
                  <Text style={styles.switchSubtitle}>Chatbot tips and reminders</Text>
                </View>
              </View>
              <Switch
                value={notifChat}
                onValueChange={(v) => saveNotifPrefs('chat', v)}
                trackColor={{ false: '#E5E7EB', true: '#1D9E75' }}
                thumbColor={notifChat ? '#fff' : '#9CA3AF'}
              />
            </View>

            <Text style={styles.modalFooterText}>
              Notification settings are saved locally on your device
            </Text>
          </View>
        </View>
      </Modal>

      {/* ===== EDIT LOCATION MODAL ===== */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📍 Edit Location</Text>
                <Pressable onPress={() => setShowEditModal(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✖</Text>
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {/* Pincode Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>Pincode</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12 }}>
                    <TextInput
                      style={{ flex: 1, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                      value={editPincode}
                      onChangeText={handleEditPincodeChange}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="e.g. 144402"
                    />
                    {pincodeLoading && (
                      <ActivityIndicator size="small" color="#1D9E75" />
                    )}
                  </View>
                </View>

                {/* State Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>State</Text>
                  <TextInput
                    style={{ backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                    value={editState}
                    onChangeText={setEditState}
                    placeholder="e.g. Punjab"
                  />
                </View>

                {/* District Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>Zila (District)</Text>
                  <TextInput
                    style={{ backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                    value={editDistrict}
                    onChangeText={setEditDistrict}
                    placeholder="e.g. Kapurthala"
                  />
                </View>

                {/* City Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>City / Town</Text>
                  <TextInput
                    style={{ backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="e.g. Phagwara"
                  />
                </View>

                {/* Ward Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>Ward (optional)</Text>
                  <TextInput
                    style={{ backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                    value={editWard}
                    onChangeText={setEditWard}
                    placeholder="e.g. Ward 12"
                  />
                </View>

                {/* Area Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#607068', textTransform: 'uppercase', marginBottom: 4 }}>Area / Mohalla (optional)</Text>
                  <TextInput
                    style={{ backgroundColor: '#F4F7F5', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '600', color: '#0D1B12' }}
                    value={editArea}
                    onChangeText={setEditArea}
                    placeholder="e.g. Model Town"
                  />
                </View>

                {editError ? (
                  <Text style={{ color: '#C0392B', fontSize: 11, fontWeight: '500', marginBottom: 10 }}>{editError}</Text>
                ) : null}

                {/* Preview */}
                {(editState || editDistrict) && (
                  <View style={{ backgroundColor: '#E1F5EE', padding: 12, borderRadius: 10, marginBottom: 14 }}>
                    <Text style={{ fontSize: 11, color: '#085041', fontWeight: '500', lineHeight: 15 }}>
                      📍 <Text style={{ fontWeight: '700' }}>Preview:</Text> {[editWard, editCity || editDistrict, editDistrict, editState, editPincode].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => setShowEditModal(false)}
                  style={{ flex: 1, backgroundColor: '#F4F7F5', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#E8EDEA' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#607068' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveLocation}
                  disabled={editLoading || pincodeLoading}
                  style={{ flex: 1, backgroundColor: '#1D9E75', paddingVertical: 12, borderRadius: 10, alignItems: 'center', opacity: editLoading ? 0.6 : 1 }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                    {editLoading ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  scroll: {
    paddingBottom: 40,
  },

  // ── HERO ──────────────────────────────────────
  hero: {
    backgroundColor: '#0A3D24',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 52,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  settingsBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1D9E75',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 26, fontWeight: '500', color: '#fff',
  },
  avatarInfo: {
    flex: 1, paddingBottom: 4,
  },
  heroName: {
    fontSize: 22, fontWeight: '500',
    color: '#fff', marginBottom: 7,
  },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    paddingVertical: 3, paddingLeft: 8, paddingRight: 12,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: 4,
  },
  badgePillText: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500',
  },

  // ── FLOAT CARD ────────────────────────────────
  floatCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -28,
    zIndex: 2,
    boxShadow: '0px 4px 12px rgba(10, 61, 36, 0.08)',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 10,
  },
  infoIcon: {
    width: 18, flexShrink: 0,
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: '#E8EDEA',
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 10, fontWeight: '600',
    color: '#A8B5AD', letterSpacing: 0.6,
    width: 46, flexShrink: 0,
  },
  infoValue: {
    fontSize: 13, color: '#0D1B12',
    flex: 1,
  },

  // ── SECTIONS ──────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '600',
    color: '#A8B5AD', letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E8EDEA',
    overflow: 'hidden',
    padding: 16,
  },

  // ── PROGRESS ──────────────────────────────────
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13, fontWeight: '500', color: '#0D1B12',
  },
  progressPts: {
    fontSize: 13, fontWeight: '500', color: '#1D9E75',
  },
  progressTrack: {
    backgroundColor: '#F4F7F5',
    borderRadius: 100, height: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1D9E75',
    borderRadius: 100,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneStep: {
    alignItems: 'center',
    gap: 5, flex: 1,
  },
  milestoneIcon: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F4F7F5',
    borderWidth: 0.5, borderColor: '#E8EDEA',
  },
  milestoneIconDone: {
    backgroundColor: '#E1F5EE',
    borderColor: '#5DC9A1',
  },
  milestoneIconActive: {
    backgroundColor: '#0A3D24',
    borderColor: '#1D9E75',
    // ring effect
    boxShadow: '0px 0px 6px rgba(29, 158, 117, 0.35)',
  },
  milestoneLabel: {
    fontSize: 9, textAlign: 'center',
    color: '#A8B5AD', fontWeight: '500',
    lineHeight: 13,
  },
  hintChip: {
    marginTop: 14,
    backgroundColor: '#E1F5EE',
    borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12, color: '#085041',
    fontWeight: '500',
  },

  // ── STATS ─────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5, borderColor: '#E8EDEA',
    padding: 14,
    width: '47.5%',
  },
  statTop: {
    marginBottom: 10,
  },
  statIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  statNum: {
    fontSize: 26, fontWeight: '500',
    color: '#0D1B12', lineHeight: 30,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11, color: '#607068',
  },

  // ── LEADERBOARD ───────────────────────────────
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, gap: 10,
  },
  lbRowBorder: {
    borderTopWidth: 0.5, borderTopColor: '#E8EDEA',
  },
  lbRowMe: {
    backgroundColor: '#E1F5EE',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  lbRank: {
    fontSize: 12, fontWeight: '500',
    color: '#A8B5AD', width: 22,
  },
  lbAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1D9E75',
    alignItems: 'center', justifyContent: 'center',
  },
  lbAvatarText: {
    fontSize: 11, fontWeight: '600', color: '#fff',
  },
  lbInfo: {
    flex: 1, minWidth: 0,
  },
  lbName: {
    fontSize: 13, fontWeight: '500', color: '#0D1B12',
  },
  lbYou: {
    fontSize: 11, color: '#085041', fontWeight: '400',
  },
  lbBadge: {
    fontSize: 11, color: '#607068', marginTop: 1,
  },
  lbPtsPill: {
    backgroundColor: '#E1F5EE',
    borderRadius: 100,
    paddingVertical: 2, paddingHorizontal: 10,
  },
  lbPtsPillMe: {
    backgroundColor: '#0A3D24',
  },
  lbPts: {
    fontSize: 13, fontWeight: '500', color: '#085041',
  },
  lbPtsMe: {
    color: '#fff',
  },
  lbEmpty: {
    alignItems: 'center', paddingVertical: 24, gap: 8,
  },
  lbEmptyText: {
    fontSize: 13, color: '#A8B5AD', textAlign: 'center',
  },

  // ── SETTINGS ──────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  settingRowBorder: {
    borderTopWidth: 0.5, borderTopColor: '#E8EDEA',
  },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  settingBody: {
    flex: 1, minWidth: 0,
  },
  settingTitle: {
    fontSize: 14, fontWeight: '500', color: '#0D1B12',
  },
  settingSubtitle: {
    fontSize: 12, color: '#607068', marginTop: 1,
  },

  // ── LOGOUT ────────────────────────────────────
  logoutWrap: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5, borderColor: '#F09595',
    backgroundColor: '#FCEBEB',
  },
  logoutText: {
    fontSize: 15, fontWeight: '500', color: '#A32D2D',
  },

  // ── MODALS ────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B12',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#607068',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  langRowActive: {
    backgroundColor: '#E1F5EE',
    borderColor: '#1D9E75',
  },
  langRowInactive: {
    backgroundColor: '#F4F7F5',
    borderColor: '#E8EDEA',
  },
  langFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  langInfo: {
    flex: 1,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1B12',
  },
  langLabelActive: {
    color: '#1D9E75',
  },
  langSub: {
    fontSize: 12,
    color: '#607068',
    marginTop: 2,
  },
  langCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langCheckText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  switchRow: {
    backgroundColor: '#F4F7F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1B12',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#607068',
    marginTop: 2,
  },
  modalFooterText: {
    fontSize: 12,
    color: '#607068',
    textAlign: 'center',
    marginTop: 16,
  },
})
