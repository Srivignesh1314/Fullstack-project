const express = require('express');
const {
    getStudents,
    markAttendance,
    getAttendanceStats,
    deleteAttendance,
    addStudent,
    deleteStudent,
    getSubjects,
    addSubject,
    deleteSubject
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Require login for all below routes
router.use(protect);

router.get('/students', getStudents);
router.post('/students', addStudent);
router.delete('/students/:id', deleteStudent);
router.get('/subjects', getSubjects);
router.post('/subjects', addSubject);
router.delete('/subjects/:id', deleteSubject);
router.post('/attendance', markAttendance);
router.get('/attendance/stats', getAttendanceStats);
router.delete('/attendance/:id', deleteAttendance);

module.exports = router;
