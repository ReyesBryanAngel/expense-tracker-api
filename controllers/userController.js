const userService = require('../services/userServices');

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) return res.status(404).json({ message: 'User is not found.' });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) return res.status(404).json({ message: 'User is not found.' });
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUser,
    updateUser,
    deleteUser
};