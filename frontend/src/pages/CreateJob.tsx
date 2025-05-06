import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

interface JobFormData {
  title: string;
  description: string;
  budget: string;
  skills: string[];
  deadline: string;
}

const CreateJob: React.FC = () => {
  const { account } = useWeb3React();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    budget: '',
    skills: [],
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement job creation with smart contract
      // const tx = await jobContract.createJob(
      //   formData.title,
      //   formData.description,
      //   ethers.utils.parseEther(formData.budget),
      //   formData.skills,
      //   new Date(formData.deadline).getTime()
      // );
      // await tx.wait();
      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, skills: selectedSkills });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Post a New Job
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Job Title
          </label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Job Description
          </label>
          <textarea
            id="description"
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Budget (ETH)
          </label>
          <input
            type="number"
            id="budget"
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Required Skills
          </label>
          <select
            id="skills"
            multiple
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            value={formData.skills}
            onChange={handleSkillChange}
          >
            <option value="web3">Web3</option>
            <option value="solidity">Solidity</option>
            <option value="react">React</option>
            <option value="node">Node.js</option>
            <option value="typescript">TypeScript</option>
            <option value="blockchain">Blockchain</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !account}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
            loading || !account
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {loading ? 'Creating Job...' : 'Create Job'}
        </button>

        {!account && (
          <p className="text-red-500 text-center">
            Please connect your wallet to create a job
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateJob; 