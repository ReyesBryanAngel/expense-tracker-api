const User = require('../models/User');

const createAdmin = async (data) => {
    const user = new User(data);
    user.generateVerificationToken();

    return await user.save();
}

const findAdmin = async (username) => {
    return await User.findOne({ email: username });
}

// const updateUser = async (id, data) => {
//     return await User.findByIdAndUpdate(id, data, { new: true });
// }

// const deleteUser = async(id) => {
//     return await User.findByIdAndDelete(id);
// }

const getAdminByToken = async(token) => {
    return await User.findOne(token);
}

const getAdminById = async(_id) => {
    return await User.findOne(_id);
}

module.exports = {
    createAdmin,
    // updateUser,
    // deleteUser,
    getAdminByToken,
    findAdmin,
    getAdminById
}