const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ["Housing", "Food", "Transportation", "Entertainment", "Utilities", "Others", "Income"]
    },
    type: {
        type: String,
        required: true,
        enum: ["income", "expense"]
    },
    description: { type: String },
    date: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model("Transaction", TransactionSchema);