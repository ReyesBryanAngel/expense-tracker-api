const express = require('express');
const UserAuthController = require('../controllers/Auth/UserAuthController');
const router = express.Router();
const authenticateToken = require('../middlewares/authMidllewre');

router.post('/createAdmin', UserAuthController.createAdmin);
router.get('/verifyAdmin/:token', UserAuthController.verifyToken);
router.post('/loginAdmin', UserAuthController.loginAdmin);
router.get('/profile', authenticateToken, UserAuthController.getProfile);
// router.put('/:id', UserAuthController.updateUser);
// router.delete('/:id', UserAuthController.deleteUser);

module.exports = router;