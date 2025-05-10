import express from 'express';
import Job, { IJob } from '../models/Job';

const router = express.Router();

// Get all jobs
router.get('/', async (_req, res) => {
  try {
    console.log('Fetching all jobs...');
    const jobs = await Job.find().sort({ createdAt: -1 });
    console.log('Found jobs:', jobs.length);
    return res.json(jobs);
  } catch (error) {
    console.error('Error in GET /jobs:', error);
    return res.status(500).json({ 
      message: 'Error fetching jobs', 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Get a single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching job', error });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  try {
    const jobData: Partial<IJob> = {
      title: req.body.title,
      description: req.body.description,
      budget: req.body.budget,
      deadline: new Date(req.body.deadline),
      client: req.body.client,
      skills: req.body.skills,
    };

    const job = new Job(jobData);
    await job.save();
    return res.status(201).json(job);
  } catch (error) {
    return res.status(400).json({ message: 'Error creating job', error });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'description', 'budget', 'deadline', 'skills', 'status', 'freelancer'] as const;
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key as typeof allowedUpdates[number]));
    
    updates.forEach(update => {
      if (update === 'deadline') {
        (job as any)[update] = new Date(req.body[update]);
      } else {
        (job as any)[update] = req.body[update];
      }
    });

    await job.save();
    return res.json(job);
  } catch (error) {
    return res.status(400).json({ message: 'Error updating job', error });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    return res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting job', error });
  }
});

export default router; 