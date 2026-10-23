// Helper script to check database connection and list users
require('dotenv').config({ path: require('path').join(__dirname, '../..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database connection...\n');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env file');
      process.exit(1);
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check users
    const userCount = await User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('name email role').limit(10);
      console.log('\n📋 Users in database:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('⚠️  No users found in database. You need to register first!');
    }
    
    // Check complaints
    const complaintCount = await Complaint.countDocuments();
    console.log(`\n📝 Total complaints: ${complaintCount}`);
    
    if (complaintCount > 0) {
      const complaints = await Complaint.find()
        .populate('createdBy', 'name email')
        .select('title status createdAt')
        .limit(5)
        .sort('-createdAt');
      console.log('\n📋 Recent complaints:');
      complaints.forEach((complaint, index) => {
        console.log(`   ${index + 1}. ${complaint.title} - ${complaint.status} (by ${complaint.createdBy?.name || 'Unknown'})`);
      });
    } else {
      console.log('⚠️  No complaints found in database.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();

