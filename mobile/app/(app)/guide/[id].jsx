import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Pressable, ScrollView, Linking, Platform, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import * as WebBrowser from 'expo-web-browser'
import { AuthContext } from '../../../context/AuthContext'
import api from '../../../services/api'

let MapView;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
  } catch (e) {
    console.warn('Failed to load react-native-maps:', e);
  }
}

const handleOpenURL = async (url) => {
  try {
    // Open directly in the external system browser (Chrome/Safari) to ensure compatibility and bypass in-app browser restrictions on government portals
    await Linking.openURL(url);
  } catch (error) {
    console.warn('Failed to open URL with Linking, falling back to WebBrowser:', error);
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (browserError) {
      console.error('Failed to open URL with WebBrowser:', browserError);
    }
  }
};

function AnimatedCheckbox({ isChecked, onPress }) {
  return (
    <Pressable onPress={onPress} className="mr-4">
      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isChecked ? 'bg-jade border-jade' : 'bg-white border-cloud'}`}>
        {isChecked && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>
    </Pressable>
  )
}

export default function GuideDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { user, updateUserProfile } = useContext(AuthContext)
  
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Docs, 2: Office, 3: Tips, 4: Share
  const [checkedDocs, setCheckedDocs] = useState({})

  // Correction Flagging Modal state
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [flagField, setFlagField] = useState('documents') // documents, office, fees, tips
  const [flagCorrection, setFlagCorrection] = useState('')
  const [flagLoading, setFlagLoading] = useState(false)
  const [flagSuccess, setFlagSuccess] = useState('')

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(`/form-guide/${id}`)
        setEntry(response.data)
        setCheckedDocs({})
      } catch (err) {
        console.error('Error fetching form guide detail:', err)
        setError('गाइड डेटा लोड करने में समस्या हुई।')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchEntry()
    }
  }, [id])

  const toggleDoc = (name) => setCheckedDocs(prev => ({ ...prev, [name]: !prev[name] }))
  
  const docCount = entry?.documents?.length || 0
  const progress = Object.values(checkedDocs).filter(Boolean).length

  const handleFlagSubmit = async () => {
    if (!flagCorrection.trim()) return

    setFlagLoading(true)
    setFlagSuccess('')

    try {
      const response = await api.post('/form-guide/flag', {
        entryId: entry.id,
        field: flagField,
        correction: flagCorrection
      })
      
      setFlagSuccess('शुक्रिया! आपकी सुधार रिपोर्ट दर्ज हो गई है और आपको 15 points मिल गए हैं! 🙌')
      setFlagCorrection('')
      
      // Update points in auth context
      if (response.data.pointResult && response.data.pointResult.points !== undefined) {
        updateUserProfile({ points: response.data.pointResult.points })
      }
      
      setTimeout(() => {
        setIsFlagOpen(false)
        setFlagSuccess('')
      }, 3000)
    } catch (err) {
      console.error(err)
      setFlagSuccess('Error: Submitting correction failed.')
    } finally {
      setFlagLoading(false)
    }
  }

  const FIELDS = [
    { key: 'documents', label: 'दस्तावेज़ (Documents)' },
    { key: 'office', label: 'कार्यालय (Office)' },
    { key: 'fees', label: 'सरकारी फीस (Fees)' },
    { key: 'tips', label: 'सलाह/समय (Tips/Time)' }
  ]

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0F5C3A" />
        <Text className="text-slate font-medium mt-4">विवरण लोड हो रहा है...</Text>
      </SafeAreaView>
    )
  }

  if (error || !entry) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-crimson font-bold text-lg mb-4 text-center">{error || 'गाइड नहीं मिला'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-forest px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">पीछे जाएँ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-cloud bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={() => { step > 1 ? setStep(step - 1) : router.back() }} className="mr-4">
          <Text className="text-2xl text-slate">{step > 1 ? '←' : '✕'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-forest flex-1">{entry.nameHindi}</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-fog p-2">
        {['Docs', 'Office', 'Tips', 'Share'].map((label, idx) => {
          const s = idx + 1
          return (
            <TouchableOpacity 
              key={s} 
              onPress={() => setStep(s)} 
              className={`flex-1 py-2 rounded-lg items-center ${step === s ? 'bg-white' : ''}`}
              style={step === s ? {
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
              } : null}
            >
              <Text className={`font-bold text-xs ${step === s ? 'text-jade' : 'text-slate'}`}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView className="flex-1 bg-fog" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {step === 1 && (
          <View>
            <Text className="text-2xl font-extrabold text-ink mb-6">ज़रूरी कागज़ात (Documents)</Text>
            <View className="bg-white p-4 rounded-xl shadow-sm border border-cloud mb-8">
              {entry.documents.map((doc, idx) => (
                <View key={idx} className={`flex-row items-center py-4 ${idx !== entry.documents.length - 1 ? 'border-b border-cloud' : ''}`}>
                  <AnimatedCheckbox isChecked={checkedDocs[doc.name]} onPress={() => toggleDoc(doc.name)} />
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${checkedDocs[doc.name] ? 'text-mist line-through' : 'text-ink'}`}>{doc.nameHindi}</Text>
                    <Text className={`text-xs ${checkedDocs[doc.name] ? 'text-cloud' : 'text-slate'}`}>{doc.name}</Text>
                    {doc.note && (
                      <Text className="text-xs text-saffron font-bold mt-1">⚠️ {doc.note}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
            
            {docCount > 0 && (
              <View>
                <Text className="text-center font-bold text-slate mb-2">Progress: {progress} / {docCount} ready</Text>
                <View className="h-2 bg-cloud rounded-full overflow-hidden">
                  <View className="h-full bg-jade" style={{ width: `${(progress / docCount) * 100}%` }} />
                </View>
              </View>
            )}
            
            <TouchableOpacity onPress={() => setStep(2)} className="mt-8 bg-jade py-4 rounded-xl items-center shadow-md">
              <Text className="text-white font-bold text-lg">Next: Office</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-2xl font-extrabold text-ink mb-6">कहाँ जाना है? (Office)</Text>
            
            <View className="bg-white rounded-2xl shadow-sm border border-cloud overflow-hidden mb-6">
              {Platform.OS !== 'web' && MapView ? (
                <MapView style={{ height: 140 }} initialRegion={{ latitude: 30.901, longitude: 75.857, latitudeDelta: 0.02, longitudeDelta: 0.02 }} scrollEnabled={false} />
              ) : (
                <View style={{ height: 140, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
                  <Text className="text-slate font-medium">Map directions available below</Text>
                </View>
              )}
              <View className="p-4">
                <Text className="font-bold text-xl text-ink mb-1">{entry.office?.typeHindi}</Text>
                <Text className="text-slate font-semibold mb-3">{entry.office?.type}</Text>
                
                <View className="flex-row items-center mb-1">
                  <Text className="w-16 text-slate font-bold">Counter:</Text>
                  <Text className="text-ink font-semibold">{entry.office?.counter || 'N/A'}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <Text className="w-16 text-slate font-bold">Timing:</Text>
                  <Text className="text-ink font-medium">{entry.office?.hours || 'N/A'}</Text>
                </View>
 
                <TouchableOpacity 
                  onPress={async () => {
                    const query = `${entry.office?.type} ${user?.pincode || ''} ${user?.state || ''}`;
                    try {
                      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
                    } catch (error) {
                      console.error('Failed to open Maps URL:', error);
                    }
                  }}
                  className="bg-forest py-3 rounded-lg items-center mt-4"
                >
                  <Text className="text-white font-bold">दिशा देखें (Google Maps)</Text>
                </TouchableOpacity>
              </View>
            </View>
 
            {entry.office?.onlineAvailable && entry.office?.onlineUrl && (
              <View className="bg-mintLt border border-jade rounded-xl p-4 items-center shadow-sm">
                <Text className="text-jade font-bold mb-2">You can also apply online!</Text>
                <TouchableOpacity 
                  onPress={() => handleOpenURL(entry.office.onlineUrl)}
                  className="bg-jade px-6 py-2 rounded-full"
                >
                  <Text className="text-white font-bold">Online Apply करें</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-2xl font-extrabold text-ink mb-6">खास बातें (Tips)</Text>
            
            <View className="flex-row justify-between mb-6">
              <View className="bg-white border border-cloud p-4 rounded-xl flex-1 mr-2 items-center shadow-sm justify-center">
                <Text className="text-xs font-bold text-slate uppercase mb-1">Fees</Text>
                <Text className="text-sm font-extrabold text-forest text-center leading-snug">{entry.fees}</Text>
              </View>
              <View className="bg-white border border-cloud p-4 rounded-xl flex-1 ml-2 items-center shadow-sm justify-center">
                <Text className="text-xs font-bold text-slate uppercase mb-1">Time</Text>
                <Text className="text-sm font-extrabold text-forest text-center leading-snug">{entry.processingDays}</Text>
              </View>
            </View>

            {entry.tips && entry.tips.length > 0 && (
              <View className="bg-saffronLt border border-saffron rounded-xl p-4 mb-6">
                {entry.tips.map((tip, idx) => (
                  <View key={idx} className={`flex-row items-start ${idx > 0 ? 'mt-3' : ''}`}>
                    <Text className="text-xl mr-2">⚠️</Text>
                    <Text className="flex-1 font-medium text-ink leading-5">{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {entry.helpline && (
              <View className="bg-white border border-cloud rounded-xl p-4 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center flex-1 pr-4">
                  <Text className="text-3xl mr-3">📞</Text>
                  <View>
                    <Text className="font-bold text-slate text-xs">Helpline Number</Text>
                    <Text className="font-bold text-lg text-ink">{entry.helpline}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      await Linking.openURL(`tel:${entry.helpline}`);
                    } catch (error) {
                      console.error('Failed to initiate phone call:', error);
                    }
                  }}
                  className="bg-crimsonLt border border-crimson/25 px-4 py-2 rounded-lg"
                >
                  <Text className="text-crimson font-bold text-xs uppercase">Call</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {step === 4 && (
          <View>
            <View className="items-center justify-center pt-8">
              <Text className="text-8xl mb-6">💬</Text>
              <Text className="text-2xl font-extrabold text-ink mb-2">Share this guide</Text>
              <Text className="text-slate font-medium text-center mb-8 px-4">Help your friends and family get their government work done easily.</Text>
              
              <TouchableOpacity 
                onPress={async () => {
                  const msg = `JanSoochna se mila guide 📋\n\n` +
                    `*${entry.nameHindi}* ke liye ye documents chahiye:\n` +
                    entry.documents.map(d => `• ${d.nameHindi} (${d.note || 'Original'})`).join('\n') +
                    `\n\nOffice: ${entry.office?.type}\n` +
                    `Samay: ${entry.office?.hours}\n` +
                    `Fees: ${entry.fees}\n\n` +
                    `App download: https://jansoochna.in`

                  try {
                    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`);
                  } catch (error) {
                    console.warn('Failed to open native WhatsApp, trying WhatsApp API web link:', error);
                    try {
                      await handleOpenURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`);
                    } catch (webError) {
                      console.error('Failed to open WhatsApp web link:', webError);
                    }
                  }
                }}
                className="bg-[#25D366] w-full py-4 rounded-xl flex-row justify-center items-center shadow-md mb-6"
              >
                <Text className="text-white font-bold text-xl">{t('guide.share.whatsapp') || 'WhatsApp पर साझा करें'}</Text>
              </TouchableOpacity>

              <Pressable onPress={() => setIsFlagOpen(true)}>
                <Text className="text-crimson font-bold text-sm underline mt-2">Flag outdated info</Text>
              </Pressable>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Flag Outdated Modal */}
      <Modal
        visible={isFlagOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFlagOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/60 justify-center items-center p-6"
          onPress={() => setIsFlagOpen(false)}
        >
          <Pressable 
            className="bg-white rounded-3xl w-full p-6 border border-cloud shadow-xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-extrabold text-lg text-crimson">Report Incorrect Guide</Text>
              <TouchableOpacity 
                onPress={() => setIsFlagOpen(false)}
                className="w-8 h-8 rounded-full bg-fog items-center justify-center border border-cloud"
              >
                <Text className="text-slate font-bold text-sm">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate mb-4 font-semibold leading-relaxed">
              Is checklist mein koi galati hai? Report likh kar 15 points kamayein!
            </Text>

            {flagSuccess ? (
              <View className="bg-mintLt border border-jade/30 rounded-2xl p-4 my-2">
                <Text className="text-jade font-extrabold text-sm text-center leading-normal">
                  {flagSuccess}
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {/* Field Selection */}
                <View>
                  <Text className="text-slate font-bold text-xs uppercase mb-2">Field (कौन सा डाटा गलत है?)</Text>
                  <View className="flex-row flex-wrap">
                    {FIELDS.map(f => (
                      <TouchableOpacity 
                        key={f.key}
                        onPress={() => setFlagField(f.key)}
                        className={`px-3 py-2 rounded-xl border mr-2 mb-2 ${flagField === f.key ? 'bg-mintLt border-jade' : 'bg-fog border-cloud'}`}
                      >
                        <Text className={`text-xs font-bold ${flagField === f.key ? 'text-jade' : 'text-slate'}`}>{f.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Correction Input */}
                <View className="mt-2">
                  <Text className="text-slate font-bold text-xs uppercase mb-2">Correct Information</Text>
                  <TextInput
                    className="w-full bg-fog border border-cloud rounded-xl p-3 text-sm text-ink font-semibold"
                    placeholder="Sahi details yahan likhein..."
                    value={flagCorrection}
                    onChangeText={setFlagCorrection}
                    multiline={true}
                    numberOfLines={4}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleFlagSubmit}
                  disabled={flagLoading || !flagCorrection.trim()}
                  className={`w-full py-4 rounded-xl items-center shadow-md mt-4 ${
                    flagLoading || !flagCorrection.trim() ? 'bg-mist' : 'bg-crimson'
                  }`}
                >
                  {flagLoading ? (
                    <ActivityIndicator size="small" color="#white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Submit Report (+15 pts)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  )
}
