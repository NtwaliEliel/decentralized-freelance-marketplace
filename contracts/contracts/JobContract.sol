// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JobContract {
    struct Job {
        string title;
        string description;
        uint256 budget;
        uint256 deadline;
        address client;
        bool isActive;
    }

    struct Proposal {
        address freelancer;
        string proposal;
        uint256 bidAmount;
        bool isAccepted;
    }

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Proposal[]) public proposals;
    uint256 public jobCount;

    event JobCreated(uint256 indexed jobId, address indexed client, string title, uint256 budget);
    event ProposalSubmitted(uint256 indexed jobId, address indexed freelancer, uint256 bidAmount);
    event ProposalAccepted(uint256 indexed jobId, address indexed freelancer);

    function createJob(
        string memory _title,
        string memory _description,
        uint256 _budget,
        uint256 _deadline
    ) external {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_budget > 0, "Budget must be greater than 0");

        jobCount++;
        jobs[jobCount] = Job({
            title: _title,
            description: _description,
            budget: _budget,
            deadline: _deadline,
            client: msg.sender,
            isActive: true
        });

        emit JobCreated(jobCount, msg.sender, _title, _budget);
    }

    function submitProposal(
        uint256 _jobId,
        string memory _proposal,
        uint256 _bidAmount
    ) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        require(jobs[_jobId].isActive, "Job is not active");
        require(msg.sender != jobs[_jobId].client, "Client cannot submit proposal");
        require(_bidAmount > 0, "Bid amount must be greater than 0");

        proposals[_jobId].push(
            Proposal({
                freelancer: msg.sender,
                proposal: _proposal,
                bidAmount: _bidAmount,
                isAccepted: false
            })
        );

        emit ProposalSubmitted(_jobId, msg.sender, _bidAmount);
    }

    function acceptProposal(uint256 _jobId, address _freelancer) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        require(msg.sender == jobs[_jobId].client, "Only client can accept proposal");
        require(jobs[_jobId].isActive, "Job is not active");

        Proposal[] storage jobProposals = proposals[_jobId];
        bool proposalFound = false;

        for (uint256 i = 0; i < jobProposals.length; i++) {
            if (jobProposals[i].freelancer == _freelancer) {
                jobProposals[i].isAccepted = true;
                proposalFound = true;
                break;
            }
        }

        require(proposalFound, "Proposal not found");
        jobs[_jobId].isActive = false;

        emit ProposalAccepted(_jobId, _freelancer);
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        return jobs[_jobId];
    }

    function getProposals(uint256 _jobId) external view returns (Proposal[] memory) {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        return proposals[_jobId];
    }
} 