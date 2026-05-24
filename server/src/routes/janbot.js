const express = require('express')
const Anthropic = require('@anthropic-ai/sdk')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { janbotLimiter } = require('../middleware/rateLimit')
const formData = require('../data/formData')
const Issue = require('../models/Issue')

let client
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const SYSTEM_PROMPT = `You are JanBot, a warm civic assistant for Indian citizens using JanSoochna.
You help with: government forms, civic issues, bill queries, local government info.
Language: always reply in the same language the user writes in — Hindi, Hinglish, English, or Punjabi.
Tone: warm, direct, simple. Address users as "aap". Max 3 sentences per reply unless listing documents.
When unsure about specific local details, say: "Apne ward councillor se confirm kar lein."
You support multiple Indian states: Punjab, Bihar, and central/all-India schemes.
You have tools to look up form guides and search nearby issues.`

const TOOLS = [
  {
    name: 'get_form_guide',
    description: 'Get document checklist and office details for a government certificate or form',
    input_schema: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: `One of: ${formData.map(e => e.id).join(', ')}`
        },
        state: {
          type: 'string',
          description: 'Indian state name (punjab, bihar, all). Defaults to all.',
          enum: ['punjab', 'bihar', 'all']
        }
      },
      required: ['document_id']
    }
  },
  {
    name: 'search_nearby_issues',
    description: 'Find civic issues reported near a pincode',
    input_schema: {
      type: 'object',
      properties: {
        pincode: { type: 'string' },
        category: { type: 'string', enum: ['road', 'water', 'electricity', 'garbage', 'drainage', 'parks', 'streetlight', 'other', 'all'] }
      },
      required: ['pincode']
    }
  }
]

