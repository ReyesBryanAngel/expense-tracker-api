const User = require("../models/User");

const createUser = async (data) => {
  const user = new User(data);
  user.generateVerificationToken();

  return await user.save();
};

const findUser = async (email) => {
  return await User.findOne({ email: email });
};

// const updateUser = async (id, data) => {
//     return await User.findByIdAndUpdate(id, data, { new: true });
// }

// const deleteUser = async(id) => {
//     return await User.findByIdAndDelete(id);
// }

const getAdminByToken = async (token) => {
  return await User.findOne(token);
};

const getAdminById = async (id) => {
  return await User.findById(id);
};

module.exports = {
  createUser,
  // updateUser,
  // deleteUser,
  getAdminByToken,
  findUser,
  getAdminById,
};
