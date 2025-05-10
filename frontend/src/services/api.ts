import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  client: string;
  freelancer?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export const jobService = {
  // Get all jobs
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs');
    return response.data;
  },

  // Get a single job
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create a new job
  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update a job
  updateJob: async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete a job
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};

export default api; 