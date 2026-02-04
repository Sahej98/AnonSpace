
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AliasSchema = new Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
}, { _id: false });

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 280,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    alias: {
        type: AliasSchema,
        required: true,
    }
}, {
    timestamps: true,
});

const PostSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 280,
    },
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
    comments: [CommentSchema],
    reports: { // This can be deprecated in favor of the Reports collection count
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


module.exports = mongoose.model('Post', PostSchema);
