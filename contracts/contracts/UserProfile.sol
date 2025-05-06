// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract UserProfile is Ownable, Pausable {
    // Structs
    struct Profile {
        string name;
        string title;
        string bio;
        string[] skills;
        uint256 hourlyRate;
        uint256 completedJobs;
        uint256 totalRatings;
        uint256 ratingSum;
        uint256 createdAt;
        bool isActive;
    }

    struct Review {
        uint256 id;
        address reviewer;
        uint256 rating;
        string comment;
        uint256 createdAt;
    }

    // State variables
    mapping(address => Profile) public profiles;
    mapping(address => Review[]) public userReviews;
    mapping(address => mapping(address => bool)) public hasReviewed;
    uint256 private reviewCounter;

    // Events
    event ProfileCreated(
        address indexed user,
        string name,
        string title,
        uint256 hourlyRate
    );

    event ProfileUpdated(
        address indexed user,
        string name,
        string title,
        uint256 hourlyRate
    );

    event ReviewSubmitted(
        uint256 indexed reviewId,
        address indexed reviewer,
        address indexed reviewee,
        uint256 rating
    );

    event JobCompleted(address indexed freelancer);

    // Modifiers
    modifier profileExists(address _user) {
        require(profiles[_user].isActive, "Profile does not exist");
        _;
    }

    modifier validRating(uint256 _rating) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        _;
    }

    // Constructor
    constructor() {
        reviewCounter = 0;
    }

    // Functions
    function createProfile(
        string memory _name,
        string memory _title,
        string memory _bio,
        string[] memory _skills,
        uint256 _hourlyRate
    ) external whenNotPaused {
        require(!profiles[msg.sender].isActive, "Profile already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_skills.length > 0, "Must specify at least one skill");

        profiles[msg.sender] = Profile({
            name: _name,
            title: _title,
            bio: _bio,
            skills: _skills,
            hourlyRate: _hourlyRate,
            completedJobs: 0,
            totalRatings: 0,
            ratingSum: 0,
            createdAt: block.timestamp,
            isActive: true
        });

        emit ProfileCreated(msg.sender, _name, _title, _hourlyRate);
    }

    function updateProfile(
        string memory _name,
        string memory _title,
        string memory _bio,
        string[] memory _skills,
        uint256 _hourlyRate
    ) external whenNotPaused profileExists(msg.sender) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_skills.length > 0, "Must specify at least one skill");

        Profile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.title = _title;
        profile.bio = _bio;
        profile.skills = _skills;
        profile.hourlyRate = _hourlyRate;

        emit ProfileUpdated(msg.sender, _name, _title, _hourlyRate);
    }

    function submitReview(
        address _freelancer,
        uint256 _rating,
        string memory _comment
    ) external whenNotPaused profileExists(_freelancer) validRating(_rating) {
        require(msg.sender != _freelancer, "Cannot review yourself");
        require(!hasReviewed[msg.sender][_freelancer], "Already reviewed this freelancer");

        reviewCounter++;
        Review memory review = Review({
            id: reviewCounter,
            reviewer: msg.sender,
            rating: _rating,
            comment: _comment,
            createdAt: block.timestamp
        });

        userReviews[_freelancer].push(review);
        hasReviewed[msg.sender][_freelancer] = true;

        Profile storage profile = profiles[_freelancer];
        profile.totalRatings++;
        profile.ratingSum += _rating;

        emit ReviewSubmitted(reviewCounter, msg.sender, _freelancer, _rating);
    }

    function completeJob(address _freelancer) external onlyOwner {
        require(profiles[_freelancer].isActive, "Profile does not exist");
        profiles[_freelancer].completedJobs++;
        emit JobCompleted(_freelancer);
    }

    // View functions
    function getProfile(address _user) external view returns (
        string memory name,
        string memory title,
        string memory bio,
        string[] memory skills,
        uint256 hourlyRate,
        uint256 completedJobs,
        uint256 rating,
        uint256 createdAt
    ) {
        require(profiles[_user].isActive, "Profile does not exist");
        Profile memory profile = profiles[_user];
        
        return (
            profile.name,
            profile.title,
            profile.bio,
            profile.skills,
            profile.hourlyRate,
            profile.completedJobs,
            profile.totalRatings > 0 ? (profile.ratingSum * 100 / profile.totalRatings) : 0,
            profile.createdAt
        );
    }

    function getReviews(address _user) external view returns (Review[] memory) {
        return userReviews[_user];
    }

    function getAverageRating(address _user) external view returns (uint256) {
        Profile memory profile = profiles[_user];
        if (profile.totalRatings == 0) return 0;
        return (profile.ratingSum * 100) / profile.totalRatings;
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function deactivateProfile() external {
        require(profiles[msg.sender].isActive, "Profile does not exist");
        profiles[msg.sender].isActive = false;
    }
} 