const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const bcrypt = require('bcryptjs');

// @desc    Get all faculty teachers
// @route   GET /api/admin/teachers
const getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'faculty' })
            .select('-password')
            .sort({ department: 1, username: 1 });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new teacher account
// @route   POST /api/admin/teachers
const createTeacher = async (req, res) => {
    try {
        const { username, password, department } = req.body;

        if (!username || !password || !department) {
            return res.status(400).json({ message: 'Username, password, and department are required' });
        }

        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const teacher = await User.create({
            username,
            password: hashedPassword,
            role: 'faculty',
            department,
        });

        res.status(201).json({
            _id: teacher._id,
            username: teacher.username,
            role: teacher.role,
            department: teacher.department,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete a teacher account
// @route   DELETE /api/admin/teachers/:id
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        if (teacher.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete an admin account' });
        }
        await teacher.deleteOne();
        res.json({ message: 'Teacher removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all students (admin sees all departments)
// @route   GET /api/admin/students
const getAllStudents = async (req, res) => {
    try {
        const query = {};
        if (req.query.department) {
            query.department = req.query.department;
        }
        const students = await Student.find(query).sort({ department: 1, rollNumber: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a student (admin can pick any department)
// @route   POST /api/admin/students
const addStudentByAdmin = async (req, res) => {
    try {
        const { name, rollNumber, section, department, password } = req.body;

        if (!name || !rollNumber || !section || !department) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const exists = await Student.findOne({ rollNumber });
        if (exists) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const student = await Student.create({
            name,
            rollNumber,
            section,
            department,
            password: hashedPassword,
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete a student (admin)
// @route   DELETE /api/admin/students/:id
const deleteStudentByAdmin = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove all attendance records for this student
        await Attendance.deleteMany({ studentId: req.params.id });

        // Remove from subjects
        await Subject.updateMany(
            { students: req.params.id },
            { $pull: { students: req.params.id } }
        );

        await student.deleteOne();
        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all subjects (admin)
// @route   GET /api/admin/subjects
const getAllSubjects = async (req, res) => {
    try {
        const query = {};
        if (req.query.department) {
            query.department = req.query.department;
        }
        let subjects = await Subject.find(query)
            .populate('students', 'name rollNumber section')
            .sort({ department: 1, name: 1 });
            
        subjects = subjects.map(sub => ({
            ...sub._doc,
            students: sub.students ? sub.students.filter(s => s !== null) : []
        }));
        
        res.json(subjects);
    } catch (error) {
        console.error('getAllSubjects Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Add a subject (admin)
// @route   POST /api/admin/subjects
const addSubjectByAdmin = async (req, res) => {
    try {
        const { name, department, students } = req.body;
        if (!name || !department) return res.status(400).json({ message: 'Name and Department are required' });

        const exists = await Subject.findOne({ name, department });
        if (exists) return res.status(400).json({ message: 'Subject already exists in this department' });

        const subject = await Subject.create({
            name,
            department,
            students: students || []
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete a subject (admin)
// @route   DELETE /api/admin/subjects/:id
const deleteSubjectByAdmin = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // Delete subject attendance
        await Attendance.deleteMany({ subject: subject.name });
        await Subject.findByIdAndDelete(req.params.id);

        res.json({ message: 'Subject removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTeachers,
    createTeacher,
    deleteTeacher,
    getAllStudents,
    addStudentByAdmin,
    deleteStudentByAdmin,
    getAllSubjects,
    addSubjectByAdmin,
    deleteSubjectByAdmin,
};
