const express = require("express");
const UserAuthController = require("../controllers/Auth/UserAuthController");
const router = express.Router();
const authenticateToken = require("../middlewares/authMidllewre");

router.post("/createUser", UserAuthController.createUser);
router.get("/verify/:token", UserAuthController.verifyToken);
router.post("/login", UserAuthController.login);
router.get("/profile", authenticateToken, UserAuthController.getProfile);
// router.put('/:id', UserAuthController.updateUser);
// router.delete('/:id', UserAuthController.deleteUser);

module.exports = router;
