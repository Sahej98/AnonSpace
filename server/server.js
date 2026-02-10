
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Filter = require('bad-words');
const { generateUsername } = require('./utils/usernameGenerator');
const connectDB = require('./db');
const path = require('path');

// DB Models
const User = require('./models/User');
const Post = require('./models/Post');
const Report = require('./models/Report');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const Changelog = require('./models/Changelog');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Use CLIENT_URL for production (Vercel), fallback to localhost for dev
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const filter = new Filter();
// Safe clean function to prevent crashes on emoji-only strings
const safeClean = (text) => {
    try {
        if (!text || !text.trim()) return "";
        return filter.clean(text);
    } catch (e) {
        // If filter fails (e.g. on pure emojis), return original text
        return text;
    }
};

const PORT = process.env.PORT || 3001;
const ADMIN_ID = '111111111111111111111111'; // Hardcoded Admin ID

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// --- Middleware ---
const attachUser = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        try {
            const user = await User.findById(userId);
            if (user) {
                // Check timeout
                if (user.isTimedOut && user.timeoutUntil && new Date() < user.timeoutUntil) {
                    // User is in timeout
                } else if (user.isTimedOut && user.timeoutUntil && new Date() >= user.timeoutUntil) {
                    user.isTimedOut = false;
                    user.timeoutUntil = null;
                    await user.save();
                }

                user.lastActive = new Date();
                await user.save();
                req.user = user;
            }
        } catch (error) {
            console.warn("Error looking up user:", error.message);
        }
    }
    next();
};

app.use(attachUser);

const requireAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized. Please login." });
    if (req.user.isBanned) return res.status(403).json({ error: "Account suspended." });
    if (req.user.isTimedOut) return res.status(403).json({ error: `You are timed out until ${new Date(req.user.timeoutUntil).toLocaleString()}` });
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: "Admin access required." });
    next();
};

const requireMod = (req, res, next) => {
    if (!req.user || (!req.user.isAdmin && !req.user.isModerator)) return res.status(403).json({ error: "Moderator access required." });
    next();
};

// --- Helpers ---
const createNotification = async (recipientId, type, targetId, senderAlias, text) => {
    // Redundant check, but safe
    if (recipientId.toString() === senderAlias.userId?.toString()) return;

    try {
        const notif = new Notification({
            recipient: recipientId,
            type,
            targetId,
            senderAlias: { name: senderAlias.name, color: senderAlias.color },
            text
        });
        await notif.save();
        io.to(recipientId.toString()).emit('new_notification', notif);
    } catch (e) {
        console.error("Notif error", e);
    }
};

const deleteUserAndData = async (userId) => {
    const uid = new mongoose.Types.ObjectId(userId);

    // 1. Delete User
    await User.findByIdAndDelete(uid);

    // 2. Delete Posts by User
    await Post.deleteMany({ userId: uid });

    // 3. Delete Notifications received by User
    await Notification.deleteMany({ recipient: uid });

    // 4. Delete Reports made by User
    await Report.deleteMany({ reportedBy: uid });

    // 5. Delete Messages sent by User
    await Message.deleteMany({ senderId: uid });

    // 6. Remove likes/dislikes from all Posts
    await Post.updateMany({}, {
        $pull: {
            likedBy: uid,
            dislikedBy: uid
        }
    });

    // 7. Remove comments by User from all Posts (Deep Clean)
    const postsWithComments = await Post.find({ "comments.userId": uid });
    for (const p of postsWithComments) {
        p.comments = p.comments.filter(c => !c.userId.equals(uid));
        await p.save();
    }

    // 8. Remove replies by User from all Posts (Deep Clean)
    const postsWithReplies = await Post.find({ "comments.replies.userId": uid });
    for (const p of postsWithReplies) {
        p.comments.forEach(c => {
            if (c.replies) {
                c.replies = c.replies.filter(r => !r.userId.equals(uid));
            }
        });
        await p.save();
    }

    // 9. Close/Leave Chats
    const chats = await Chat.find({ participants: uid });
    for (const chat of chats) {
        chat.isActive = false;
        await chat.save();
        chat.participants.forEach(pId => {
            io.to(pId.toString()).emit('chat_ended');
        });
    }
};

