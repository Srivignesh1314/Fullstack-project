const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        enum: ['CSE', 'EEE', 'ECE', 'CIVIL'],
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
