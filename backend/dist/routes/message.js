"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const Job_1 = __importDefault(require("../models/Job"));
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    var _a;
    try {
        const { jobId, content } = req.body;
        const job = await Job_1.default.findById(jobId)
            .populate('client')
            .populate('freelancer');
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.client.toString() !== req.user._id &&
            ((_a = job.freelancer) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const recipient = job.client.toString() === req.user._id
            ? job.freelancer
            : job.client;
        if (!recipient) {
            res.status(400).json({ message: 'No recipient found' });
            return;
        }
        const message = await Message_1.default.create({
            job: jobId,
            sender: req.user._id,
            recipient,
            content,
        });
        res.status(201).json({ message });
    }
    catch (error) {
        next(error);
    }
});
router.get('/job/:jobId', auth_1.requireAuth, async (req, res, next) => {
    var _a;
    try {
        const job = await Job_1.default.findById(req.params.jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.client.toString() !== req.user._id &&
            ((_a = job.freelancer) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const messages = await Message_1.default.find({ job: req.params.jobId })
            .populate('sender', 'username')
            .populate('recipient', 'username')
            .sort({ createdAt: -1 });
        res.json({ messages });
    }
    catch (error) {
        next(error);
    }
});
router.get('/unread', auth_1.requireAuth, async (req, res, next) => {
    try {
        const count = await Message_1.default.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });
        res.json({ count });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/read', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { messageIds } = req.body;
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            res.status(400).json({ message: 'Invalid message IDs' });
            return;
        }
        const messages = await Message_1.default.find({
            _id: { $in: messageIds },
            recipient: req.user._id,
        });
        if (messages.length !== messageIds.length) {
            res.status(403).json({ message: 'Not authorized to mark some messages as read' });
            return;
        }
        await Message_1.default.updateMany({ _id: { $in: messageIds } }, { $set: { isRead: true } });
        res.json({ message: 'Messages marked as read' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=message.js.map