// --- Auth Endpoints ---

app.post('/api/auth/login', async (req, res) => {
    const { userId } = req.body;

    try {
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid ID format" });
            }
            let user = await User.findById(userId);
            if (!user) {
                if (userId === ADMIN_ID) {
                    user = new User({ _id: userId, isAdmin: true, acceptedTOS: true });
                    await user.save();
                } else {
                    return res.status(404).json({ error: "User ID not found" });
                }
            }
            return res.json(user);
        } else {
            const user = new User({ acceptedTOS: true });
            await user.save();
            return res.status(201).json(user);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Auth error" });
    }
});

app.delete('/api/user/me', requireAuth, async (req, res) => {
    try {
        if (req.user.isAdmin) return res.status(400).json({ error: "Admin cannot delete self." });
        await deleteUserAndData(req.user._id);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

// --- Feedback & Changelog Endpoints ---

app.post('/api/feedback', requireAuth, async (req, res) => {
    const { content, type } = req.body;
    try {
        const feedback = new Feedback({
            userId: req.user._id,
            content,
            type: type || 'feedback'
        });
        await feedback.save();
        res.status(201).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to submit" });
    }
});

app.get('/api/admin/feedback', requireAuth, requireMod, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
});

app.post('/api/admin/feedback/:id/delete', requireAuth, requireMod, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

app.get('/api/changelog', async (req, res) => {
    try {
        const logs = await Changelog.find().sort({ date: -1 });
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

app.post('/api/admin/changelog', requireAuth, requireAdmin, async (req, res) => {
    const { version, content } = req.body;
    try {
        const log = new Changelog({ version, content });
        await log.save();
        res.json(log);
    } catch (e) {
        res.status(500).json({ error: "Failed to create log" });
    }
});

app.delete('/api/admin/changelog/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await Changelog.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete log" });
    }
});

// --- Notification Endpoints ---
app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to read" });
    }
});

app.post('/api/notifications/read-all', requireAuth, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed" });
    }
});

