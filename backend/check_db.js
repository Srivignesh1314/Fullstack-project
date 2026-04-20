const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
        const count = await Student.countDocuments();
        const students = await Student.find({}, 'name rollNumber');
        console.log(`TOTAL_STUDENTS_IN_DB: ${count}`);
        students.forEach(s => console.log(` - ${s.name} (${s.rollNumber})`));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
