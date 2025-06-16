const express = require("express");
const UserAuthController = require("../controllers/Auth/UserAuthController");
const TransactionController = require("../controllers/TransactionController")
const router = express.Router();
const authenticateToken = require("../middlewares/authMidllewre");

//Auth Routes
router.post("/register", UserAuthController.register);
router.get("/verify/:token", UserAuthController.verifyToken);
router.post("/login", UserAuthController.login);
router.get("/profile", authenticateToken, UserAuthController.getProfile);
router.put("/update-profile", authenticateToken, UserAuthController.updateProfile);
router.post("/refresh-token", UserAuthController.refreshToken);
// router.put('/:id', UserAuthController.updateUser);
// router.delete('/:id', UserAuthController.deleteUser);

//Transaction Routes
router.post("/transaction", authenticateToken, TransactionController.createTransaction);
router.put("/transaction/:id", authenticateToken, TransactionController.updateTransaction);
router.get("/transactions", authenticateToken, TransactionController.getTransactions);
router.get("/transaction/:id", authenticateToken, TransactionController.getTransaction);
router.delete("/transaction/:id", authenticateToken, TransactionController.deleteTransaction);

module.exports = router;
