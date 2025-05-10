"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Job_1 = __importDefault(require("../models/Job"));
const Proposal_1 = __importDefault(require("../models/Proposal"));
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { title, description, budget, category, skills, deadline, escrowAmount, } = req.body;
        const job = await Job_1.default.create({
            title,
            description,
            budget,
            client: req.user._id,
            category,
            skills,
            deadline,
            escrowAmount,
        });
        res.status(201).json({ job });
    }
    catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const { category, minBudget, maxBudget, skills, status, search, page = 1, limit = 10, } = req.query;
        const query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget)
                query.budget.$gte = Number(minBudget);
            if (maxBudget)
                query.budget.$lte = Number(maxBudget);
        }
        if (skills) {
            query.skills = { $in: skills.split(',') };
        }
        if (search) {
            query.$text = { $search: search };
        }
        const jobs = await Job_1.default.find(query)
            .populate('client', 'username')
            .populate('freelancer', 'username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = await Job_1.default.countDocuments(query);
        res.json({
            jobs,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id)
            .populate('client', 'username')
            .populate('freelancer', 'username');
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        let proposals = [];
        if (req.user && req.user._id === job.client.toString()) {
            proposals = await Proposal_1.default.find({ job: job._id })
                .populate('freelancer', 'username rating completedJobs');
        }
        res.json({ job, proposals });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/status', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { status } = req.body;
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        job.status = status;
        await job.save();
        res.json({ job });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/assign', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { freelancerId } = req.body;
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        job.freelancer = freelancerId;
        job.status = 'in_progress';
        await job.save();
        res.json({ job });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=job.js.map