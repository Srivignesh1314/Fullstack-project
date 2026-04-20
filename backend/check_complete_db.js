const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const User = require('./models/User');
const Student = require('./models/Student');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
        
        const subCount = await Subject.countDocuments();
        const subjects = await Subject.find({});
        console.log(`TOTAL_SUBJECTS_IN_DB: ${subCount}`);
        subjects.forEach(s => console.log(` - ${s.name} (Dept: ${s.department}, Students: ${s.students?.length || 0})`));

        const userCount = await User.countDocuments();
        const users = await User.find({});
        console.log(`\nTOTAL_USERS_IN_DB: ${userCount}`);
        users.forEach(u => console.log(` - ${u.username} (Role: ${u.role}, Dept: ${u.department})`));

        const studentCount = await Student.countDocuments();
        const students = await Student.find({});
        console.log(`\nTOTAL_STUDENTS_IN_DB: ${studentCount}`);
        students.forEach(s => console.log(` - ${s.name} (Dept: ${s.department})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
