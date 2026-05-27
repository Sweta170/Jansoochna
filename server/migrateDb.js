const mongoose = require('mongoose')
require('dotenv').config()

async function migrate() {
  // Use the original connection string (no database name) to connect to the cluster
  const baseUri = 'mongodb+srv://jansoochna:lpu2026@cluster0.zfu8v.mongodb.net/?appName=Cluster0'
  
  console.log('🔌 Connecting to MongoDB Atlas cluster...')
  try {
    await mongoose.connect(baseUri)
    console.log('✅ Connected to MongoDB Atlas!')
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    process.exit(1)
  }

  const client = mongoose.connection.client
  const sourceDb = client.db('test')
  const targetDb = client.db('jansoochna')

  try {
    // 1. List all collections in 'test' database
    console.log('\n🔍 Listing collections in "test" database...')
    const collections = await sourceDb.listCollections().toArray()
    
    if (collections.length === 0) {
      console.log('ℹ️ No collections found in "test" database to migrate.')
      await mongoose.disconnect()
      process.exit(0)
    }

    // 2. Migrate each collection
    for (const col of collections) {
      const colName = col.name
      if (colName.startsWith('system.')) continue

      console.log(`\n📦 Migrating collection: "${colName}"`)
      const docs = await sourceDb.collection(colName).find({}).toArray()

      if (docs.length > 0) {
        // Clear target collection first to avoid duplicates if re-run
        await targetDb.collection(colName).deleteMany({})
        await targetDb.collection(colName).insertMany(docs)
        console.log(`   ✅ Copied ${docs.length} documents to "jansoochna.${colName}"`)
      } else {
        console.log(`   ℹ️ Collection is empty. Creating empty collection "jansoochna.${colName}"`)
        await targetDb.createCollection(colName)
      }
    }

    // 3. Drop the old 'test' database to clean up Atlas
    console.log('\n🗑️ Dropping old "test" database to clean up Atlas...')
    await sourceDb.dropDatabase()
    console.log('✅ Database "test" dropped successfully!')

    console.log('\n🎉 DB MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('Your database has been renamed to "jansoochna".')
    console.log('All collections and documents have been moved.')
    
  } catch (err) {
    console.error('❌ Migration failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB.')
  }
}

migrate()
