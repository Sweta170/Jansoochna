import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated'
import api from '../../../services/api'

function VoteButtonDetails({ issueId, initialVotes, isVotedInitially }) {
  const [voted, setVoted] = useState(isVotedInitially)
  const [votes, setVotes] = useState(initialVotes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setVoted(isVotedInitially)
    setVotes(initialVotes)
  }, [isVotedInitially, initialVotes])

  const handleVote = async () => {
    if (loading) return
    const nextVoted = !voted
    setVoted(nextVoted)
    setVotes(v => nextVoted ? v + 1 : Math.max(0, v - 1))
    setLoading(true)

    try {
      const response = await api.post(`/issues/${issueId}/vote`)
      if (response.data && response.data.voteCount !== undefined) {
        setVotes(response.data.voteCount)
        setVoted(response.data.userHasVoted)
      }
    } catch (err) {
      console.error('Vote error details:', err)
      setVoted(!nextVoted)
      setVotes(v => !nextVoted ? v + 1 : Math.max(0, v - 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Pressable 
      onPress={handleVote} 
      className={`py-3 rounded-xl flex-row justify-center items-center border ${voted ? 'bg-mintLt border-jade' : 'bg-jade border-transparent'}`}
    >
      <Text className={`font-bold text-lg ${voted ? 'text-jade' : 'text-white'}`}>
        👍 मैं भी — {votes} लोग
      </Text>
    </Pressable>
  )
}

export default function IssueDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchIssue = async () => {
    try {
      const res = await api.get(`/issues/${id}`)
      setIssue(res.data)
    } catch (err) {
      console.error('fetchIssue details error:', err)
      setError('Shikayat load karne mein problem aayi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchIssue()
    }
  }, [id])

  const getTimeline = (status, createdAt) => {
    const dateStr = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'
    const steps = [
      { id: 1, status: 'दर्ज हुई (Reported)', note: 'Shikayat platform par safaltapoorvak darj ki gayi.', date: dateStr, color: 'bg-saffron' }
    ]
    if (status === 'in_progress' || status === 'resolved') {
      steps.push({ 
        id: 2, 
        status: 'जांच जारी (Under Review)', 
        note: 'SDM Office/Mohalla pratinidhi is review resolution.', 
        date: 'Pragati par hai', 
        color: 'bg-turmeric' 
      })
    }
    if (status === 'resolved') {
      steps.push({ 
        id: 3, 
        status: 'समाधान हुआ (Resolved) ✅', 
        note: 'Shikayat ka samadhan ho gaya hai.', 
        date: 'Safalta', 
        color: 'bg-jade' 
      })
    }
    return steps
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1D9E75" />
      </SafeAreaView>
    )
  }

  if (error || !issue) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-rose-500 font-bold text-lg text-center mb-4">{error || 'Issue not found'}</Text>
        <Pressable onPress={() => router.back()} className="bg-jade px-6 py-2.5 rounded-full">
          <Text className="text-white font-bold">Back</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const timeline = getTimeline(issue.status, issue.createdAt)

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header Bar */}
      <View className="px-4 py-3 flex-row items-center border-b border-cloud">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-slate">←</Text>
        </Pressable>
        <Text className="text-xl font-bold text-forest flex-1" numberOfLines={1}>Issue details</Text>
      </View>

      <ScrollView className="flex-1 bg-fog">
        {/* Photo Section */}
        <View className="h-48 bg-charcoal items-center justify-center overflow-hidden">
          {issue.photoUrl ? (
            <Image source={{ uri: issue.photoUrl }} className="w-full h-full object-cover" />
          ) : (
            <>
              <Text className="text-4xl">📸</Text>
              <Text className="text-mist mt-2">No Photo Attached</Text>
            </>
          )}
        </View>

        {/* Content */}
        <View className="p-4 bg-white mb-2 shadow-sm">
          <View className="flex-row mb-2 space-x-2">
            <Text className="text-[10px] font-bold text-white bg-saffron px-1.5 py-0.5 rounded uppercase">{issue.category}</Text>
            <Text className="text-[10px] font-bold text-slate bg-cloud px-1.5 py-0.5 rounded uppercase">{issue.status}</Text>
          </View>
          
          <Text className="text-2xl font-bold text-ink mb-2 leading-8">{issue.title}</Text>
          <Text className="text-slate font-semibold mb-3">Description:</Text>
          <Text className="text-ink font-medium leading-relaxed mb-4">{issue.description}</Text>
          <Text className="text-slate font-medium mb-4">📍 {issue.location?.address}, Pincode {issue.location?.pincode}</Text>
          
          <VoteButtonDetails issueId={issue._id} initialVotes={issue.voteCount || 0} isVotedInitially={issue.userHasVoted || false} />
        </View>

        {/* Timeline */}
        <View className="p-4 bg-white mt-2 shadow-sm min-h-[300px]">
          <Text className="font-bold text-lg text-ink mb-6">Status Timeline</Text>
          
          {timeline.map((step, index) => (
            <View key={step.id} className="flex-row mb-6">
              <View className="items-center mr-4">
                <Animated.View entering={BounceIn.delay(index * 200)} className={`w-4 h-4 rounded-full ${step.color} border-2 border-white shadow-sm z-10`} />
                {index !== timeline.length - 1 && (
                  <View className="w-0.5 h-16 bg-cloud -mt-2 -mb-8" />
                )}
              </View>
              <View className="flex-1 -mt-1">
                <Text className="font-bold text-ink text-base">{step.status}</Text>
                {step.note && <Text className="text-slate text-sm mt-1">{step.note}</Text>}
                <Text className="text-mist text-xs mt-1">{step.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
