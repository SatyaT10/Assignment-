const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCreaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    catgeoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    level: {
        type: String,
        required: true
    },
    courseTitle: {
        type: String,
        required: true
    },
    coursePrice: {
        type: Number,
        default: 0
    },
    courseContent: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Course", courseSchema);