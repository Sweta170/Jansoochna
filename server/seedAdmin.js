const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');
require('dotenv').config();

const seedSuperadmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jansoochna');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jansoochna.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Superadmin already exists. You can login with: ${adminEmail}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const superadmin = new Admin({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin',
      state: 'All',
      district: 'All'
    });

    await superadmin.save();
    console.log('✅ First Superadmin created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding superadmin:', error);
    process.exit(1);
  }
};

seedSuperadmin();
