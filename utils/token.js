const jwt =  require('jsonwebtoken');

exports.generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tokenVersion: user.tokenVersion 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

exports.generateRefreshToken = (user) => {
    return jwt.sign(
        {  id: user._id, email: user.email },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}