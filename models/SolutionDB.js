const mongoose = require('mongoose');

const solutionSchema = mongoose.Schema({
    doubtID: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    solution: {
        type: String, 
        required: true
    },
    addDate: {
        type: Date,
        required: true
    },
    modifiedDate: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "correct", "wrong"]
    }
})

const SolutionDB = mongoose.model('Solution', solutionSchema);

module.exports = {SolutionDB};