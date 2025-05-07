import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

interface Job {
  id: number;
  title: string;
  description: string;
  budget: string;
  deadline: number;
  client: string;
  isActive: boolean;
}

const Jobs: React.FC = () => {
  const { jobContract } = useWeb3();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    const fetchJobs = async () => {
      if (!jobContract) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      try {
        // In a real implementation, you would have a function to get all jobs
        // For now, we'll simulate with a few jobs
        const jobIds = [1, 2, 3]; // This would come from a contract function
        const jobsData = await Promise.all(
          jobIds.map(async (id) => {
            const job = await jobContract.getJob(id);
            return {
              id,
              title: job.title,
              description: job.description,
              budget: ethers.utils.formatEther(job.budget),
              deadline: job.deadline.toNumber(),
              client: job.client,
              isActive: job.isActive,
            };
          })
        );

        setJobs(jobsData);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [jobContract]);

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'active') return job.isActive;
    if (filter === 'completed') return !job.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Jobs</h1>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Jobs</option>
            <option value="active">Active Jobs</option>
            <option value="completed">Completed Jobs</option>
          </select>
          <Link
            to="/create-job"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Post a Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {job.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{ethers.utils.formatEther(job.budget)} ETH</span>
                <span>
                  {new Date(job.deadline * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
        </div>
      )}
    </div>
  );
};

export default Jobs; 