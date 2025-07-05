const User = require("../models/User");

const register = async (data) => {
  const user = new User(data);
  await user.validate();
  user.generateVerificationToken();

  return await user.save();
};

const findUser = async (email) => {
  return await User.findOne({ email: email });
};

const updateUser = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true });
}

const getUserByToken = async (token) => {
  return await User.findOne(token);
};

const getUserById = async (id) => {
  return await User.findById(id);
};

module.exports = {
  register,
  updateUser,
  getUserByToken,
  findUser,
  getUserById,
};
