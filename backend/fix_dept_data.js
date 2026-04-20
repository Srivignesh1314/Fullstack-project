const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
        console.log('Connected to database to fix departments...');

        // Update Students
        const studentsUpdate = await Student.updateMany(
            { $or: [{ department: { $exists: false } }, { department: null }, { department: '' }] },
            { $set: { department: 'CSE' } }
        );
        console.log(`Updated ${studentsUpdate.modifiedCount} students to department: CSE`);

        // Update Users (Faculty/Admin)
        const usersUpdate = await User.updateMany(
            { $or: [{ department: { $exists: false } }, { department: null }, { department: '' }] },
            { $set: { department: 'CSE' } }
        );
        console.log(`Updated ${usersUpdate.modifiedCount} users to department: CSE`);

        // Update Subjects
        const subjectsUpdate = await Subject.updateMany(
            { $or: [{ department: { $exists: false } }, { department: null }, { department: '' }] },
            { $set: { department: 'CSE' } }
        );
        console.log(`Updated ${subjectsUpdate.modifiedCount} subjects to department: CSE`);

        console.log('Data fix completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Error fixing data:', err);
        process.exit(1);
    }
};

fixData();
