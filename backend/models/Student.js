const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    section: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        enum: ['CSE', 'EEE', 'ECE', 'CIVIL'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
