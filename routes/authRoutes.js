const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/auth/google', authController.googleLogin);

router.get('/auth/google/callback', authController.googleCallback);

router.get('/logout', authController.logout);

module.exports = router;