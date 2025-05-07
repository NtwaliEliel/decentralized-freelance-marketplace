import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';

interface Proposal {
  freelancer: string;
  proposal: string;
  bidAmount: string;
  isAccepted: boolean;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobContract } = useWeb3();
  const { account } = useWeb3React();
  const [job, setJob] = useState<any>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposalForm, setProposalForm] = useState({
    proposal: '',
    bidAmount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobContract || !id) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      try {
        const jobData = await jobContract.getJob(id);
        const proposalsData = await jobContract.getProposals(id);

        setJob({
          ...jobData,
          budget: ethers.utils.formatEther(jobData.budget),
          deadline: jobData.deadline.toNumber(),
        });

        setProposals(
          proposalsData.map((p: any) => ({
            freelancer: p.freelancer,
            proposal: p.proposal,
            bidAmount: ethers.utils.formatEther(p.bidAmount),
            isAccepted: p.isAccepted,
          }))
        );
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobContract, id]);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobContract || !account) {
      setError('Please connect your wallet');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bidAmount = ethers.utils.parseEther(proposalForm.bidAmount);
      const tx = await jobContract.submitProposal(
        id,
        proposalForm.proposal,
        bidAmount
      );
      await tx.wait();
      navigate('/jobs');
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptProposal = async (freelancerAddress: string) => {
    if (!jobContract || !account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      const tx = await jobContract.acceptProposal(id, freelancerAddress);
      await tx.wait();
      navigate('/jobs');
    } catch (err: any) {
      console.error('Error accepting proposal:', err);
      setError(err.message || 'Failed to accept proposal');
    }
  };

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

  if (!job) {
    return <div>Job not found</div>;
  }

  const isClient = account?.toLowerCase() === job.client.toLowerCase();
  const hasSubmittedProposal = proposals.some(
    (p) => p.freelancer.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {job.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{job.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {job.budget} ETH
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(job.deadline * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!isClient && !hasSubmittedProposal && job.isActive && (
          <form onSubmit={handleProposalSubmit} className="space-y-4">
            <div>
              <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Proposal
              </label>
              <textarea
                id="proposal"
                value={proposalForm.proposal}
                onChange={(e) => setProposalForm(prev => ({ ...prev, proposal: e.target.value }))}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Bid (ETH)
              </label>
              <input
                type="number"
                id="bidAmount"
                value={proposalForm.bidAmount}
                onChange={(e) => setProposalForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                required
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        )}
      </div>

      {isClient && proposals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Proposals
          </h2>
          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: {proposal.freelancer}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {proposal.bidAmount} ETH
                    </p>
                  </div>
                  {!proposal.isAccepted && job.isActive && (
                    <button
                      onClick={() => handleAcceptProposal(proposal.freelancer)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">{proposal.proposal}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails; 