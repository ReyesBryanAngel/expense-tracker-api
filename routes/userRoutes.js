const express = require("express");
const UserAuthController = require("../controllers/Auth/UserAuthController");
const TransactionController = require("../controllers/TransactionController")
const router = express.Router();
const authenticateToken = require("../middlewares/authMidllewre");
const upload = require("../utils/upload")

//Authenticate endpoints
router.post("/register", UserAuthController.register);
router.get("/verify/:token", UserAuthController.verifyToken);
router.post("/login", UserAuthController.login);
router.get("/profile", authenticateToken, UserAuthController.getProfile);
router.put("/update-profile", authenticateToken, UserAuthController.updateProfile);
router.post("/refresh-token", UserAuthController.refreshToken);

//photo upload
router.post(
    "/upload-photo",
    authenticateToken,
    upload.single("photo"),
    UserAuthController.uploadPhoto
);
router.get("/get-photo", authenticateToken, UserAuthController.getPhoto);
router.delete(
  "/delete-photo",
  authenticateToken,
  UserAuthController.deletePhoto
);


//Reset password endpoints
router.post("/forgot-password", UserAuthController.forgotPassword);
router.get("/reset-password/:token", UserAuthController.resetPassword);
router.post("/change-password", UserAuthController.changePassword);

//Transaction Routes
router.post("/transaction", authenticateToken, TransactionController.createTransaction);
router.put("/transaction/:id", authenticateToken, TransactionController.updateTransaction);
router.get("/transactions", authenticateToken, TransactionController.getTransactions);
router.get("/transaction/:id", authenticateToken, TransactionController.getTransaction);
router.delete("/transaction/:id", authenticateToken, TransactionController.deleteTransaction);

module.exports = router;
