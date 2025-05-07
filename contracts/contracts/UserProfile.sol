// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserProfile {
    struct Profile {
        string name;
        string bio;
        string skills;
        uint256 reviewCount;
        uint256 averageRating;
    }

    struct Review {
        address reviewer;
        uint256 rating;
        string comment;
        uint256 timestamp;
    }

    mapping(address => Profile) public profiles;
    mapping(address => Review[]) public reviews;

    event ProfileCreated(address indexed user, string name);
    event ReviewAdded(address indexed user, address indexed reviewer, uint256 rating);

    function createProfile(
        string memory _name,
        string memory _bio,
        string memory _skills
    ) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_bio).length > 0, "Bio cannot be empty");
        require(bytes(_skills).length > 0, "Skills cannot be empty");
        require(profiles[msg.sender].reviewCount == 0, "Profile already exists");

        profiles[msg.sender] = Profile({
            name: _name,
            bio: _bio,
            skills: _skills,
            reviewCount: 0,
            averageRating: 0
        });

        emit ProfileCreated(msg.sender, _name);
    }

    function addReview(
        address _user,
        uint256 _rating,
        string memory _comment
    ) external {
        require(_user != msg.sender, "Cannot review yourself");
        require(_rating > 0 && _rating <= 5, "Rating must be between 1 and 5");
        require(bytes(_comment).length > 0, "Comment cannot be empty");
        require(profiles[_user].reviewCount > 0, "User profile does not exist");

        Profile storage profile = profiles[_user];
        reviews[_user].push(
            Review({
                reviewer: msg.sender,
                rating: _rating,
                comment: _comment,
                timestamp: block.timestamp
            })
        );

        // Update average rating
        profile.reviewCount++;
        profile.averageRating = ((profile.averageRating * (profile.reviewCount - 1)) + _rating) / profile.reviewCount;

        emit ReviewAdded(_user, msg.sender, _rating);
    }

    function getProfile(address _user) external view returns (Profile memory) {
        require(profiles[_user].reviewCount > 0, "Profile does not exist");
        return profiles[_user];
    }

    function getReviews(address _user) external view returns (Review[] memory) {
        require(profiles[_user].reviewCount > 0, "Profile does not exist");
        return reviews[_user];
    }
} 