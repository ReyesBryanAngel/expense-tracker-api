const BillingsService = require('../services/BillingsService');
const UserAuthService = require('../services/UserAuthService');
const dayjs = require('../utils/setupDays').default;

const createBilling = async (req, res, next) => {
    try {
          const data = {
            ...req.body,
            userId: req.user.id,
            date: dayjs().toDate()
        };
        await BillingsService.createBilling(data);
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
        next(error);
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

const RemindBilling = async (req, res, next) => {
    try {
        const billings = await BillingsService.getBillingByUser(req.user.id);
        if (!billings) return res.status(404).json({ message: 'Billing is not found.' });
        const user = await UserAuthService.getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User is not found.' });

        if (billings?.length > 0) {
            const plainedBillings = billings?.map(billing => {
                const obj = billing.toObject ? billing.toObject() : billing;
                return {
                    ...obj,
                    dueDate: dayjs(obj.dueDate).format('MMMM D, YYYY'),
                }
            })
            await BillingsService.sendBillingReminder(plainedBillings, user);

            return res.status(200).json({
                code: 200,
                status: 'success',
                message: 'Successfully sent billing reminder.',
                data: plainedBillings
            })
        } else {
            return res.status(404).json({ message: 'No Bills to Pay at this moment' });
        }

    } catch (error) {
        next(error);
    }
}

module.exports = {
    createBilling,
    updateBilling,
    getBillings,
    getBilling,
    deleteBilling,
    RemindBilling
}