// --- Admin Endpoints --- 
app.get('/api/admin/stats', requireAuth, requireMod, async (req, res) => {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const reportCount = await Report.countDocuments();
    res.json({ userCount, postCount, reportCount });
});
app.get('/api/admin/users', requireAuth, requireMod, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.json(users);
});
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: "Cannot delete self" });
        }
        await deleteUserAndData(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Delete failed" });
    }
});
app.get('/api/admin/users/:id/history', requireAuth, requireMod, async (req, res) => {
    try {
        const userId = req.params.id;
        const posts = await Post.find({ userId }).sort({ createdAt: -1 });
        const comments = await Post.aggregate([
            { $unwind: '$comments' },
            { $match: { 'comments.userId': new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    _id: '$comments._id',
                    content: '$comments.content',
                    createdAt: '$comments.createdAt',
                    postId: '$_id',
                    postContent: '$content'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json({ posts, comments });
    } catch (e) {
        res.status(500).json({ error: "Fetch history failed" });
    }
});
app.post('/api/admin/users/:id/action', requireAuth, requireAdmin, async (req, res) => {
    const { action } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (action === 'ban') targetUser.isBanned = true;
    if (action === 'unban') targetUser.isBanned = false;
    if (action === 'timeout') {
        targetUser.isTimedOut = true;
        targetUser.timeoutUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    if (action === 'remove_timeout') {
        targetUser.isTimedOut = false;
        targetUser.timeoutUntil = null;
    }
    if (action === 'promote_mod') targetUser.isModerator = true;
    if (action === 'demote_mod') targetUser.isModerator = false;

    await targetUser.save();
    res.json(targetUser);
});
app.get('/api/admin/reports', requireAuth, requireMod, async (req, res) => {
    try {
        const reports = await Report.find().populate('reportedBy', '_id').sort({ createdAt: -1 }).lean();

        // Enrich reports with content snapshot
        const enrichedReports = await Promise.all(reports.map(async (r) => {
            let contentSnapshot = "Content not found";

            if (r.targetType === 'post') {
                const post = await Post.findById(r.targetId, 'content');
                if (post) contentSnapshot = post.content;
            } else if (r.targetType === 'comment') {
                const post = await Post.findOne({ "comments._id": r.targetId }, { "comments.$": 1 });
                if (post && post.comments && post.comments[0]) {
                    contentSnapshot = post.comments[0].content;
                }
            } else if (r.targetType === 'chat') {
                contentSnapshot = "Encrypted/Ephemeral Chat Session";
            }

            return { ...r, contentSnapshot };
        }));

        res.json(enrichedReports);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error fetching reports" });
    }
});
app.post('/api/admin/reports/:id/resolve', requireAuth, requireMod, async (req, res) => {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- Post Endpoints ---

app.get('/api/posts', async (req, res) => {
    const { sort = 'newest', tag, offset = 0, limit = 10 } = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);

    try {
        let query = { isHidden: false };
        if (tag) query.tags = `#${tag}`;

        let sortQuery = {};
        if (sort === 'newest') sortQuery.createdAt = -1;
        else if (sort === 'hot' || sort === 'top') sortQuery.likes = -1;

        let posts = await Post.find(query).sort(sortQuery).limit(parsedLimit + parsedOffset).lean();

        const userId = req.headers['x-user-id'];
        if (userId) {
            posts = posts.map(p => ({
                ...p,
                hasLiked: p.likedBy && p.likedBy.some(id => id.toString() === userId),
                hasDisliked: p.dislikedBy && p.dislikedBy.some(id => id.toString() === userId)
            }));
        }

        const paginatedPosts = posts.slice(parsedOffset, parsedOffset + parsedLimit);
        res.json({ posts: paginatedPosts, hasMore: posts.length > (parsedOffset + parsedLimit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

app.get('/api/my-posts', requireAuth, async (req, res) => {
    const posts = await Post.find({ userId: req.user._id, isHidden: false }).sort({ createdAt: -1 });
    res.json(posts);
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    // Mods can delete, Admins can delete, Owners can delete
    let query;
    if (req.user.isAdmin || req.user.isModerator) {
        query = { _id: req.params.id };
    } else {
        query = { _id: req.params.id, userId: req.user._id };
    }

    const post = await Post.findOneAndDelete(query);
    if (!post) return res.status(404).json({ error: "Not found or authorized" });
    io.emit('remove_post', { postId: post._id });
    res.json({ success: true });
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
    const cleanedContent = safeClean(req.body.content.trim());
    const post = await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { content: cleanedContent }, { new: true });
    io.emit('update_post', post);
    res.json(post);
});

app.post('/api/posts', requireAuth, async (req, res) => {
    const { content, tags, type, pollOptions } = req.body;
    if (!content || content.trim().length === 0) return res.status(400).json({ error: 'Empty content.' });

    try {
        const cleanedContent = safeClean(content.trim());
        let processedPollOptions = [];
        if (type === 'poll' && Array.isArray(pollOptions)) {
            processedPollOptions = pollOptions.map(opt => ({ text: safeClean(opt.text), votes: [] }));
        }

        const post = new Post({
            content: cleanedContent,
            tags: tags || [],
            userId: req.user._id,
            alias: generateUsername(),
            type: type === 'poll' ? 'poll' : 'text',
            pollOptions: processedPollOptions
        });

        const savedPost = await post.save();
        io.emit('new_post', savedPost.toObject());
        res.status(201).json(savedPost);
    } catch (error) { res.status(500).json({ error: "Error creating post" }); }
});

app.post('/api/posts/:postId/vote', requireAuth, async (req, res) => {
    const { postId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const hasVoted = post.pollOptions.some(opt => opt.votes.includes(userId));
        if (hasVoted) return res.status(400).json({ error: "Already voted" });

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId },
            { $addToSet: { [`pollOptions.${optionIndex}.votes`]: userId } },
            { new: true }
        );
        io.emit('update_post', updatedPost);
        res.json({ success: true, post: updatedPost });
    } catch (e) { res.status(500).json({ error: "Vote failed" }); }
});

app.post('/api/posts/:postId/reaction', requireAuth, async (req, res) => {
    const { postId } = req.params;
    const { reactionType } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Check using string comparison for accurate existing check
        const hasLiked = post.likedBy.some(id => id.toString() === userId.toString());
        const hasDisliked = post.dislikedBy.some(id => id.toString() === userId.toString());

        let update = {};

        if (reactionType === 'like') {
            if (hasLiked) {
                // Unlike
                update = { $inc: { likes: -1 }, $pull: { likedBy: userId } };
            } else {
                // Like (and remove dislike if exists)
                update = {
                    $inc: { likes: 1, dislikes: hasDisliked ? -1 : 0 },
                    $addToSet: { likedBy: userId },
                    $pull: { dislikedBy: userId }
                };
            }
        } else if (reactionType === 'dislike') {
            if (hasDisliked) {
                // Undislike
                update = { $inc: { dislikes: -1 }, $pull: { dislikedBy: userId } };
            } else {
                // Dislike (and remove like if exists)
                update = {
                    $inc: { dislikes: 1, likes: hasLiked ? -1 : 0 },
                    $addToSet: { dislikedBy: userId },
                    $pull: { likedBy: userId }
                };
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true }).lean();

        // Populate flags for client
        updatedPost.hasLiked = updatedPost.likedBy.some(id => id.toString() === userId.toString());
        updatedPost.hasDisliked = updatedPost.dislikedBy.some(id => id.toString() === userId.toString());

        io.emit('update_post', updatedPost);

        // Notify Author on Like (only if just liked and NOT self-like)
        if (reactionType === 'like' && updatedPost.hasLiked && !post.userId.equals(userId)) {
            await createNotification(post.userId, 'like', post._id, { name: 'Someone', color: '#888' }, 'liked your post');
        }

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Reaction failed" });
    }
});

app.post('/api/posts/:postId/comment', requireAuth, async (req, res) => {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) return res.status(400).json({ error: "Empty comment" });
    const cleanedContent = safeClean(content.trim());

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Alias Logic
        let aliasToUse;
        if (post.userId.equals(userId)) {
            aliasToUse = post.alias;
        } else {
            const existingComment = post.comments.find(c => c.userId.equals(userId));
            // Also check nested replies for alias consistency
            const existingReply = post.comments.flatMap(c => c.replies).find(r => r.userId.equals(userId));

            if (existingComment) aliasToUse = existingComment.alias;
            else if (existingReply) aliasToUse = existingReply.alias;
            else aliasToUse = generateUsername();
        }

        let updatedPost;

        if (parentCommentId) {
            // Reply to comment
            updatedPost = await Post.findOneAndUpdate(
                { _id: postId, "comments._id": parentCommentId },
                {
                    $push: {
                        "comments.$.replies": {
                            content: cleanedContent,
                            userId: userId,
                            alias: aliasToUse,
                            createdAt: new Date()
                        }
                    }
                },
                { new: true }
            );

            // Notify original commenter if NOT self-reply
            const parentComment = post.comments.id(parentCommentId);
            if (parentComment && !parentComment.userId.equals(userId)) {
                await createNotification(parentComment.userId, 'reply', postId, aliasToUse, 'replied to your comment');
            }

        } else {
            // Top level comment
            const newComment = {
                _id: new mongoose.Types.ObjectId(),
                content: cleanedContent,
                userId: userId,
                alias: aliasToUse,
                replies: []
            };
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $push: { comments: { $each: [newComment], $position: 0 } } },
                { new: true }
            );

            // Notify Post Author if NOT self-comment
            if (!post.userId.equals(userId)) {
                await createNotification(post.userId, 'comment', postId, aliasToUse, 'commented on your post');
            }
        }

        io.emit('update_post', updatedPost);
        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: "Failed to comment" });
    }
});

app.post('/api/report', requireAuth, async (req, res) => {
    const { targetType, targetId, reason } = req.body;
    try {
        const report = new Report({
            targetType,
            targetId,
            reason,
            reportedBy: req.user._id
        });
        await report.save();
        res.status(201).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Report failed" });
    }
});

app.get('/api/tags/trending', async (req, res) => {
    try {
        const trendingTags = await Post.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            { $project: { _id: 0, tag: '$_id' } }
        ]);
        let tags = trendingTags.map(t => t.tag);
        res.json(tags);
    } catch (error) { res.status(500).json({ error: "Failed" }); }
});

