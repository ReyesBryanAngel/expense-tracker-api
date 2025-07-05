const UserAuthService = require("../../services/UserAuthService");
const transporter = require("../../config/nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { generateAccessToken, generateRefreshToken } = require("../../utils/token");

const sendVerificationEmail = async (user) => {
  const verificationUrl = `${process.env.BASE_URL}/api/users/verify/${user.verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user?.email,
    subject: "Welcome to Fintrack!",
    template: "verify",
    context: {
      firstName: user?.firstName || "User",
      verificationUrl,
    },
  };

  await transporter.sendMail(mailOptions);
}

const register = async (req, res, next) => {
  try {
    const user = await UserAuthService.register({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
    });

    await sendVerificationEmail(user);

    return res.status(201).json({
      code: 201,
      status: "success",
      message: "Your account has been created. Please check your email for verification.",
      data: user,
    });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      const existingUser = await User.findOne({ email: req.body.email });

      if (existingUser && !existingUser.isVerified) {
        existingUser.firstName = req.body.firstName;
        existingUser.lastName = req.body.lastName;
        existingUser.age = req.body.age;
        existingUser.phoneNumber = req.body.phoneNumber;

        if (req.body.password) {
          existingUser.password = await bcrypt.hash(req.body.password, 10);
        }

        existingUser.generateVerificationToken();
        await existingUser.save();

        await sendVerificationEmail(existingUser);

        return res.status(200).json({
          message: "Verification email resent. Please check your inbox.",
          status: "pending_verification",
          code: 200,
        });
      }

      return res.status(400).json({
        message: "Email already exists.",
        status: "failed",
        code: 400,
      });
    }

    next(error);
  }
};


const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await UserAuthService.getUserByToken({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message: "Invalid or expired verification token",
      });
    }

    const redirectToken = user.verificationToken; // save it before clearing

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect(`${process.env.APP_URL_DEV}/account-verified/${redirectToken}`);
  } catch (error) {
    res.status(500).json({ message: "Verification failed.", error });
  }
};


const uploadPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await User.findByIdAndUpdate(
      userId,
      { photo: req.file.path },
      { new: true }
    );

    res.json({
      code: 200,
      status: "success",
      message: "Photo successfully uploaded!."
    });
  } catch (error) {
    next(error);
  }
}

const getPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || !user.photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const photoPath = path.resolve(user.photo);
    if (!fs.existsSync(photoPath)) {
      return res.status(404).json({ message: "Photo file does not exist" });
    }

    res.sendFile(photoPath);
  } catch (error) {
    next(error);
  }
};

const deletePhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.photo) {
      return res.status(404).json({ message: "No photo to delete" });
    }
    const photoPath = path.resolve(user.photo);

    if (!photoPath.startsWith(path.resolve("uploads"))) {
      return res.status(403).json({ message: "Invalid photo path" });
    }

    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath); // Delete the file
    }

    // Remove the photo field in DB
    user.photo = undefined;
    await user.save();

    res.json({
      code: 200,
      status: "success",
      message: "Photo successfully deleted.",
    });
  } catch (error) {
    next(error);
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

    if (!user.isVerified)
      return res.status(401).json({
        code: 401,
        status: "failed",
        message: "Please verify your account or register again.",
      });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({
        code: 401,
        status: "failed",
        message: "Invalid credentials.",
      });

    const accessToken = generateAccessToken(user, 'authenticate');
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
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.sendStatus(403);

    user.tokenVersion += 1;
    await user.save();

    const newAccessToken = generateAccessToken(user, 'authenticate');
    const newRefreshToken = generateRefreshToken(user);

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

    const user = await UserAuthService.getUserById(id);

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserAuthService.findUser(email);

    if (!user)
      return res.status(404).json({
        code: 404,
        status: "failed",
        message: "User not found.",
      });

    const newAccessToken = generateAccessToken(user, 'resetPass');
    const resetUrl = `${process.env.BASE_URL}/api/users/reset-password/${newAccessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user?.email,
      subject: "Password Reset",
      template: "resetPass",
      context: {
        firstName: user?.firstName || "User",
        resetUrl,
      },
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    next(error);
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user based on decoded token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "failed",
        message: "User not found.",
      });
    }

    // Token is valid and user exists
    return res.redirect(`http://localhost:5173/reset-password/${token}`);

  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: "failed",
      message: "Invalid or expired reset token.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    if (!newPassword || !token) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message: "Password and token are required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetTokenVersion !== decoded.resetTokenVersion) {
      return res.status(404).json({
        code: 404,
        status: "failed",
        message: "Invalid or expired token.",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&_*])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message:
          "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetTokenVersion += 1;
    await user.save();

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Password has been changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "An error occurred while changing the password.",
      error,
    });
  }
};



module.exports = {
  register,
  uploadPhoto,
  getPhoto,
  updateProfile,
  verifyToken,
  login,
  refreshToken,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  deletePhoto
};
