"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Contract_1 = __importDefault(require("../models/Contract"));
const Job_1 = __importDefault(require("../models/Job"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { jobId, freelancerId, amount } = req.body;
        const job = await Job_1.default.findById(jobId)
            .populate('client', 'walletAddress')
            .populate('freelancer', 'walletAddress');
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        if (!job.freelancer) {
            res.status(400).json({ message: 'Job has no assigned freelancer' });
            return;
        }
        if (job.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (job.freelancer.toString() !== freelancerId) {
            res.status(400).json({ message: 'Invalid freelancer' });
            return;
        }
        const freelancer = await User_1.default.findById(freelancerId);
        if (!freelancer) {
            res.status(404).json({ message: 'Freelancer not found' });
            return;
        }
        const contract = await Contract_1.default.create({
            job: jobId,
            client: req.user._id,
            freelancer: freelancerId,
            amount,
            status: 'pending',
            contractAddress: '',
        });
        res.status(201).json({ contract });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        const contract = await Contract_1.default.findById(req.params.id)
            .populate('job', 'title description')
            .populate('client', 'username')
            .populate('freelancer', 'username');
        if (!contract) {
            res.status(404).json({ message: 'Contract not found' });
            return;
        }
        if (contract.client.toString() !== req.user._id && contract.freelancer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        res.json({ contract });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/release', auth_1.requireAuth, async (req, res, next) => {
    try {
        const contract = await Contract_1.default.findById(req.params.id)
            .populate('job')
            .populate('client', 'walletAddress')
            .populate('freelancer', 'walletAddress');
        if (!contract) {
            res.status(404).json({ message: 'Contract not found' });
            return;
        }
        if (contract.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (contract.status !== 'pending') {
            res.status(400).json({ message: 'Contract is not in pending status' });
            return;
        }
        contract.status = 'completed';
        await contract.save();
        await Job_1.default.findByIdAndUpdate(contract.job, { status: 'completed' });
        res.json({ contract });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/refund', auth_1.requireAuth, async (req, res, next) => {
    try {
        const contract = await Contract_1.default.findById(req.params.id)
            .populate('job')
            .populate('client', 'walletAddress')
            .populate('freelancer', 'walletAddress');
        if (!contract) {
            res.status(404).json({ message: 'Contract not found' });
            return;
        }
        if (contract.client.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (contract.status !== 'pending') {
            res.status(400).json({ message: 'Contract is not in pending status' });
            return;
        }
        contract.status = 'refunded';
        await contract.save();
        await Job_1.default.findByIdAndUpdate(contract.job, { status: 'cancelled' });
        res.json({ contract });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=contract.js.map