"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Proposal_1 = __importDefault(require("../models/Proposal"));
const Job_1 = __importDefault(require("../models/Job"));
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { jobId, coverLetter, bidAmount, estimatedDuration } = req.body;
        const job = await Job_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.status !== 'open') {
            res.status(400).json({ message: 'Job is not open for proposals' });
            return;
        }
        if (job.client.toString() === req.user._id) {
            res.status(400).json({ message: 'Cannot submit proposal to your own job' });
            return;
        }
        const existingProposal = await Proposal_1.default.findOne({
            job: jobId,
            freelancer: req.user._id,
        });
        if (existingProposal) {
            res.status(400).json({ message: 'You have already submitted a proposal for this job' });
            return;
        }
        const proposal = await Proposal_1.default.create({
            job: jobId,
            freelancer: req.user._id,
            client: job.client,
            coverLetter,
            bidAmount,
            estimatedDuration,
            status: 'pending',
        });
        res.status(201).json({ proposal });
    }
    catch (error) {
        next(error);
    }
});
router.get('/job/:jobId', auth_1.requireAuth, async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (job.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const proposals = await Proposal_1.default.find({ job: req.params.jobId })
            .populate('freelancer', 'username rating completedJobs')
            .sort({ createdAt: -1 });
        res.json({ proposals });
    }
    catch (error) {
        next(error);
    }
});
router.get('/my-proposals', auth_1.requireAuth, async (req, res, next) => {
    try {
        const proposals = await Proposal_1.default.find({ freelancer: req.user._id })
            .populate({
            path: 'job',
            select: 'title description budget status',
            populate: {
                path: 'client',
                select: 'username walletAddress rating',
            },
        })
            .sort({ createdAt: -1 });
        res.json({ proposals });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { coverLetter, bidAmount, estimatedDuration } = req.body;
        const proposal = await Proposal_1.default.findById(req.params.id);
        if (!proposal) {
            res.status(404).json({ message: 'Proposal not found' });
            return;
        }
        if (proposal.freelancer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (proposal.status !== 'pending') {
            res.status(400).json({ message: 'Cannot update a non-pending proposal' });
            return;
        }
        proposal.coverLetter = coverLetter || proposal.coverLetter;
        proposal.bidAmount = bidAmount || proposal.bidAmount;
        proposal.estimatedDuration = estimatedDuration || proposal.estimatedDuration;
        await proposal.save();
        res.json({ proposal });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        const proposal = await Proposal_1.default.findById(req.params.id);
        if (!proposal) {
            res.status(404).json({ message: 'Proposal not found' });
            return;
        }
        if (proposal.freelancer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (proposal.status !== 'pending') {
            res.status(400).json({ message: 'Cannot delete a non-pending proposal' });
            return;
        }
        await proposal.deleteOne();
        res.json({ message: 'Proposal deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=proposal.js.map