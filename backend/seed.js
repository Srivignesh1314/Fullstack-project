const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const studentsData = [
  { name: 'Chandra Shekhar', rollNumber: 'AP24110010', section: 'A', department: 'CSE' },
  { name: 'Rushyanth', rollNumber: 'AP24110011', section: 'A', department: 'CSE' },
  { name: 'Saatvic', rollNumber: 'AP24110012', section: 'B', department: 'CSE' },
  { name: 'Chaithra', rollNumber: 'AP24110013', section: 'B', department: 'CSE' },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
        console.log('MongoDB connection open...');

        // Clear existing initial
        await Student.deleteMany({});
        await User.deleteMany({});
        await Attendance.deleteMany({});

        // Create random test faculty
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        await User.create({
            username: 'siddarth',
            password: hashedPassword,
            role: 'faculty',
            department: 'CSE'
        });

        // Insert students
        const studentsWithPasswords = studentsData.map(s => ({
            ...s,
            password: hashedPassword // They all use 'password123'
        }));
        await Student.insertMany(studentsWithPasswords);

        console.log('Data seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
