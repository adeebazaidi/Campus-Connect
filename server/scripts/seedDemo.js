// server/scripts/seedDemo.js
// Seeds demo credentials directly into the configured MongoDB Atlas database.
// Usage: node scripts/seedDemo.js [--force]
//   --force  : Drop existing users/complaints/departments and re-seed fresh.

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

const FORCE = process.argv.includes('--force');

const seed = async () => {
  if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
    console.error('❌ MONGO_URI is not set in your .env file. Cannot seed Atlas database.');
    process.exit(1);
  }

  console.log('\n📡 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ Connected to: ${mongoose.connection.host} / ${mongoose.connection.name}\n`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    console.error('\n💡 Possible fixes:');
    console.error('   • Whitelist your current IP in Atlas → Network Access → Add IP Address');
    console.error('   • Verify your MONGO_URI credentials in .env');
    process.exit(1);
  }

  // --force: clear existing data
  if (FORCE) {
    console.log('⚠️  --force flag detected. Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🗑️  Cleared users, departments, and complaints.\n');
  } else {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`ℹ️  Database already has ${existingUsers} user(s). Skipping seed.`);
      console.log('   Run with --force to wipe and re-seed: node scripts/seedDemo.js --force\n');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  console.log('🌱 Seeding demo data...\n');

  // Departments
  const departments = await Department.create([
    { name: 'Computer Science',         head: 'Dr. Alan Turing' },
    { name: 'IT Support',               head: 'Sarah Connor' },
    { name: 'Facilities & Maintenance', head: 'Bob Builder' },
    { name: 'Administration',           head: 'Dean Johnson' },
  ]);
  console.log(`📂 Created ${departments.length} departments`);

  // Users
  const admin = await User.create({
    name: 'Campus Administrator',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin',
  });

  const staff = await User.create({
    name: 'IT Support Staff',
    email: 'staff@campus.edu',
    password: 'staff123',
    role: 'staff',
    department: 'IT Support',
  });

  const student = await User.create({
    name: 'Demo Student',
    email: 'student@campus.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
  });

  console.log(`👤 Created 3 demo users (admin, staff, student)`);

  // Sample Complaints
  const complaints = await Complaint.create([
    {
      title: 'Campus Wi-Fi Unstable in Library 2nd Floor',
      description: 'The connection repeatedly drops every 10 minutes near the study pods.',
      category: 'Network / Wi-Fi',
      status: 'in-progress',
      createdBy: student._id,
      assignedTo: staff._id,
    },
    {
      title: 'Projector not working in Room CS-304',
      description: 'HDMI port is loose and the display flickers during lectures.',
      category: 'Hardware',
      status: 'pending',
      createdBy: student._id,
    },
    {
      title: 'Air Conditioning malfunction in Lab 2',
      description: 'AC is making loud rattling noise and not cooling.',
      category: 'Maintenance',
      status: 'resolved',
      createdBy: student._id,
      assignedTo: staff._id,
    },
  ]);
  console.log(`📝 Created ${complaints.length} sample complaints\n`);

  console.log('✅ Demo data seeded successfully!\n');
  console.log('Demo Credentials:');
  console.log('  Admin    → admin@campus.edu   / admin123');
  console.log('  Staff    → staff@campus.edu   / staff123');
  console.log('  Student  → student@campus.edu / student123\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected. All done!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