// Smart local chatbot for when no Anthropic API key is set
function getSmartMockResponse(userMessage, state) {
  const msg = userMessage.toLowerCase()
  
  // Detect state from message
  let detectedState = state || 'all'
  if (msg.includes('bihar') || msg.includes('बिहार') || msg.includes('patna') || msg.includes('पटना')) {
    detectedState = 'bihar'
  } else if (msg.includes('punjab') || msg.includes('पंजाब') || msg.includes('ludhiana') || msg.includes('लुधियाना')) {
    detectedState = 'punjab'
  }
  
  // Match against form data
  const keywords = {
    'caste': ['caste', 'जाति', 'jati', 'jaati'],
    'income': ['income', 'आय', 'aay', 'salary'],
    'domicile': ['domicile', 'निवास', 'residence', 'niwas', 'residential'],
    'birth': ['birth', 'जन्म', 'janam', 'born'],
    'death': ['death', 'मृत्यु', 'mrityu'],
    'ration': ['ration', 'राशन', 'rashan'],
    'voter': ['voter', 'वोटर', 'vote', 'election'],
    'driving': ['driving', 'licence', 'license', 'ड्राइविंग', 'लाइसेंस'],
    'aadhaar': ['aadhaar', 'aadhar', 'आधार'],
    'marriage': ['marriage', 'शादी', 'विवाह', 'shaadi'],
    'awas': ['awas', 'आवास', 'pmay', 'house', 'ghar', 'घर']
  }
  
  let matchedForm = null
  for (const [key, terms] of Object.entries(keywords)) {
    if (terms.some(term => msg.includes(term))) {
      // Find form matching both keyword and state
      matchedForm = formData.find(f => {
        const nameMatch = f.id.includes(key) || f.name.toLowerCase().includes(key)
        const stateMatch = f.state === detectedState || f.state === 'all'
        return nameMatch && stateMatch
      })
      if (matchedForm) break
    }
  }
  
  if (matchedForm) {
    const docs = matchedForm.documents.map(d => `📎 ${d.nameHindi} (${d.name})`).join('\n')
    const tip = matchedForm.tips[0] || ''
    const stateLabel = matchedForm.state === 'all' ? 'पूरे भारत' : matchedForm.state === 'bihar' ? 'बिहार' : 'पंजाब'
    
    return `🙏 ${matchedForm.nameHindi} के लिए जानकारी (${stateLabel}):\n\n` +
      `📋 ज़रूरी कागज़ात:\n${docs}\n\n` +
      `🏢 कार्यालय: ${matchedForm.office.typeHindi}\n` +
      `⏰ समय: ${matchedForm.office.hours}\n` +
      `💰 शुल्क: ${matchedForm.fees}\n` +
      `📅 समय: ${matchedForm.processingDays}\n` +
      `🌐 ऑनलाइन: ${matchedForm.office.onlineUrl}\n\n` +
      `💡 टिप: ${tip}\n\n` +
      `📞 Helpline: ${matchedForm.helpline}`
  }
  
  // Greetings
  if (msg.match(/^(hi|hello|namaste|namaskar|नमस्ते|नमस्कार|helo|hey)/)) {
    return '🙏 नमस्ते! मैं JanBot हूँ — आपका नागरिक सहायक।\n\nमुझसे पूछ सकते हैं:\n📄 जाति/आय/निवास प्रमाण पत्र कैसे बनाएं\n👶 जन्म/मृत्यु प्रमाण पत्र\n🌾 राशन कार्ड\n🗳️ वोटर ID\n🚗 ड्राइविंग लाइसेंस\n\nबस अपना सवाल टाइप करें! 😊'
  }
  
  // Help/what can you do
  if (msg.match(/(help|मदद|kya kar|क्या कर|what can|madad)/)) {
    return '🤖 मैं इन चीज़ों में मदद कर सकता हूँ:\n\n1️⃣ सरकारी फॉर्म और प्रमाण पत्र की जानकारी\n2️⃣ ज़रूरी कागज़ात की सूची\n3️⃣ कार्यालय का पता और समय\n4️⃣ ऑनलाइन आवेदन लिंक\n5️⃣ फीस और प्रोसेसिंग टाइम\n\n🏛️ मैं Punjab और Bihar दोनों राज्यों की जानकारी दे सकता हूँ!\n\nउदाहरण: "जाति प्रमाण पत्र कैसे बनेगा?" या "Bihar income certificate"'
  }
  
  // Thank you
  if (msg.match(/(thank|धन्यवाद|shukriya|शुक्रिया)/)) {
    return '😊 आपका स्वागत है! कोई और सवाल हो तो बेझिझक पूछें। JanBot हमेशा आपकी सेवा में है! 🙏'
  }
  
  // State-specific general info
  if (msg.includes('bihar') || msg.includes('बिहार')) {
    return '🏛️ बिहार में सरकारी सेवाओं के लिए RTPS (Right to Public Services) पोर्टल उपलब्ध है।\n\n' +
      '🌐 Website: serviceonline.bihar.gov.in\n' +
      '📞 Helpline: 1800-345-6188\n\n' +
      'बिहार में उपलब्ध सेवाएं:\n' +
      '📄 जाति प्रमाण पत्र\n💰 आय प्रमाण पत्र\n🏠 निवास प्रमाण पत्र\n👶 जन्म प्रमाण पत्र\n🌾 राशन कार्ड\n\n' +
      'किस सेवा की जानकारी चाहिए? बस पूछें! 😊'
  }
  
  if (msg.includes('punjab') || msg.includes('पंजाब')) {
    return '🏛️ पंजाब में सरकारी सेवाओं के लिए eSewa Punjab पोर्टल उपलब्ध है।\n\n' +
      '🌐 Website: esewa.punjab.gov.in\n' +
      '📞 Helpline: 1800-180-1551\n\n' +
      'पंजाब में उपलब्ध सेवाएं:\n' +
      '📄 जाति प्रमाण पत्र\n💰 आय प्रमाण पत्र\n🏠 निवास प्रमाण पत्र\n👶 जन्म प्रमाण पत्र\n🌾 राशन कार्ड\n\n' +
      'किस सेवा की जानकारी चाहिए? बस पूछें! 😊'
  }
  
  // Default response
  const allForms = formData.map(f => `${f.categoryIcon} ${f.nameHindi}`).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8)
  return `🤖 मुझे आपका सवाल समझ नहीं आया। कृपया इनमें से किसी एक के बारे में पूछें:\n\n${allForms.join('\n')}\n\nउदाहरण: "Income certificate Bihar" या "जाति प्रमाण पत्र कैसे बनेगा?" 😊`
}

