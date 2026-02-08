
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // The _id is the unique "Login ID"
    isBanned: {
        type: Boolean,
        default: false,
    },
    isTimedOut: {
        type: Boolean,
        default: false,
    },
    timeoutUntil: {
        type: Date,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isModerator: {
        type: Boolean,
        default: false,
    },
    acceptedTOS: {
        type: Boolean,
        default: false,
    },
    // Chat Related Fields
    lookingForChat: {
        type: Boolean,
        default: false,
    },
    currentChatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        default: null,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
