"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Notification_1 = __importDefault(require("../models/Notification"));
const router = express_1.default.Router();
router.get('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const notifications = await Notification_1.default.find({ recipient: req.user._id })
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
        res.json({ notifications });
    }
    catch (error) {
        next(error);
    }
});
router.get('/unread', auth_1.requireAuth, async (req, res, next) => {
    try {
        const count = await Notification_1.default.countDocuments({
            recipient: req.user._id,
            read: false,
        });
        res.json({ count });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/read', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { notificationIds } = req.body;
        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            res.status(400).json({ message: 'Invalid notification IDs' });
            return;
        }
        const notifications = await Notification_1.default.find({
            _id: { $in: notificationIds },
            recipient: req.user._id,
        });
        if (notifications.length !== notificationIds.length) {
            res.status(403).json({ message: 'Not authorized to mark some notifications as read' });
            return;
        }
        await Notification_1.default.updateMany({ _id: { $in: notificationIds } }, { $set: { read: true } });
        res.json({ message: 'Notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/read-all', auth_1.requireAuth, async (req, res, next) => {
    try {
        await Notification_1.default.updateMany({
            recipient: req.user._id,
            read: false,
        }, { $set: { read: true } });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { notificationIds } = req.body;
        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            res.status(400).json({ message: 'Invalid notification IDs' });
            return;
        }
        const notifications = await Notification_1.default.find({
            _id: { $in: notificationIds },
            recipient: req.user._id,
        });
        if (notifications.length !== notificationIds.length) {
            res.status(403).json({ message: 'Not authorized to delete some notifications' });
            return;
        }
        await Notification_1.default.deleteMany({ _id: { $in: notificationIds } });
        res.json({ message: 'Notifications deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/delete-all', auth_1.requireAuth, async (req, res, next) => {
    try {
        await Notification_1.default.deleteMany({ recipient: req.user._id });
        res.json({ message: 'All notifications deleted' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notification.js.map