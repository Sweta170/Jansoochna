const Form = require('../models/Form')
const Correction = require('../models/Correction')
const { awardPoints } = require('../utils/points')
const Anthropic = require('@anthropic-ai/sdk')

let anthropic
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// Helper to format Mongoose form document into the exact structure the legacy frontend expects
function formatLegacyForm(form) {
  if (!form) return null
  return {
    id: form.slug,
    name: form.title,
    nameHindi: form.nameHindi || form.title,
    state: form.state,
    category: form.category,
    categoryIcon: form.categoryIcon || '📄',
    documents: (form.requiredDocuments || []).map(d => ({
      name: d.name,
      nameHindi: d.nameHindi,
      note: d.note || ''
    })),
    office: form.office || {
      type: form.officeAddress || '',
      typeHindi: form.officeAddress || '',
      counter: 'Counter 1',
      hours: '9:00 AM – 5:00 PM',
      onlineUrl: form.downloadUrl || '',
      onlineAvailable: !!form.downloadUrl
    },
    fees: form.fees || '₹0',
    processingDays: form.processingTime || '7 दिन',
    helpline: form.helpline || '1800-180-1551',
    tips: form.steps || []
  }
}

// GET /api/form-guide
exports.getFormGuides = async (req, res) => {
  try {
    const forms = await Form.find().sort({ title: 1 })
    const list = forms.map(form => ({
      id: form.slug,
      name: form.title,
      nameHindi: form.nameHindi || form.title,
      category: form.category,
      categoryIcon: form.categoryIcon || '📄'
    }))
    res.json(list)
  } catch (err) {
    console.error('getFormGuides error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/form-guide/:id
exports.getFormGuideById = async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.id.toLowerCase() })
    if (!form) {
      return res.status(404).json({ error: 'Guide not found' })
    }
    res.json(formatLegacyForm(form))
  } catch (err) {
    console.error('getFormGuideById error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/form-guide/search?q=
exports.searchFormGuides = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Query parameter q is required' })
    }

    const query = q.trim().toLowerCase()

    // 1. Local basic search first (regex substring match on Mongoose)
    const localMatch = await Form.findOne({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { nameHindi: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } }
      ]
    })

    if (localMatch) {
      return res.json(formatLegacyForm(localMatch))
    }

    // 2. AI-powered search fallback
    if (!anthropic) {
      console.warn('Anthropic API key is missing. Falling back to default matching.')
      const fallbackForm = await Form.findOne()
      if (!fallbackForm) {
        return res.status(404).json({ error: 'No guides available' })
      }
      return res.json(formatLegacyForm(fallbackForm))
    }

    try {
      const allForms = await Form.find().select('slug')
      const validSlugs = allForms.map(f => f.slug)

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        system: `You match user queries to government document types.
Valid IDs: ${validSlugs.join(', ')}.
Reply with ONLY the matching ID. No explanation. No apology.
If unclear, pick the closest match.`,
        messages: [{ role: 'user', content: query }]
      })

      const matchedId = response.content[0].text.trim().toLowerCase()
      const matchedEntry = await Form.findOne({ slug: matchedId })

      if (matchedEntry) {
        return res.json(formatLegacyForm(matchedEntry))
      } else {
        const fallbackForm = await Form.findOne()
        return res.json(formatLegacyForm(fallbackForm))
      }
    } catch (aiErr) {
      console.error('Anthropic API error during search:', aiErr)
      const fallbackForm = await Form.findOne()
      return res.json(formatLegacyForm(fallbackForm))
    }
  } catch (err) {
    console.error('searchFormGuides error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/form-guide/flag
exports.flagCorrection = async (req, res) => {
  try {
    const { entryId, field, correction } = req.body

    if (!entryId || !field || !correction) {
      return res.status(400).json({ error: 'EntryId, field, and correction are required' })
    }

    // Verify entry exists in DB
    const entry = await Form.findOne({ slug: entryId.toLowerCase() })
    if (!entry) {
      return res.status(400).json({ error: 'Invalid entryId' })
    }

    const newCorrection = new Correction({
      entryId,
      field,
      correction,
      submittedBy: req.user.id,
      verified: false
    })

    await newCorrection.save()

    // Award 15 points
    const pointResult = await awardPoints(req.user.id, 'CORRECTION_SUBMITTED')

    res.status(201).json({
      message: 'Correction submitted. Thank you for making JanSoochna better!',
      pointResult
    })
  } catch (err) {
    console.error('flagCorrection error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

