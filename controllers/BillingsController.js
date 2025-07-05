const BillingsService = require('../services/BillingsService');

const createBilling = async (req, res, next) => {
    try {
        const data = { ...req.body, user: req.user.id };
        await BillingsService.createBilling({ ...data, userId: req.user.id });
        return res.status(201).json({
            message: 'Billings Successfully Added.',
            code: 201,
            status: 'success'
        })
    } catch (error) {
        next(error);
    }
}

const updateBilling = async (req, res, next) => {
    try {
        const billing = await BillingsService.updateBilling(req.params.id, req.body);
        if (!billing) return res.status(404).json({ message: 'Billing is not found.' });
        return res.status(200).json({
            message: 'Billing Updated.',
            code: 200,
            status: 'success'
        })
    } catch (error) {
        
    }
}

const getBillings = async (req, res, next) => {
    try {
        const billings = await BillingsService.getBillingByUser(req.user.id);
        if (!billings) return res.status(404).json({ message: 'Billing is not found.' });
        return res.status(200).json({
            message: 'Successfully fetched billing.',
            code: 200,
            status: 'success',
            data: billings
        })
    } catch (error) {
        next(error);
    }
}

const getBilling = async (req, res, next) => {
    try {
        const billing = await BillingsService.getBillingById(req.params.id);
        if (!billing) return res.status(404).json({ message: 'Billing is not found.' });
        return res.status(200).json({
            message: 'Successfully fetched billing.',
            code: 200,
            status: 'success',
            data: billing
        })
    } catch (error) {
        next(error);
    }
}

const deleteBilling = async (req, res, next) => {
    try {
        const transaction = await BillingsService.deleteBilling(req.params.id);
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
    createBilling,
    updateBilling,
    getBillings,
    getBilling,
    deleteBilling
}