const express = require('express');
const router = express.Router();
const googleUserAuthController = require('../controllers/Auth/googleUserAuthController');

router.get('/auth/google', googleUserAuthController.googleLogin);

router.get('/auth/google/callback', googleUserAuthController.googleCallback);

router.get('/logout', googleUserAuthController.logout);

module.exports = router;