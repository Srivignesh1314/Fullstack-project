const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const seedSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
        
        const initialSubjects = ['Mathematics', 'Physics', 'Computer Science'];
        
        for (const name of initialSubjects) {
            const exists = await Subject.findOne({ name });
            if (!exists) {
                await Subject.create({ name, department: 'CSE' });
                console.log(`Created subject: ${name}`);
            }
        }
        
        console.log('Initial subjects seeded!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSubjects();
