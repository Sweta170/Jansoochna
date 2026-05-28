const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Form = require('../src/models/Form')
const formData = require('../src/data/formData')

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
    console.log('🧹 Clearing existing forms collection...')
    await Form.deleteMany({})

    console.log(`📦 Mapping and importing ${formData.length} form guides...`)
    const mappedForms = formData.map(item => {
      return {
        slug:              item.id,
        title:             item.name,
        state:             item.state || 'all',
        category:          item.category,
        description:       `${item.nameHindi} (${item.name}) - details and document guidelines.`,
        steps:             item.tips || [],
        requiredDocuments: (item.documents || []).map(d => ({
          name:      d.name,
          nameHindi: d.nameHindi,
          note:      d.note || ''
        })),
        fees:              item.fees,
        processingTime:    item.processingDays,
        officeAddress:     item.office?.typeHindi || item.office?.type || '',
        downloadUrl:       item.office?.onlineUrl || '',
        
        // Backward compatibility properties
        nameHindi:    item.nameHindi,
        categoryIcon: item.categoryIcon,
        helpline:     item.helpline,
        office:       item.office
      }
    })

    const result = await Form.insertMany(mappedForms)
    console.log(`🎉 Successfully seeded ${result.length} government form guides!`)
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB.')
  }
}

seed()
