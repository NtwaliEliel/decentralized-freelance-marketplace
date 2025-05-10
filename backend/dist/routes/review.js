"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Review_1 = __importDefault(require("../models/Review"));
const Contract_1 = __importDefault(require("../models/Contract"));
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { contractId, rating, comment } = req.body;
        const contract = await Contract_1.default.findById(contractId)
            .populate('client')
            .populate('freelancer');
        if (!contract) {
            res.status(404).json({ message: 'Contract not found' });
            return;
        }
        if (contract.status !== 'completed') {
            res.status(400).json({ message: 'Cannot review an incomplete contract' });
            return;
        }
        if (contract.client.toString() !== req.user._id &&
            contract.freelancer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const existingReview = await Review_1.default.findOne({
            contract: contractId,
            reviewer: req.user._id,
        });
        if (existingReview) {
            res.status(400).json({ message: 'You have already reviewed this contract' });
            return;
        }
        const reviewee = contract.client.toString() === req.user._id
            ? contract.freelancer
            : contract.client;
        const review = await Review_1.default.create({
            contract: contractId,
            reviewer: req.user._id,
            reviewee,
            rating,
            comment,
        });
        res.status(201).json({ review });
    }
    catch (error) {
        next(error);
    }
});
router.get('/user/:userId', auth_1.requireAuth, async (req, res, next) => {
    try {
        const reviews = await Review_1.default.find({ reviewee: req.params.userId })
            .populate('reviewer', 'username')
            .populate('contract', 'title')
            .sort({ createdAt: -1 });
        res.json({ reviews });
    }
    catch (error) {
        next(error);
    }
});
router.get('/contract/:contractId', auth_1.requireAuth, async (req, res, next) => {
    try {
        const contract = await Contract_1.default.findById(req.params.contractId);
        if (!contract) {
            res.status(404).json({ message: 'Contract not found' });
            return;
        }
        if (contract.client.toString() !== req.user._id &&
            contract.freelancer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const reviews = await Review_1.default.find({ contract: req.params.contractId })
            .populate('reviewer', 'username')
            .populate('reviewee', 'username')
            .sort({ createdAt: -1 });
        res.json({ reviews });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review_1.default.findById(req.params.id);
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        if (review.reviewer.toString() !== req.user._id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();
        res.json({ review });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=review.js.map