router.post('/', authMiddleware, janbotLimiter, async (req, res) => {
  try {
    const { messages, pincode, state } = req.body

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Get the latest user message
    const lastUserMsg = messages && messages.length > 0 
      ? messages[messages.length - 1].content 
      : ''

    // If client is not initialized, use smart mock
    if (!client) {
      const mockText = getSmartMockResponse(lastUserMsg, state)
      
      const words = mockText.split(' ')
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`)
        await new Promise(r => setTimeout(r, 50))
      }
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }

    // Set up message chain
    let currentMessages = messages || []
    
    // Ensure all user messages are properly formatted
    currentMessages = currentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    let maxLoops = 5
    let loopCount = 0

    while (loopCount < maxLoops) {
      loopCount++

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT + `\nUser's pincode: ${pincode || req.user.pincode}\nUser's state: ${state || 'unknown'}`,
        tools: TOOLS,
        messages: currentMessages,
        stream: false
      })

      if (response.stop_reason === 'tool_use') {
        const toolResults = []
        const assistantContent = []

        for (const block of response.content) {
          assistantContent.push(block)
          if (block.type === 'tool_use') {
            let result = ''
            try {
              if (block.name === 'get_form_guide') {
                const targetState = block.input.state || state || 'all'
                const entry = formData.find(e => {
                  const idMatch = e.id === block.input.document_id
                  const stateMatch = e.state === targetState || e.state === 'all'
                  return idMatch && stateMatch
                }) || formData.find(e => e.id === block.input.document_id)
                
                result = entry 
                  ? JSON.stringify({
                      nameHindi: entry.nameHindi,
                      state: entry.state,
                      documents: entry.documents.map(d => d.nameHindi),
                      office: entry.office.typeHindi,
                      fees: entry.fees,
                      days: entry.processingDays,
                      onlineUrl: entry.office.onlineUrl,
                      helpline: entry.helpline
                    }) 
                  : 'Form guide entry not found for this state. Try asking about a different state or document.'
              } else if (block.name === 'search_nearby_issues') {
                const searchPin = block.input.pincode || pincode || req.user.pincode
                const query = { 'location.pincode': searchPin }
                if (block.input.category && block.input.category !== 'all') {
                  query.category = block.input.category
                }
                const issues = await Issue.find(query).limit(5).sort({ voteCount: -1 })
                result = JSON.stringify(issues.map(i => ({
                  title: i.title,
                  category: i.category,
                  votes: i.voteCount,
                  status: i.status
                })))
              }
            } catch (err) {
              result = `Error executing tool: ${err.message}`
            }

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result
            })
          }
        }

        currentMessages.push({
          role: 'assistant',
          content: assistantContent
        })
        currentMessages.push({
          role: 'user',
          content: toolResults
        })
      } else {
        // Final text response — stream it!
        const stream = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\nUser's pincode: ${pincode || req.user.pincode}\nUser's state: ${state || 'unknown'}`,
          messages: currentMessages,
          stream: true
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
          }
        }
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
    }

    // Safeguard for too many loops
    res.write(`data: ${JSON.stringify({ text: 'Maaf kijiye, tool process karne mein dikkat aayi.' })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()

  } catch (err) {
    console.error('JanBot route error:', err)
    res.write(`data: ${JSON.stringify({ error: 'Server details retrieval error.' })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

module.exports = router
