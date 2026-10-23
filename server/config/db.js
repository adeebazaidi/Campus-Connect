// server/config/db.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");

let mongod = null;

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log("🌱 Seeding demo data for instant testing...");

    // Seed Departments
    await Department.create([
      { name: "Computer Science", head: "Dr. Alan Turing" },
      { name: "IT Support", head: "Sarah Connor" },
      { name: "Facilities & Maintenance", head: "Bob Builder" },
      { name: "Administration", head: "Dean Johnson" },
    ]);

    // Seed Users
    const admin = await User.create({
      name: "Campus Administrator",
      email: "admin@campus.edu",
      password: "admin123",
      role: "admin",
    });

    const staff = await User.create({
      name: "IT Support Staff",
      email: "staff@campus.edu",
      password: "staff123",
      role: "staff",
      department: "IT Support",
    });

    const student = await User.create({
      name: "Demo Student",
      email: "student@campus.edu",
      password: "student123",
      role: "student",
      department: "Computer Science",
    });

    // Seed Complaints
    await Complaint.create([
      {
        title: "Campus Wi-Fi Unstable in Library 2nd Floor",
        description: "The connection repeatedly drops every 10 minutes near the study pods.",
        category: "Network / Wi-Fi",
        status: "in-progress",
        createdBy: student._id,
        assignedTo: staff._id,
      },
      {
        title: "Projector not working in Room CS-304",
        description: "HDMI port is loose and the display flickers during lectures.",
        category: "Hardware",
        status: "pending",
        createdBy: student._id,
      },
      {
        title: "Air Conditioning malfunction in Lab 2",
        description: "AC is making loud rattling noise and not cooling.",
        category: "Maintenance",
        status: "resolved",
        createdBy: student._id,
        assignedTo: staff._id,
      },
    ]);

    console.log("✅ Demo users and complaints seeded successfully!");
    console.log("👤 Demo Logins:");
    console.log("   - Admin:   admin@campus.edu   / admin123");
    console.log("   - Staff:   staff@campus.edu   / staff123");
    console.log("   - Student: student@campus.edu / student123");
  } catch (err) {
    console.warn("⚠️ Warning during demo data seeding:", err.message);
  }
};

const connectDB = async () => {
  // Reuse existing connection if already open
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // 1. Try connecting to configured MONGO_URI if present
  if (process.env.MONGO_URI && process.env.MONGO_URI.trim()) {
    try {
      console.log("📡 Attempting connection to MongoDB URI...");
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      console.warn(`⚠️ Could not connect to primary MONGO_URI (${error.message})`);
      if (process.env.VERCEL) {
        throw error;
      }
      console.log("🔄 Seamlessly falling back to In-Memory MongoDB for local development...");
    }
  } else {
    if (process.env.VERCEL) {
      throw new Error("MONGO_URI environment variable is not defined on Vercel.");
    }
    console.log("ℹ️ No MONGO_URI provided. Starting In-Memory MongoDB for local development...");
  }

  // 2. In-Memory fallback
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB active & connected!`);

    // Seed demo accounts so everything works immediately
    await seedDemoData();
  } catch (err) {
    console.error("❌ Failed to start In-Memory MongoDB:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

module.exports = connectDB;
