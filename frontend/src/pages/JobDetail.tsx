import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

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
  deadline: string;
  status: 'open' | 'in_progress' | 'completed';
}

interface Proposal {
  id: string;
  freelancer: {
    address: string;
    rating: number;
  };
  coverLetter: string;
  bid: number;
  estimatedTime: string;
  createdAt: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWeb3React();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    bid: '',
    estimatedTime: '',
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // TODO: Fetch job details from the backend
        // const response = await axios.get(`/api/jobs/${id}`);
        // setJob(response.data.job);
        // setProposals(response.data.proposals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Implement proposal submission with smart contract
      // const tx = await jobContract.submitProposal(
      //   id,
      //   proposalData.coverLetter,
      //   ethers.utils.parseEther(proposalData.bid),
      //   proposalData.estimatedTime
      // );
      // await tx.wait();
      setShowProposalForm(false);
      // Refresh proposals
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Job not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Job Details */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {job.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Posted by {job.client.address.slice(0, 6)}...{job.client.address.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${job.budget}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Description
          </h2>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Required Skills
          </h2>
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

        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300">
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </p>
          {account && job.status === 'open' && (
            <button
              onClick={() => setShowProposalForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Submit Proposal
            </button>
          )}
        </div>
      </div>

      {/* Proposals */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Proposals ({proposals.length})
        </h2>

        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="border-b dark:border-gray-700 last:border-0 py-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {proposal.freelancer.address.slice(0, 6)}...
                  {proposal.freelancer.address.slice(-4)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Rating: {proposal.freelancer.rating}/5
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ${proposal.bid}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Est. Time: {proposal.estimatedTime}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {proposal.coverLetter}
            </p>
          </div>
        ))}

        {proposals.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300 text-center py-6">
            No proposals yet
          </p>
        )}
      </div>

      {/* Proposal Form Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Submit Proposal
            </h2>
            <form onSubmit={handleSubmitProposal} className="space-y-6">
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={proposalData.coverLetter}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, coverLetter: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="bid"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Bid (ETH)
                </label>
                <input
                  type="number"
                  id="bid"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={proposalData.bid}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, bid: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="estimatedTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Estimated Time
                </label>
                <input
                  type="text"
                  id="estimatedTime"
                  required
                  placeholder="e.g., 2 weeks"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={proposalData.estimatedTime}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, estimatedTime: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowProposalForm(false)}
                  className="px-6 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail; 