const formData = require('../data/formData')
const Correction = require('../models/Correction')
const { awardPoints } = require('../utils/points')
const Anthropic = require('@anthropic-ai/sdk')

let anthropic
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// GET /api/form-guide
exports.getFormGuides = (req, res) => {
  try {
    const list = formData.map(e => ({
      id: e.id,
      name: e.name,
      nameHindi: e.nameHindi,
      category: e.category,
      categoryIcon: e.categoryIcon
    }))
    res.json(list)
  } catch (err) {
    console.error('getFormGuides error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/form-guide/:id
exports.getFormGuideById = (req, res) => {
  try {
    const entry = formData.find(e => e.id === req.params.id)
    if (!entry) {
      return res.status(404).json({ error: 'Guide not found' })
    }
    res.json(entry)
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

    // 1. Local basic search first (substring match)
    const localMatch = formData.find(e => 
      e.name.toLowerCase().includes(query) || 
      e.nameHindi.includes(query) || 
      e.id.toLowerCase().includes(query)
    )

    if (localMatch) {
      return res.json(localMatch)
    }

    // 2. AI-powered search fallback
    if (!anthropic) {
      // If Anthropic API key is not configured, fall back to first entry or a generic error
      console.warn('Anthropic API key is missing. Falling back to default matching.')
      return res.json(formData[0])
    }

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // updated model name for safety
        max_tokens: 50,
        system: `You match user queries to government document types.
Valid IDs: ${formData.map(e => e.id).join(', ')}.
Reply with ONLY the matching ID. No explanation. No apology.
If unclear, pick the closest match.`,
        messages: [{ role: 'user', content: query }]
      })

      const matchedId = response.content[0].text.trim().toLowerCase()
      const matchedEntry = formData.find(e => e.id === matchedId)

      if (matchedEntry) {
        return res.json(matchedEntry)
      } else {
        // Fallback if Claude returns something invalid
        return res.json(formData[0])
      }
    } catch (aiErr) {
      console.error('Anthropic API error during search:', aiErr)
      return res.json(formData[0]) // Fallback to first
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

    // Verify entry exists
    const entry = formData.find(e => e.id === entryId)
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
