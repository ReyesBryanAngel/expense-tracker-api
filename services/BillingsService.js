const BillingsService = require("../models/Billings");

const createBilling = async (data) => {
    await BillingsService.create(data);
}

const updateBilling = async (id, data) => {
    await BillingsService.findByIdAndUpdate(id, data, {new: true})
}

const getBillingByUser = async (userId) => {
    return await BillingsService.find({ userId: userId });
}

const getBillingById = async (id) => {
    return await BillingsService.findById(id);
}

const deleteBilling = async (id) => {
    return await BillingsService.findByIdAndDelete(id);
}

module.exports = {
    createBilling,
    updateBilling,
    getBillingByUser,
    getBillingById,
    deleteBilling
}