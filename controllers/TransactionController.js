const TransactionService = require("../services/TransactionService");

const createTransaction = async (req, res, next) => {
    try {
        const data = { ...req.body, user: req.user.id };
        await TransactionService.createTransaction({ ...data, userId: req.user.id });
        return res.status(201).json({
            message: 'Transaction Created.',
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
    console.log('userId:', req.user.id)
    try {
        const transactions = await TransactionService.getTransactionsByUser(req.user.id);
        return res.status(200).json({
            message: 'Syccessfully fetched transactions.',
            code: 200,
            status: 'success',
            data: transactions
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
    deleteTransaction
}