const mongoose = require("mongoose");

const catgeorySchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("Category", catgeorySchema);