// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract JobContract is ReentrancyGuard, Ownable, Pausable {
    // Structs
    struct Job {
        uint256 id;
        address client;
        string title;
        string description;
        uint256 budget;
        uint256 deadline;
        JobStatus status;
        address selectedFreelancer;
        uint256 createdAt;
    }

    struct Proposal {
        uint256 id;
        uint256 jobId;
        address freelancer;
        string coverLetter;
        uint256 bid;
        uint256 estimatedTime;
        ProposalStatus status;
        uint256 createdAt;
    }

    // Enums
    enum JobStatus { Open, InProgress, Completed, Cancelled }
    enum ProposalStatus { Pending, Accepted, Rejected }

    // State variables
    uint256 private jobCounter;
    uint256 private proposalCounter;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Proposal[]) public jobProposals;
    mapping(uint256 => uint256) public jobEscrowAmount;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public freelancerProposals;

    // Events
    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        string title,
        uint256 budget,
        uint256 deadline
    );

    event ProposalSubmitted(
        uint256 indexed proposalId,
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 bid
    );

    event ProposalAccepted(
        uint256 indexed jobId,
        uint256 indexed proposalId,
        address indexed freelancer
    );

    event JobCompleted(
        uint256 indexed jobId,
        address indexed client,
        address indexed freelancer,
        uint256 amount
    );

    event JobCancelled(uint256 indexed jobId);

    // Modifiers
    modifier onlyJobClient(uint256 _jobId) {
        require(jobs[_jobId].client == msg.sender, "Not the job client");
        _;
    }

    modifier jobExists(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobCounter, "Job does not exist");
        _;
    }

    modifier jobIsOpen(uint256 _jobId) {
        require(jobs[_jobId].status == JobStatus.Open, "Job is not open");
        _;
    }

    // Constructor
    constructor() {
        jobCounter = 0;
        proposalCounter = 0;
    }

    // Functions
    function createJob(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Budget must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        jobCounter++;
        jobs[jobCounter] = Job({
            id: jobCounter,
            client: msg.sender,
            title: _title,
            description: _description,
            budget: msg.value,
            deadline: _deadline,
            status: JobStatus.Open,
            selectedFreelancer: address(0),
            createdAt: block.timestamp
        });

        jobEscrowAmount[jobCounter] = msg.value;
        clientJobs[msg.sender].push(jobCounter);

        emit JobCreated(jobCounter, msg.sender, _title, msg.value, _deadline);
        return jobCounter;
    }

    function submitProposal(
        uint256 _jobId,
        string memory _coverLetter,
        uint256 _bid,
        uint256 _estimatedTime
    ) external whenNotPaused jobExists(_jobId) jobIsOpen(_jobId) returns (uint256) {
        require(_bid <= jobs[_jobId].budget, "Bid exceeds job budget");
        require(jobs[_jobId].client != msg.sender, "Client cannot submit proposal");

        proposalCounter++;
        Proposal memory proposal = Proposal({
            id: proposalCounter,
            jobId: _jobId,
            freelancer: msg.sender,
            coverLetter: _coverLetter,
            bid: _bid,
            estimatedTime: _estimatedTime,
            status: ProposalStatus.Pending,
            createdAt: block.timestamp
        });

        jobProposals[_jobId].push(proposal);
        freelancerProposals[msg.sender].push(proposalCounter);

        emit ProposalSubmitted(proposalCounter, _jobId, msg.sender, _bid);
        return proposalCounter;
    }

    function acceptProposal(uint256 _jobId, uint256 _proposalId)
        external
        whenNotPaused
        jobExists(_jobId)
        jobIsOpen(_jobId)
        onlyJobClient(_jobId)
    {
        Job storage job = jobs[_jobId];
        Proposal[] storage proposals = jobProposals[_jobId];
        
        uint256 proposalIndex;
        bool found = false;
        
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].id == _proposalId) {
                proposalIndex = i;
                found = true;
                break;
            }
        }
        
        require(found, "Proposal not found");
        require(proposals[proposalIndex].status == ProposalStatus.Pending, "Proposal not pending");

        job.status = JobStatus.InProgress;
        job.selectedFreelancer = proposals[proposalIndex].freelancer;
        proposals[proposalIndex].status = ProposalStatus.Accepted;

        // Update other proposals to rejected
        for (uint256 i = 0; i < proposals.length; i++) {
            if (i != proposalIndex && proposals[i].status == ProposalStatus.Pending) {
                proposals[i].status = ProposalStatus.Rejected;
            }
        }

        emit ProposalAccepted(_jobId, _proposalId, proposals[proposalIndex].freelancer);
    }

    function completeJob(uint256 _jobId)
        external
        whenNotPaused
        jobExists(_jobId)
        onlyJobClient(_jobId)
    {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Job not in progress");
        require(job.selectedFreelancer != address(0), "No freelancer selected");

        uint256 amount = jobEscrowAmount[_jobId];
        require(amount > 0, "No funds in escrow");

        job.status = JobStatus.Completed;
        jobEscrowAmount[_jobId] = 0;

        (bool success, ) = job.selectedFreelancer.call{value: amount}("");
        require(success, "Transfer failed");

        emit JobCompleted(_jobId, job.client, job.selectedFreelancer, amount);
    }

    function cancelJob(uint256 _jobId)
        external
        whenNotPaused
        jobExists(_jobId)
        onlyJobClient(_jobId)
    {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Can only cancel open jobs");

        uint256 amount = jobEscrowAmount[_jobId];
        require(amount > 0, "No funds in escrow");

        job.status = JobStatus.Cancelled;
        jobEscrowAmount[_jobId] = 0;

        (bool success, ) = job.client.call{value: amount}("");
        require(success, "Transfer failed");

        emit JobCancelled(_jobId);
    }

    // View functions
    function getJob(uint256 _jobId) external view returns (Job memory) {
        require(_jobId > 0 && _jobId <= jobCounter, "Job does not exist");
        return jobs[_jobId];
    }

    function getJobProposals(uint256 _jobId) external view returns (Proposal[] memory) {
        return jobProposals[_jobId];
    }

    function getClientJobs(address _client) external view returns (uint256[] memory) {
        return clientJobs[_client];
    }

    function getFreelancerProposals(address _freelancer) external view returns (uint256[] memory) {
        return freelancerProposals[_freelancer];
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
} 