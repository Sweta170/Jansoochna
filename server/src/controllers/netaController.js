const Neta = require('../models/Neta')

// Helper function to map dynamic database schema to expected nested client response structure
function formatNetaResponse(neta) {
  if (!neta) return null
  return {
    _id: neta._id,
    id: neta._id.toString(),
    name: neta.name,
    designation: 'Ward Councillor',
    ward: neta.constituency,
    party: neta.party,
    pincodes: neta.pincodes,
    attendance: {
      meetings: 100, // normalized scale
      attended: neta.attendancePercent
    },
    funds: {
      allocated: neta.allocatedFunds,
      spent: neta.spentFunds,
      projects: [] // default empty projects array
    },
    promises: (neta.promises || []).map(p => ({
      text: p.title,
      status: p.status,
      year: 2022
    })),
    contact: neta.contact || { phone: '', office: '' },
    photoUrl: neta.photoUrl || ''
  }
}

// GET /api/neta?pincode=
exports.getNetaByPincode = async (req, res) => {
  try {
    const { pincode } = req.query
    if (!pincode) {
      return res.status(400).json({ error: 'Pincode is required' })
    }

    // Find politician managing this pincode
    let neta = await Neta.findOne({ pincodes: pincode })

    if (!neta) {
      // Fallback to the first politician in the collection so the app UI does not crash
      neta = await Neta.findOne()
      if (!neta) {
        return res.status(404).json({ error: 'No politicians found in the database.' })
      }
    }

    res.json(formatNetaResponse(neta))
  } catch (err) {
    console.error('getNetaByPincode error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/neta/:id
exports.getNetaById = async (req, res) => {
  try {
    const neta = await Neta.findById(req.params.id)
    if (!neta) {
      return res.status(404).json({ error: 'Politician not found' })
    }
    res.json(formatNetaResponse(neta))
  } catch (err) {
    console.error('getNetaById error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/netas/:id — Admin endpoint to update details
exports.updateNeta = async (req, res) => {
  try {
    const { attendancePercent, allocatedFunds, spentFunds, promises, name, constituency, pincodes, party, photoUrl, contact } = req.body
    
    const neta = await Neta.findById(req.params.id)
    if (!neta) {
      return res.status(404).json({ error: 'Politician not found' })
    }

    // Apply updates if defined
    if (attendancePercent !== undefined) neta.attendancePercent = attendancePercent
    if (allocatedFunds !== undefined) neta.allocatedFunds = allocatedFunds
    if (spentFunds !== undefined) neta.spentFunds = spentFunds
    if (name !== undefined) neta.name = name
    if (constituency !== undefined) neta.constituency = constituency
    if (pincodes !== undefined) neta.pincodes = pincodes
    if (party !== undefined) neta.party = party
    if (photoUrl !== undefined) neta.photoUrl = photoUrl
    
    if (promises !== undefined && Array.isArray(promises)) {
      neta.promises = promises.map(p => ({
        title: p.title || p.text,
        status: p.status || 'notdone'
      }))
    }

    if (contact !== undefined && contact !== null) {
      neta.contact = {
        phone: contact.phone !== undefined ? contact.phone : neta.contact?.phone,
        office: contact.office !== undefined ? contact.office : neta.contact?.office
      }
    }

    await neta.save()
    res.json({ 
      message: 'Politician updated successfully', 
      neta: formatNetaResponse(neta) 
    })
  } catch (err) {
    console.error('updateNeta error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

