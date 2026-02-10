
const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Changelog', ChangelogSchema);
