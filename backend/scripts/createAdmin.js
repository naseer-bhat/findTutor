// scripts/createAdmin.js
import dotenv from 'dotenv';
dotenv.config(); // This MUST come before using process.env

import mongoose from 'mongoose';
import User from '../models/User.js';
import { hashPassword } from '../utils/passwordUtil.js';

const MONGO_URI = process.env.DB_URL;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined. Did you forget to create a .env file?');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    const email = 'admin@findtutor.com';
    const password = await hashPassword('admin123');

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists.');
    } else {
      await User.create({
        name: 'Admin',
        email,
        password,
        passwordConfirm: password,
        roles: 'admin',
      });
      console.log('✅ Admin created successfully');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  });
