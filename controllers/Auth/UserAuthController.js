const UserAuthService = require("../../services/UserAuthService");
const transporter = require("../../config/nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../../utils/token");

const register = async (req, res, next) => {
  try {
    const user = await UserAuthService.register({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
    });

    const verificationUrl = `${process.env.BASE_URL}/api/users/verify/${user.verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user?.email,
      subject: "Welcome to FinanceTracker",
      template: "verify",
      context: {
        firstName: user?.firstName || "User",
        verificationUrl,
      },
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      code: 201,
      status: "success",
      message: "Your admin account has been created.",
      data: user,
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Registration failed", error });
  }
};

const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await UserAuthService.getAdminByToken({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect("http://localhost:5173");
  } catch (error) {
    res.status(500).json({ message: "Verification failed.", error });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await UserAuthService.findUser(email);
    if (!user)
      return res.status(404).json({
        code: 404,
        status: "failed",
        message: "User not found.",
      });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({
        code: 401,
        status: "failed",
        message: "Invalid credentials.",
      });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login Successfully.",
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Login failed.", error });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  try {
    // Decode first
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.sendStatus(403);

    // Invalidate old access tokens
    user.tokenVersion += 1;
    await user.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({
      code: 200,
      status: "success",
      message: "Refresh token successfully.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// controller
const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message: "Invalid token payload: id missing.",
      });
    }

    const user = await UserAuthService.getAdminById(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "failed",
        message: "User not found.",
      });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Successfully fetched User info.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Get User Failed.", error });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserAuthService.updateUser(userId, req.body);
    if (!user) return res.status(404).json({ message: 'User is not found.' });

    // res.status(200).json(user);

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Successfully updated User info.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// const deleteUser = async (req, res, next) => {
//     try {
//         const user = await UserAuthService.deleteUser(req.params.id);
//         if (!user) return res.status(404).json({ message: 'User is not found.' });
//         res.status(200).json({ message: 'User deleted' });
//     } catch (error) {
//         next(error);
//     }
// }

module.exports = {
  register,
  updateProfile,
  // deleteUser,
  verifyToken,
  login,
  refreshToken,
  getProfile,
};
