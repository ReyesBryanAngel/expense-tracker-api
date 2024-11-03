const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { 
        type: String, 
        required: true,
        minlength: 8,
        validate: {
            validator: function(v) {
                return /^(?=.*[A-Z])(?=.*[!@#$%^&_*])(?=.*\d).{8,}$/.test(v);
            },
            message: props => `${props.value} is not a valid password. It must contain at least 8 characters, one uppercase letter, one special character, and one number.`
        }
    },
    age: { type: Number, required: true },
    phoneNumber: { type: String, required: true, unique: true},
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String }
});

userSchema.methods.generateVerificationToken = function() {
    this.verificationToken = crypto.randomBytes(20).toString('hex');
};

// const googleUserSchema = new mongoose.Schema({
//     googleId: { type: String, required: true, unique: true },
//     name: String,
//     email: { type: String, unique: true }
// });

// googleUserSchema.statics.findOrCreate = async function (userObj) {
//     let user = await this.findOne({ googleId: userObj.googleId });
//     if (!user) {
//         user = await this.create(userObj)
//     }

//     return user;
// };

// const googleUserSchema = mongoose.model('googleUserSchema', googleUserSchema);
module.exports = mongoose.model('User', userSchema);