const netaData = require('../data/netaData')

// GET /api/neta?pincode=
exports.getNetaByPincode = (req, res) => {
  try {
    const { pincode } = req.query
    if (!pincode) {
      return res.status(400).json({ error: 'Pincode is required' })
    }

    // Find neta that manages this pincode
    const neta = netaData.find(n => n.pincodes.includes(pincode))

    if (!neta) {
      // Return a default sample or empty so app doesn't crash, but can fallback to first one in ward-42
      return res.json(netaData[0])
    }

    res.json(neta)
  } catch (err) {
    console.error('getNetaByPincode error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/neta/:id
exports.getNetaById = (req, res) => {
  try {
    const neta = netaData.find(n => n.id === req.params.id)
    if (!neta) {
      return res.status(404).json({ error: 'Politician not found' })
    }
    res.json(neta)
  } catch (err) {
    console.error('getNetaById error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
