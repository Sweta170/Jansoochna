import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Pressable, FlatList, Platform, Image, ActivityIndicator, RefreshControl } from 'react-native'
import Animated, { FadeIn, FadeOut, withSpring, useSharedValue, useAnimatedStyle, withSequence, withTiming, FlipInX } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { AuthContext } from '../../../context/AuthContext'
import api from '../../../services/api'
import { useTranslation } from 'react-i18next'

let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

function VoteButton({ issueId, initialVotes, isVotedInitially }) {
  const { t } = useTranslation()
  const [voted, setVoted] = useState(isVotedInitially)
  const [votes, setVotes] = useState(initialVotes)
  const scale = useSharedValue(1)
  const thumbY = useSharedValue(0)

  useEffect(() => {
    setVoted(isVotedInitially)
    setVotes(initialVotes)
  }, [isVotedInitially, initialVotes])

  const handlePressIn = () => { scale.value = withSpring(0.92) }
  const handlePressOut = () => { scale.value = withSpring(1) }

  const handleVote = async () => {
    const nextVoted = !voted
    setVoted(nextVoted)
    setVotes(v => nextVoted ? v + 1 : Math.max(0, v - 1))
    thumbY.value = withSequence(withTiming(-6, {duration:150}), withTiming(0, {duration:150}))

    try {
      const response = await api.post(`/issues/${issueId}/vote`)
      if (response.data && response.data.voteCount !== undefined) {
        setVotes(response.data.voteCount)
        setVoted(response.data.userHasVoted)
      }
    } catch (err) {
      console.error('Vote error:', err)
      setVoted(!nextVoted)
      setVotes(v => !nextVoted ? v + 1 : Math.max(0, v - 1))
    }
  }

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateY: thumbY.value }] }))

  return (
    <Animated.View style={animStyle}>
      <Pressable 
        onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleVote}
        className={`flex-row items-center px-4 py-2 rounded-full border ${voted ? 'bg-mintLt border-jade' : 'bg-white border-cloud'}`}
      >
        <Animated.Text style={thumbStyle} className="mr-2 text-lg">👍</Animated.Text>
        <Animated.Text key={votes} entering={FlipInX} className={`font-bold ${voted ? 'text-jade' : 'text-slate'}`}>
          {t('issues.vote')} — {t('issues.vote.count', { count: votes })}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  )
}

export default function IssuesScreen() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const [viewMode, setViewMode] = useState('list') // 'map' or 'list'
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchIssues = async () => {
    try {
      const res = await api.get(`/issues?pincode=${user?.pincode || ''}`)
      if (res.data && Array.isArray(res.data.issues)) {
        setIssues(res.data.issues)
      } else {
        setIssues([])
      }
    } catch (err) {
      console.error('fetchIssues error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.pincode) {
      fetchIssues()
    }
  }, [user?.pincode])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchIssues()
    setRefreshing(false)
  }

  const getMapRegion = () => {
    if (issues.length > 0 && issues[0].location?.lat && issues[0].location?.lng) {
      return {
        latitude: issues[0].location.lat,
        longitude: issues[0].location.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    }
    return {
      latitude: 30.9010,
      longitude: 75.8573,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }
  }

  const renderIssue = ({ item }) => (
    <Pressable 
      onPress={() => router.push(`/(app)/issues/${item._id}`)}
      className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm border border-cloud"
    >
      <View className="flex-row">
        <View className="w-16 h-16 bg-fog rounded-lg items-center justify-center mr-3 border border-cloud overflow-hidden">
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} className="w-full h-full object-cover" />
          ) : (
            <Text className="text-2xl">📸</Text>
          )}
        </View>
        <View className="flex-1 justify-center">
          <View className="flex-row items-center mb-1">
            <Text className="text-[10px] font-bold text-white bg-saffron px-1.5 py-0.5 rounded uppercase mr-2">{item.category}</Text>
            <Text className="text-[10px] font-bold text-slate bg-fog px-1.5 py-0.5 rounded uppercase">{item.status}</Text>
          </View>
          <Text className="text-ink font-bold text-base mb-1" numberOfLines={1}>{item.title}</Text>
          <Text className="text-mist text-xs" numberOfLines={1}>📍 {item.location?.address || 'Area'}</Text>
        </View>
      </View>
      <View className="mt-4 border-t border-cloud pt-3 flex-row justify-between items-center">
        <VoteButton issueId={item._id} initialVotes={item.voteCount || 0} isVotedInitially={item.userHasVoted || false} />
        {(item.voteCount || 0) >= 50 && (
          <Text className="text-[10px] font-bold text-jade">📜 Petition Ready</Text>
        )}
      </View>
    </Pressable>
  )

  return (
    <SafeAreaView className="flex-1 bg-fog" edges={['top']}>
      {/* Top Toggle */}
      <View className="bg-white px-4 py-3 shadow-sm border-b border-cloud flex-row justify-between items-center z-10">
        <Text className="text-2xl font-extrabold text-forest">समस्याएं (Issues)</Text>
        <View className="flex-row bg-fog p-1 rounded-lg border border-cloud">
          <Pressable 
            onPress={() => setViewMode('map')} 
            className={`px-3 py-1.5 rounded-md ${viewMode === 'map' ? 'bg-white' : ''}`}
            style={viewMode === 'map' ? {
              boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
            } : null}
          >
            <Text className={`font-bold text-sm ${viewMode === 'map' ? 'text-jade' : 'text-slate'}`}>🗺️ नक्शा</Text>
          </Pressable>
          <Pressable 
            onPress={() => setViewMode('list')} 
            className={`px-3 py-1.5 rounded-md ${viewMode === 'list' ? 'bg-white' : ''}`}
            style={viewMode === 'list' ? {
              boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
            } : null}
          >
            <Text className={`font-bold text-sm ${viewMode === 'list' ? 'text-jade' : 'text-slate'}`}>📋 सूची</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1D9E75" />
          </View>
        ) : viewMode === 'map' ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            {Platform.OS !== 'web' ? (
              <MapView 
                style={{ flex: 1 }}
                initialRegion={getMapRegion()}
              >
                {issues.map(issue => (
                  <Marker 
                    key={issue._id} 
                    coordinate={{ 
                      latitude: issue.location?.lat || 30.9010, 
                      longitude: issue.location?.lng || 75.8573 
                    }}
                    title={issue.title}
                    description={issue.location?.address}
                    onCalloutPress={() => router.push(`/(app)/issues/${issue._id}`)}
                  />
                ))}
              </MapView>
            ) : (
              <View style={{ flex: 1, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-slate font-medium">Map available on mobile app</Text>
              </View>
            )}
            <Pressable className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md border border-cloud">
              <Text className="font-bold text-forest">🔍 Filters</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            <FlatList
              data={issues}
              keyExtractor={item => item._id}
              renderItem={renderIssue}
              contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D9E75" />}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center mt-20 p-6">
                  <Text className="text-4xl mb-4">📭</Text>
                  <Text className="text-slate font-bold text-base text-center">Koi samasya nahi mili.</Text>
                  <Text className="text-mist text-sm text-center mt-1">Aapke pincode {user?.pincode} mein sab theek hai!</Text>
                </View>
              }
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  )
}
