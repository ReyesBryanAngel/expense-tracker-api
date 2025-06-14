const UserAuthService = require('../../services/UserAuthService');
const transporter = require('../../config/nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createAdmin = async (req, res, next) => {
    try {
        const user = await UserAuthService.createAdmin({
            ...req.body, 
            password: await bcrypt.hash(req.body.password, 10)
        });
        const verificationUrl = `${process.env.BASE_URL}/api/users/verifyAdmin/${user.verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Email verification for FinanceTracker',
            text: `Click this link to verify your account: ${verificationUrl}`
        }

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ 
            code: 201,
            status: 'success',
            message: 'Your admin account has been created.',
            data: user
        });
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Registration failed', error });
    }
}

const verifyToken = async(req, res) => {
    try {
        const { token } = req.params;
        const user = await UserAuthService.getAdminByToken({ verificationToken: token });
    
        if (!user) {
          return res.status(400).json({ 
            code: 400,
            status: 'failed',
            message: 'Invalid or expired verification token' 
        });
        }
    
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
    
        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Account verified successfully' 
        });
      } catch (error) {
        res.status(500).json({ message: 'Verification failed.', error });
      }
}

const loginAdmin = async(req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await UserAuthService.findAdmin(username);
        if (!user) return res.status(404).json({
            code: 404,
            status: 'failed',
            message: 'User not found.' 
        });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(401).json({
            code: 401,
            status: 'failed',
            message: 'Invalid credentials.' 
        });

        const token = jwt.sign({ id: user._id, username: username, role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Login Successfully.',
            token: token
        });
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Login failed.', error });
    }
}

// controller
const getProfile = async (req, res) => {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(400).json({
                code: 400,
                status: 'failed',
                message: 'Invalid token payload: id missing.'
            });
        }

        const user = await UserAuthService.getAdminById(id);

        if (!user) {
            return res.status(404).json({
                code: 404,
                status: 'failed',
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Successfully fetched Admin User info.',
            data: user
        });

    } catch (error) {
        console.error('Error fetching admin:', error);
        res.status(500).json({ message: 'Get Admin Failed.', error });
    }
};


// const updateUser = async (req, res, next) => {
//     try {
//         const user = await UserAuthService.updateUser(req.params.id, req.body);
//         if (!user) return res.status(404).json({ message: 'User is not found.' });

//         res.status(200).json(user);
//     } catch (error) {
//         next(error);
//     }
// }

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
    createAdmin,
    // updateUser,
    // deleteUser,
    verifyToken,
    loginAdmin,
    getProfile
};