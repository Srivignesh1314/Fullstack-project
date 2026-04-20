const Student = require('../models/Student');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Attendance = require('../models/Attendance');

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
    try {
        const query = {};
        // If faculty, only show students from their department
        if (req.user && req.user.role === 'faculty') {
            query.department = req.user.department;
        } else if (req.query.department) {
            query.department = req.query.department;
        }

        console.log(`Fetching students for query: ${JSON.stringify(query)}`);
        const students = await Student.find(query).sort({ rollNumber: 1 });
        console.log(`Found ${students.length} students`);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error getting students' });
    }
};

// @desc    Mark attendance for a class
// @route   POST /api/attendance
const markAttendance = async (req, res) => {
    try {
        const { subject, date, attendanceData } = req.body;
        // attendanceData is an array: [{ studentId, status }, ...]

        if (!subject || !date || !attendanceData || attendanceData.length === 0) {
            return res.status(400).json({ message: 'Missing subject, date, or attendance data' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Check if attendance already marked for this subject and date
        // We will do a generic check if first student in array has attendance marked
        const existingRecord = await Attendance.findOne({
            subject,
            date: {
                $gte: new Date(formattedDate),
                $lt: new Date(new Date(formattedDate).getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingRecord) {
            // Can choose to delete old ones or return error
            await Attendance.deleteMany({
                subject,
                date: {
                    $gte: new Date(formattedDate),
                    $lt: new Date(new Date(formattedDate).getTime() + 24 * 60 * 60 * 1000)
                }
            });
        }

        const newRecords = attendanceData.map(record => ({
            studentId: record.studentId,
            subject,
            date: new Date(formattedDate),
            status: record.status // 'Present' or 'Absent'
        }));

        const savedRecords = await Attendance.insertMany(newRecords);

        res.status(201).json({ message: 'Attendance marked successfully', count: savedRecords.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error marking attendance' });
    }
};

// @desc    Get calculated attendance stats
// @route   GET /api/attendance/stats
const getAttendanceStats = async (req, res) => {
    try {
        const { subject } = req.query; // optional filter

        const matchStage = {};
        if (subject) {
            matchStage.subject = subject;
        }

        // If the requester is a student, only show their stats
        if (req.user && req.user.role === 'student') {
            matchStage.studentId = new mongoose.Types.ObjectId(req.user.id);
        }

        // Aggregate to calculate stats per student
        const stats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$studentId",
                    totalClasses: { $sum: 1 },
                    presentClasses: {
                        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $project: {
                    studentId: "$_id",
                    name: "$studentInfo.name",
                    rollNumber: "$studentInfo.rollNumber",
                    section: "$studentInfo.section",
                    department: "$studentInfo.department",
                    totalClasses: 1,
                    presentClasses: 1,
                    percentage: {
                        $cond: [
                            { $eq: ["$totalClasses", 0] },
                            0,
                            { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { rollNumber: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error getting stats' });
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/data/attendance/:id
const deleteAttendance = async (req, res) => {
    try {
        const record = await Attendance.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await record.deleteOne();
        res.json({ message: 'Attendance record removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting record' });
    }
};

// @desc    Add new student
// @route   POST /api/data/students
const addStudent = async (req, res) => {
    try {
        const { name, rollNumber, section, password, department } = req.body;

        const studentExists = await Student.findOne({ rollNumber });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const student = await Student.create({
            name,
            rollNumber,
            section,
            department: department || (req.user && req.user.department),
            password: hashedPassword
        });

        res.status(201).json(student);
    } catch (error) {
        console.error('Error in addStudent:', error);
        res.status(500).json({ message: 'Server Error adding student: ' + error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/data/students/:id
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete student's attendance records first
        await Attendance.deleteMany({ studentId: req.params.id });
        
        // Remove student reference from all subjects
        await Subject.updateMany(
            { students: req.params.id },
            { $pull: { students: req.params.id } }
        );

        await student.deleteOne();

        res.json({ message: 'Student and associated references removed' });
    } catch (error) {
        console.error('Error in deleteStudent:', error);
        res.status(500).json({ message: 'Server Error deleting student' });
    }
};

// @desc    Get all subjects
// @route   GET /api/data/subjects
const getSubjects = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.role === 'faculty') {
            query.department = req.user.department;
        }

        console.log(`Fetching subjects for query: ${JSON.stringify(query)}`);
        let subjects = await Subject.find(query).populate('students', 'name rollNumber section').sort({ name: 1 });
        
        // Filter out any students that failed to populate (were null)
        subjects = subjects.map(sub => ({
            ...sub._doc,
            students: sub.students.filter(s => s !== null)
        }));

        console.log(`Found ${subjects.length} subjects`);
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error getting subjects' });
    }
};

// @desc    Add new subject
// @route   POST /api/data/subjects
const addSubject = async (req, res) => {
    try {
        const { name, department, students } = req.body;
        if (!name) return res.status(400).json({ message: 'Subject name is required' });
        
        const dept = department || (req.user && req.user.department);
        console.log(`Adding Subject: ${name}, Dept: ${dept}, Students Count: ${students?.length || 0}`);
        
        if (!dept) return res.status(400).json({ message: 'Department is required. Please re-login.' });

        const exists = await Subject.findOne({ name, department: dept });
        if (exists) return res.status(400).json({ message: 'Subject already exists in this department' });

        const subject = await Subject.create({ 
            name, 
            department: dept,
            students: students || [] 
        });
        console.log('Subject Created Successfully:', subject._id);
        res.status(201).json(subject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error adding subject' });
    }
};

// @desc    Delete subject
// @route   DELETE /api/data/subjects/:id
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Attempting to delete subject with ID:', id);
        
        if (!id || id === 'undefined') {
            return res.status(400).json({ message: 'Subject ID is missing or undefined' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid subject ID format: ' + id });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Delete all attendance records associated with this subject name
        // Attendance model stores subject as a string (name)
        await Attendance.deleteMany({ subject: subject.name });
        
        // Use the model to delete to avoid instance method issues
        await Subject.findByIdAndDelete(id);

        res.json({ message: 'Subject and associated attendance records removed' });
    } catch (error) {
        console.error('Delete Subject Error:', error);
        res.status(500).json({ message: 'Server Error deleting subject: ' + error.message });
    }
};

module.exports = {
    getStudents,
    markAttendance,
    getAttendanceStats,
    deleteAttendance,
    addStudent,
    deleteStudent,
    getSubjects,
    addSubject,
    deleteSubject
};
