const Transaction = require("../models/Transaction");

const createTransaction = async (data) => {
    return await Transaction.create(data)
}

const updateTransaction = async (id, data) => {
    return await Transaction.findByIdAndUpdate(id, data, { new: true });
}

const getTransactionsByUser = async (userId) => {
    return await Transaction.find({ userId: userId });
}

const deleteTransaction = async (id) => {
    return await Transaction.findByIdAndDelete(id);
}

module.exports = {
    createTransaction,
    updateTransaction,
    getTransactionsByUser,
    deleteTransaction
}