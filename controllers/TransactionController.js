const TransactionService = require("../services/TransactionService");
const mongoose = require("mongoose")

const createTransaction = async (req, res, next) => {
    try {
        const data = { ...req.body, user: req.user.id };
        await TransactionService.createTransaction({ ...data, userId: req.user.id });
        return res.status(201).json({
            message: 'Transaction Added.',
            code: 201,
            status: 'success'
        })
    } catch (error) {
        next(error);
    }
}

const updateTransaction = async (req, res, next) => {
    try {
        const transaction = await TransactionService.updateTransaction(req.params.id, req.body);
        if (!transaction) return res.status(404).json({ message: 'Transaction is not found.' });
        return res.status(200).json({
            message: 'Transaction Updated.',
            code: 200,
            status: 'success'
        })
    } catch (error) {
        next(error);
    }
}

const getTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionService.getTransactionsByUser(req.user.id);
        if (!transactions) return res.status(404).json({ message: 'Transactions are not found.' });
        return res.status(200).json({
            message: 'Successfully fetched transactions.',
            code: 200,
            status: 'success',
            data: transactions
        })
    } catch (error) {
        next(error);
    }
}

const getTransaction = async(req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Transaction is not found.' });
    try {
        const transaction = await TransactionService.getTransactionById(req.params.id);
        return res.status(200).json({
            message: 'Successfully fetched transaction.',
            code: 200,
            status: 'success',
            data: transaction
        })
    } catch (error) {
        next(error);
    }
}

const deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await TransactionService.deleteTransaction(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction is not found.' });
        return res.status(200).json({
            message: 'Transaction Deleted',
            code: 200,
            status: 'success',
        })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTransaction,
    updateTransaction,
    getTransactions,
    deleteTransaction,
    getTransaction
}