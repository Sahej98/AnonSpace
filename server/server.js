
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

// DB Models
const User = require('./models/User');
const Post = require('./models/Post');
const Report = require('./models/Report');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const filter = new Filter();
const PORT = process.env.PORT || 3001;
const ADMIN_ID = '111111111111111111111111'; // Hardcoded Admin ID

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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

// --- Admin Endpoints ---

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        const reportCount = await Report.countDocuments();
        res.json({ userCount, postCount, reportCount });
    } catch (e) {
        res.status(500).json({ error: "Stats failed" });
    }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(50);
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: "Fetch users failed" });
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

    await targetUser.save();
    res.json(targetUser);
});

app.get('/api/admin/reports', requireAuth, requireAdmin, async (req, res) => {
    try {
        const reports = await Report.find().populate('reportedBy', '_id').sort({ createdAt: -1 });
        res.json(reports);
    } catch (e) {
        res.status(500).json({ error: "Fetch reports failed" });
    }
});

app.post('/api/admin/reports/:id/resolve', requireAuth, requireAdmin, async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Resolve failed" });
    }
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
        else if (sort === 'top') sortQuery.likes = -1;

        let posts = await Post.find(query).sort(sortQuery).limit(parsedLimit + parsedOffset).lean();

        const paginatedPosts = posts.slice(parsedOffset, parsedOffset + parsedLimit);
        res.json({ posts: paginatedPosts, hasMore: posts.length > (parsedOffset + parsedLimit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

app.get('/api/my-posts', requireAuth, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user._id, isHidden: false }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch your posts" });
    }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const query = req.user.isAdmin ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
        const post = await Post.findOneAndDelete(query);
        if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
        io.emit('remove_post', { postId: post._id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content.trim()) return res.status(400).json({ error: "Content empty" });

        const cleanedContent = filter.clean(content.trim());
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { content: cleanedContent },
            { new: true }
        );
        if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
        io.emit('update_post', post);
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.post('/api/posts', requireAuth, async (req, res) => {
    const { content, tags, type, pollOptions } = req.body;
    if (!content || content.trim().length === 0) return res.status(400).json({ error: 'Post content cannot be empty.' });

    try {
        const cleanedContent = filter.clean(content.trim());

        // Process Poll Options if valid
        let processedPollOptions = [];
        if (type === 'poll' && Array.isArray(pollOptions)) {
            processedPollOptions = pollOptions.map(opt => ({
                text: filter.clean(opt.text),
                votes: []
            }));
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create post" });
    }
});

app.post('/api/posts/:postId/vote', requireAuth, async (req, res) => {
    const { postId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post || post.type !== 'poll') return res.status(404).json({ error: "Post not found" });

        // Check if user already voted
        const alreadyVoted = post.pollOptions.some(opt => opt.votes.includes(userId));
        if (alreadyVoted) return res.status(400).json({ error: "Already voted" });

        if (optionIndex < 0 || optionIndex >= post.pollOptions.length) return res.status(400).json({ error: "Invalid option" });

        post.pollOptions[optionIndex].votes.push(userId);
        await post.save();

        io.emit('update_post', post);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Vote failed" });
    }
});

app.post('/api/posts/:postId/reaction', requireAuth, async (req, res) => {
    const { postId } = req.params;
    try {
        const update = { $inc: { likes: 1 } };
        const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true }).lean();
        if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
        io.emit('update_post', updatedPost);
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: "Failed to add reaction" });
    }
});

app.post('/api/posts/:postId/comment', requireAuth, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) return res.status(400).json({ error: "Empty comment" });

    const cleanedContent = filter.clean(content.trim());

    const newComment = {
        _id: new mongoose.Types.ObjectId(),
        content: cleanedContent,
        userId: req.user._id,
        alias: generateUsername(),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: { $each: [newComment], $position: 0 } } },
            { new: true }
        ).lean();

        if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
        io.emit('update_post', updatedPost);
        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment" });
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
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const trendingTags = await Post.aggregate([
            { $match: { createdAt: { $gte: oneDayAgo }, isHidden: false } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 4 },
            { $project: { _id: 0, tag: '$_id' } }
        ]);

        let tags = trendingTags.map(t => t.tag);
        if (tags.length === 0) tags = ["#Exams", "#Crush", "#DormLife", "#Stress"];
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trending tags" });
    }
});

// --- Chat Endpoints ---

app.get('/api/chat/status', requireAuth, async (req, res) => {
    const user = req.user;
    if (user.currentChatId) {
        const chat = await Chat.findById(user.currentChatId);
        if (chat && chat.isActive) {
            const messages = await Message.find({ chatId: chat._id })
                .sort({ createdAt: -1 })
                .limit(5);

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

    const cleanedContent = filter.clean(content);

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

// --- Socket Connection ---
io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
    });
});

server.listen(PORT, () => {
    console.log(`AnonSpace server running on http://localhost:${PORT}`);
});
