"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Job_1 = __importDefault(require("../models/Job"));
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const jobs = await Job_1.default.find().sort({ createdAt: -1 });
        return res.json(jobs);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching jobs', error });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.json(job);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching job', error });
    }
});
router.post('/', async (req, res) => {
    try {
        const jobData = {
            title: req.body.title,
            description: req.body.description,
            budget: req.body.budget,
            deadline: new Date(req.body.deadline),
            client: req.body.client,
            skills: req.body.skills,
        };
        const job = new Job_1.default(jobData);
        await job.save();
        return res.status(201).json(job);
    }
    catch (error) {
        return res.status(400).json({ message: 'Error creating job', error });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const allowedUpdates = ['title', 'description', 'budget', 'deadline', 'skills', 'status', 'freelancer'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        updates.forEach(update => {
            if (update === 'deadline') {
                job[update] = new Date(req.body[update]);
            }
            else {
                job[update] = req.body[update];
            }
        });
        await job.save();
        return res.json(job);
    }
    catch (error) {
        return res.status(400).json({ message: 'Error updating job', error });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.deleteOne();
        return res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error deleting job', error });
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map