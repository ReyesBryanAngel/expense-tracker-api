const BillingsService = require("../models/Billings");
const transporter = require("../config/nodemailer");

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

const getAllBillingsDueOn = async (date) => {
  return await BillingsService.find({
    dueDate: {
      $gte: new Date(date + "T00:00:00Z"),
      $lte: new Date(date + "T23:59:59Z")
    },
    isReminded: false
  });
};

const sendBillingReminder = async (billings, user) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user?.email,
        subject: "Bill Reminder",
        template: "billing-reminder",
        context: {
            firstName: user?.firstName || "Fintrack User",
            billings: billings
        },
    };

    await transporter.sendMail(mailOptions);
}


module.exports = {
    createBilling,
    updateBilling,
    getBillingByUser,
    getBillingById,
    deleteBilling,
    getAllBillingsDueOn,
    sendBillingReminder
}