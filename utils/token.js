const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user, purpose) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tokenVersion: user.tokenVersion,
            age: user.age,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
            resetTokenVersion: user.resetTokenVersion
        },
        process.env.JWT_SECRET,
        { expiresIn: purpose === 'authenticate' ? process.env.ACCESS_TOKEN_EXPIRY : process.env.RESET_PASSWORD_TOKEN }
    )
}

exports.generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}