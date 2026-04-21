const express = require('express');
const {
    getTeachers,
    createTeacher,
    deleteTeacher,
    getAllStudents,
    addStudentByAdmin,
    deleteStudentByAdmin,
    getAllSubjects,
    addSubjectByAdmin,
    deleteSubjectByAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require a valid token AND admin role
router.use(protect);
router.use(adminOnly);

// Teacher management
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Student management (cross-department)
router.get('/students', getAllStudents);
router.post('/students', addStudentByAdmin);
router.delete('/students/:id', deleteStudentByAdmin);

// Subject management
router.get('/subjects', getAllSubjects);
router.post('/subjects', addSubjectByAdmin);
router.delete('/subjects/:id', deleteSubjectByAdmin);

module.exports = router;
