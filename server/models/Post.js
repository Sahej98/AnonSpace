
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AliasSchema = new Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
}, { _id: false });

// Recursive Comment Schema Support
const CommentSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 500,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    alias: {
        type: AliasSchema,
        required: true,
    },
    // Simple threading: Replies are embedded
    replies: [new Schema({
        content: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        alias: { type: AliasSchema, required: true },
        createdAt: { type: Date, default: Date.now }
    })]
}, {
    timestamps: true,
});

const PollOptionSchema = new Schema({
    text: { type: String, required: true },
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const PostSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 500,
    },
    type: {
        type: String,
        enum: ['text', 'poll'],
        default: 'text'
    },
    pollOptions: [PollOptionSchema],
    tags: {
        type: [String],
        default: [],
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    alias: {
        type: AliasSchema,
        required: true,
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [CommentSchema],
    reports: {
        type: Number,
        default: 0,
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

// Indexes for performance
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likes: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isHidden: 1 });

module.exports = mongoose.model('Post', PostSchema);
