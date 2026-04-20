const express = require('express');
const { registerUser, loginUser, studentLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/student-login', studentLogin);

module.exports = router;
