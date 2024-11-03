const express = require('express');
const AdminAuthController = require('../controllers/Auth/AdminAuthController');
const router = express.Router();
const authenticateToken = require('../middlewares/authMidllewre');

router.post('/createAdmin', AdminAuthController.createAdmin);
router.get('/verifyAdmin/:token', AdminAuthController.verifyToken);
router.post('/loginAdmin', AdminAuthController.loginAdmin);
router.get('/profile', authenticateToken, AdminAuthController.getProfile);
// router.put('/:id', AdminAuthController.updateUser);
// router.delete('/:id', AdminAuthController.deleteUser);

module.exports = router;