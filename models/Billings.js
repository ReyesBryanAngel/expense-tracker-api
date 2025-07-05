const mongoose = require('mongoose');

const BillingsSechema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    frequency: { type: String, required: true, enum: ["Monthly", "Yearly", "One-time"] },
    date: { type: Date, required: true },
    isReminded: { type: Boolean, default: false }
})

module.exports = mongoose.model("Billings", BillingsSechema);