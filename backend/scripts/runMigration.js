require('dotenv').config();
const mongoose = require('mongoose');
const { migrateTrialData } = require('./migrateClinicalTrials');

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await migrateTrialData();
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 