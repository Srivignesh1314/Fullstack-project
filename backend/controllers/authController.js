const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role, department) => {
    return jwt.sign({ id, role, department }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { username, password, department } = req.body;
        if (!department) {
            return res.status(400).json({ message: 'Department is required' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword,
            department
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                department: user.department,
                token: generateToken(user._id, user.role, user.department),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                department: user.department,
                token: generateToken(user._id, user.role, user.department),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const studentLogin = async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        const student = await Student.findOne({ rollNumber });

        if (student && (await bcrypt.compare(password, student.password))) {
            res.json({
                _id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                section: student.section,
                department: student.department,
                role: 'student',
                token: generateToken(student._id, 'student', student.department),
            });
        } else {
            res.status(401).json({ message: 'Invalid roll number or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, studentLogin };
