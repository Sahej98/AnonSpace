
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderAlias: {
        name: String,
        color: String
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'reply', 'chat_match'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // Post ID or Chat ID
        required: true
    },
    text: {
        type: String,
        maxLength: 100
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
