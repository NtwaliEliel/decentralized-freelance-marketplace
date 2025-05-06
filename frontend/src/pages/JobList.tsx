import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  client: {
    address: string;
    rating: number;
  };
  createdAt: string;
}

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minBudget: '',
    maxBudget: '',
    skills: [] as string[],
  });

  useEffect(() => {
    // TODO: Fetch jobs from the backend
    const fetchJobs = async () => {
      try {
        // const response = await axios.get('/api/jobs');
        // setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesBudget = (!filters.minBudget || job.budget >= Number(filters.minBudget)) &&
      (!filters.maxBudget || job.budget <= Number(filters.maxBudget));
    const matchesSkills = filters.skills.length === 0 ||
      filters.skills.every(skill => job.skills.includes(skill));

    return matchesSearch && matchesBudget && matchesSkills;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <input
            type="number"
            placeholder="Min Budget"
            className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
            value={filters.minBudget}
            onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max Budget"
            className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
            value={filters.maxBudget}
            onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
          />
          <select
            multiple
            className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
            value={filters.skills}
            onChange={(e) => setFilters({
              ...filters,
              skills: Array.from(e.target.selectedOptions, option => option.value)
            })}
          >
            <option value="web3">Web3</option>
            <option value="solidity">Solidity</option>
            <option value="react">React</option>
            <option value="node">Node.js</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  ${job.budget}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            No jobs found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobList; 