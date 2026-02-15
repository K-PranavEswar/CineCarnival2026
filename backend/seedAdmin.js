import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const email = process.env.SEED_ADMIN_EMAIL || 'admin@filmfest.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cine-carnival');
    let user = await User.findOne({ email });
    if (user) {
      user.name = 'Admin';
      user.password = password; // will be hashed by pre-save
      user.role = 'admin';
      await user.save();
      console.log('Updated existing admin user:', email);
    } else {
      await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log('Created admin user:', email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Admin seed failed:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

seed();
