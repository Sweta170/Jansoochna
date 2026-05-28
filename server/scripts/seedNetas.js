const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Neta = require('../src/models/Neta')
const netaData = require('../src/data/netaData')

async function seed() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in environment variables.')
    process.exit(1)
  }

  console.log('🔌 Connecting to MongoDB...')
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB!')
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message)
    process.exit(1)
  }

  try {
    console.log('🧹 Clearing existing politicians (netas) collection...')
    await Neta.deleteMany({})

    console.log(`📦 Mapping and importing ${netaData.length} politician profiles...`)
    const mappedNetas = netaData.map(item => {
      // Calculate attendance percent
      const attended = item.attendance?.attended || 0
      const meetings = item.attendance?.meetings || 1
      const attendancePercent = Math.round((attended / meetings) * 100)

      return {
        name:              item.name,
        constituency:      item.ward || 'General',
        pincodes:          item.pincodes || [],
        party:             item.party || 'IND',
        attendancePercent: attendancePercent,
        allocatedFunds:    item.funds?.allocated || 0,
        spentFunds:        item.funds?.spent || 0,
        promises:          (item.promises || []).map(p => ({
          title:  p.text || p.title,
          status: p.status || 'notdone'
        })),
        photoUrl:          item.photoUrl || '',
        contact: {
          phone:  item.contact?.phone || '',
          office: item.contact?.office || ''
        }
      }
    })

    const result = await Neta.insertMany(mappedNetas)
    console.log(`🎉 Successfully seeded ${result.length} politician profiles!`)
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB.')
  }
}

seed()