// --- Chat Endpoints ---

app.get('/api/chat/status', requireAuth, async (req, res) => {
    const user = req.user;
    if (user.currentChatId) {
        const chat = await Chat.findById(user.currentChatId);
        if (chat && chat.isActive) {
            // Updated limit to 10
            const messages = await Message.find({ chatId: chat._id })
                .sort({ createdAt: -1 })
                .limit(10);

            return res.json({
                status: 'active',
                chatId: chat._id,
                messages: messages.reverse(),
                expiresAt: chat.expiresAt
            });
        } else {
            user.currentChatId = null;
            user.lookingForChat = false;
            await user.save();
        }
    }
    res.json({ status: user.lookingForChat ? 'scanning' : 'idle' });
});

app.post('/api/chat/opt-in', requireAuth, async (req, res) => {
    const user = req.user;
    if (user.currentChatId) return res.status(400).json({ error: "Already in chat" });

    user.lookingForChat = true;
    await user.save();

    const partner = await User.findOne({
        _id: { $ne: user._id },
        lookingForChat: true,
        currentChatId: null,
        isBanned: false,
        isTimedOut: false
    });

    if (partner) {
        const chat = new Chat({
            participants: [user._id, partner._id],
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
        });
        await chat.save();

        user.currentChatId = chat._id;
        user.lookingForChat = false;
        partner.currentChatId = chat._id;
        partner.lookingForChat = false;

        await user.save();
        await partner.save();

        io.to(user._id.toString()).emit('chat_matched', { chatId: chat._id, expiresAt: chat.expiresAt });
        io.to(partner._id.toString()).emit('chat_matched', { chatId: chat._id, expiresAt: chat.expiresAt });

        return res.json({ status: 'active', chatId: chat._id });
    }

    res.json({ status: 'scanning' });
});

