const mongoose = require('mongoose');

const BillingsSechema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    frequency: { type: String, required: false, enum: ["Monthly", "Yearly", "One-time", "Weekly", "Daily"] },
    date: { type: Date, required: true },
    isReminded: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
})

module.exports = mongoose.model("Billings", BillingsSechema);