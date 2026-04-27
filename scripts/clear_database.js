require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in backend/.env');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      console.log(`🧹 Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    console.log('\n✨ Database cleared successfully! Your app is now a fresh slate.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