app.post('/api/chat/message', requireAuth, async (req, res) => {
    const { content } = req.body;
    if (!req.user.currentChatId) return res.status(400).json({ error: "No active chat" });

    // Allow emojis, but filter bad words safely
    const cleanedContent = safeClean(content);

    const message = new Message({
        chatId: req.user.currentChatId,
        senderId: req.user._id,
        content: cleanedContent
    });
    await message.save();

    const chat = await Chat.findById(req.user.currentChatId);
    if (chat) {
        chat.participants.forEach(pId => {
            io.to(pId.toString()).emit('receive_message', message);
        });
    }

    res.json(message);
});

app.post('/api/chat/leave', requireAuth, async (req, res) => {
    if (req.user.currentChatId) {
        const chat = await Chat.findById(req.user.currentChatId);
        if (chat) {
            chat.isActive = false;
            await chat.save();

            chat.participants.forEach(async pId => {
                const u = await User.findById(pId);
                if (u) {
                    u.currentChatId = null;
                    u.lookingForChat = false;
                    await u.save();
                }
                io.to(pId.toString()).emit('chat_ended');
            });
        }
    } else {
        req.user.lookingForChat = false;
        await req.user.save();
    }
    res.json({ success: true });
});

io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
    });
});

server.listen(PORT, () => {
    console.log(`AnonSpace server running on http://localhost:${PORT}`);
});
