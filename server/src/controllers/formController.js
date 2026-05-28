const Form = require('../models/Form')

// GET /api/forms - list all with optional ?state= and ?category= filters
exports.getForms = async (req, res) => {
  try {
    const { state, category } = req.query
    const query = {}
    if (state) query.state = state.toLowerCase()
    if (category) query.category = category.toLowerCase()

    const forms = await Form.find(query).sort({ title: 1 })
    res.json(forms)
  } catch (err) {
    console.error('getForms error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/forms/:slug - get single form detail
exports.getFormBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const form = await Form.findOne({ slug: slug.toLowerCase() })
    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }
    res.json(form)
  } catch (err) {
    console.error('getFormBySlug error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/forms - admin: add new form
exports.addForm = async (req, res) => {
  try {
    const {
      slug, title, state, category, description, steps,
      requiredDocuments, fees, processingTime, officeAddress, downloadUrl,
      nameHindi, categoryIcon, helpline, office
    } = req.body

    if (!slug || !title || !state || !category) {
      return res.status(400).json({ error: 'Slug, title, state, and category are required' })
    }

    const existingForm = await Form.findOne({ slug: slug.toLowerCase() })
    if (existingForm) {
      return res.status(400).json({ error: 'A form with this slug already exists' })
    }

    const newForm = new Form({
      slug: slug.toLowerCase(),
      title,
      state: state.toLowerCase(),
      category: category.toLowerCase(),
      description,
      steps: steps || [],
      requiredDocuments: requiredDocuments || [],
      fees: fees || '',
      processingTime: processingTime || '',
      officeAddress: officeAddress || '',
      downloadUrl: downloadUrl || '',
      nameHindi: nameHindi || title,
      categoryIcon: categoryIcon || '📄',
      helpline: helpline || '1800-180-1551',
      office: office || {
        type: officeAddress || '',
        typeHindi: officeAddress || '',
        counter: 'Counter 1',
        hours: '9:00 AM – 5:00 PM',
        onlineUrl: downloadUrl || '',
        onlineAvailable: !!downloadUrl
      }
    })

    await newForm.save()
    res.status(201).json({ message: 'Form created successfully', form: newForm })
  } catch (err) {
    console.error('addForm error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/forms/:slug - admin: update a form
exports.updateForm = async (req, res) => {
  try {
    const { slug } = req.params
    const form = await Form.findOne({ slug: slug.toLowerCase() })
    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }

    const fields = [
      'title', 'state', 'category', 'description', 'steps',
      'requiredDocuments', 'fees', 'processingTime', 'officeAddress', 'downloadUrl',
      'nameHindi', 'categoryIcon', 'helpline', 'office'
    ]

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'state' || field === 'category') {
          form[field] = req.body[field].toLowerCase()
        } else {
          form[field] = req.body[field]
        }
      }
    })

    // Keep sub-object 'office' in sync with flat address details if needed
    if (req.body.officeAddress !== undefined && !req.body.office) {
      form.office = {
        ...form.office,
        type: req.body.officeAddress,
        typeHindi: req.body.officeAddress
      }
    }
    if (req.body.downloadUrl !== undefined && !req.body.office) {
      form.office = {
        ...form.office,
        onlineUrl: req.body.downloadUrl,
        onlineAvailable: !!req.body.downloadUrl
      }
    }

    await form.save()
    res.json({ message: 'Form updated successfully', form })
  } catch (err) {
    console.error('updateForm error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
