/**
 * Run this ONCE to create the admin account.
 * Usage: node seedAdmin.js
 * Default credentials: username=admin, password=admin123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log(`✅ Admin already exists: "${adminExists.username}"`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
        });

        console.log('✅ Admin account created!');
        console.log('   Username : admin');
        console.log('   Password : admin123');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
