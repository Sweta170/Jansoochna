import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import api from '../../../services/api'

const CATEGORIES = [
  { id: 'identity', title: 'पहचान (Identity)', emoji: '🪪', color: 'bg-saffronLt', border: 'border-saffron/20' },
  { id: 'income', title: 'आय (Income)', emoji: '💰', color: 'bg-mintLt', border: 'border-jade/20' },
  { id: 'ration', title: 'राशन (Ration)', emoji: '🌾', color: 'bg-crimsonLt', border: 'border-crimson/20' },
  { id: 'welfare', title: 'योजनाएं (Welfare)', emoji: '⛺', color: 'bg-saffronLt', border: 'border-saffron/20' },
  { id: 'other', title: 'अन्य (Others)', emoji: '🚗', color: 'bg-cloud', border: 'border-slate/20' },
]

const POPULAR_SEARCHES = [
  { name: 'Income Certificate', id: 'income-certificate' },
  { name: 'Driving License', id: 'driving-licence' },
  { name: 'Ration Card', id: 'ration-card-new' },
  { name: 'Voter ID', id: 'voter-id-new' },
]

export default function GuideScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [guides, setGuides] = useState([])
  const [filteredGuides, setFilteredGuides] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    fetchGuides()
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const response = await api.get('/form-guide')
      setGuides(response.data)
      setFilteredGuides(response.data)
    } catch (err) {
      console.error('Error fetching guides:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter list locally when category changes (if not searching)
  useEffect(() => {
    if (!search.trim()) {
      if (selectedCategory === 'all') {
        setFilteredGuides(guides)
      } else {
        setFilteredGuides(guides.filter(g => g.category === selectedCategory))
      }
    }
  }, [selectedCategory, guides, search])

  // Debounced search querying
  const handleSearchChange = (text) => {
    setSearch(text)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!text.trim()) {
      setFilteredGuides(selectedCategory === 'all' ? guides : guides.filter(g => g.category === selectedCategory))
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/form-guide/search?q=${encodeURIComponent(text)}`)
        if (response.data && response.data.id) {
          setFilteredGuides([response.data])
        } else {
          setFilteredGuides([])
        }
      } catch (err) {
        console.error('Search error:', err)
        setFilteredGuides([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  const handleCategoryPress = (catId) => {
    setSelectedCategory(catId)
    setSearch('')
  }

  const renderGuideItem = (item, index) => {
    return (
      <Animated.View 
        key={item.id} 
        entering={FadeInDown.delay(index * 50)} 
        className="mb-3"
      >
        <Pressable 
          onPress={() => router.push(`/(app)/guide/${item.id}`)} 
          className="bg-white border border-cloud hover:border-jade rounded-2xl p-4 flex-row items-center justify-between shadow-sm active:scale-98"
        >
          <View className="flex-row items-center flex-1 pr-4">
            <View className="w-12 h-12 bg-mintLt rounded-xl items-center justify-center mr-4">
              <Text className="text-2xl">{item.categoryIcon || '📄'}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ink text-lg leading-tight">{item.nameHindi}</Text>
              <Text className="text-xs text-slate font-medium mt-0.5">{item.name}</Text>
            </View>
          </View>
          <Text className="text-mist text-xl font-bold">➔</Text>
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-3xl font-extrabold text-forest mb-1">Sarkari Form Guide</Text>
        <Text className="text-slate font-medium text-base">सरकारी काम गाइड — सही कागज़, सही दफ्तर</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Search */}
        <View className="bg-fog rounded-full flex-row items-center px-4 py-3 mb-6 border border-cloud shadow-sm relative">
          <Text className="text-xl mr-2">🔍</Text>
          <TextInput 
            className="flex-1 text-ink font-medium text-base p-0"
            placeholder={t('guide.search.placeholder') || "Kaun sa form banvana hai? (e.g. Caste)"}
            value={search}
            onChangeText={handleSearchChange}
          />
          {(searching || loading) && (
            <ActivityIndicator size="small" color="#1D9E75" className="absolute right-4" />
          )}
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#0F5C3A" />
            <Text className="text-slate font-medium mt-4">गाइड लोड हो रहे हैं...</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* If a category filter is active or search query is typed */}
            {(selectedCategory !== 'all' || search.trim() !== '') ? (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-extrabold text-lg text-ink">
                    {search.trim() ? 'खोज परिणाम (Search Results)' : `${CATEGORIES.find(c => c.id === selectedCategory)?.title || 'गाइड'} सूची`}
                  </Text>
                  <Pressable 
                    onPress={() => { setSelectedCategory('all'); setSearch('') }}
                    className="bg-mintLt px-3 py-1.5 rounded-full border border-jade/25"
                  >
                    <Text className="text-jade font-bold text-xs">Clear Filter ✕</Text>
                  </Pressable>
                </View>

                {filteredGuides.length === 0 ? (
                  <View className="text-center py-10 bg-fog rounded-2xl border border-cloud p-6 items-center space-y-2">
                    <Text className="text-3xl mb-2">🤷🏽</Text>
                    <Text className="font-bold text-forest text-base">कोई गाइड नहीं मिला</Text>
                    <Text className="text-xs text-slate text-center">कृपया कोई दूसरा नाम खोजें या श्रेणी बदलें।</Text>
                  </View>
                ) : (
                  filteredGuides.map((guide, idx) => renderGuideItem(guide, idx))
                )}
              </View>
            ) : (
              // Default View: Category Grid + Popular Searches + All Guides
              <View>
                {/* Categories Grid */}
                <Text className="font-bold text-lg text-ink mb-4">श्रेणियां (Categories)</Text>
                <View className="flex-row flex-wrap justify-between mb-6">
                  {CATEGORIES.map((cat, i) => (
                    <Animated.View key={cat.id} entering={FadeInDown.delay(i * 100)} className="w-[48%] mb-4">
                      <Pressable 
                        onPress={() => handleCategoryPress(cat.id)} 
                        className={`${cat.color} p-4 rounded-2xl border border-white ${cat.border} shadow-sm h-28 justify-between`}
                      >
                        <Text className="text-3xl">{cat.emoji}</Text>
                        <Text className="font-bold text-ink text-sm leading-tight">{cat.title}</Text>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>

                {/* Popular Searches */}
                <Text className="font-bold text-lg text-ink mb-4">जो लोग सबसे ज़्यादा ढूंढते हैं</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 space-x-3 -mx-6 px-6">
                  {POPULAR_SEARCHES.map((item, i) => (
                    <Pressable 
                      key={item.id} 
                      onPress={() => router.push(`/(app)/guide/${item.id}`)} 
                      className="bg-white border border-cloud rounded-full px-5 py-3 shadow-sm mr-2"
                    >
                      <Text className="font-bold text-forest text-sm">{item.name}</Text>
                    </Pressable>
                  ))}
                  <View className="w-6" />
                </ScrollView>

                {/* All Guides List */}
                <Text className="font-bold text-lg text-ink mb-4">सभी गाइड (All Guides)</Text>
                <View className="mb-10">
                  {guides.map((guide, idx) => renderGuideItem(guide, idx))}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
