const mogoose = require('mongoose');

const userSchema = new mogoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: String,
        default: '0'
    }
});

module.exports = mogoose.model("User", userSchema)