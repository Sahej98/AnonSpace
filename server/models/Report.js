
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
    targetType: {
        type: String,
        required: true,
        enum: ['post', 'comment', 'chat']
    },
    targetId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
