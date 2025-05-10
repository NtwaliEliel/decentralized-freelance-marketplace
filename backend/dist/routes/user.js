"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Job_1 = __importDefault(require("../models/Job"));
const Proposal_1 = __importDefault(require("../models/Proposal"));
const router = express_1.default.Router();
router.post('/auth', auth_1.verifySignature, async (req, res) => {
    res.json({ user: req.user });
});
router.get('/me', auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/me', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { username, email, bio, skills, hourlyRate } = req.body;
        if (username && username !== req.user.username) {
            const existingUser = await User_1.default.findOne({ username });
            if (existingUser) {
                res.status(400).json({ message: 'Username already taken' });
                return;
            }
        }
        const user = await User_1.default.findByIdAndUpdate(req.user._id, {
            username,
            email,
            bio,
            skills,
            hourlyRate,
        }, { new: true }).select('-password');
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
router.get('/jobs', auth_1.requireAuth, async (req, res, next) => {
    try {
        const query = req.user.role === 'freelancer'
            ? { freelancer: req.user._id }
            : { client: req.user._id };
        const jobs = await Job_1.default.find(query)
            .sort({ createdAt: -1 })
            .populate('client', 'username')
            .populate('freelancer', 'username');
        res.json({ jobs });
    }
    catch (error) {
        next(error);
    }
});
router.get('/proposals', auth_1.requireAuth, async (req, res, next) => {
    try {
        const proposals = await Proposal_1.default.find({ freelancer: req.user._id })
            .sort({ createdAt: -1 })
            .populate('job', 'title budget')
            .populate('client', 'username');
        res.json({ proposals });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map