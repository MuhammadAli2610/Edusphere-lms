require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@edusphere.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('Admin created:', email);
  process.exit();
};

run();