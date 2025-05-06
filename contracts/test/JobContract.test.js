const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JobContract", function () {
  let JobContract;
  let jobContract;
  let owner;
  let client;
  let freelancer;
  let addrs;

  beforeEach(async function () {
    [owner, client, freelancer, ...addrs] = await ethers.getSigners();
    JobContract = await ethers.getContractFactory("JobContract");
    jobContract = await JobContract.deploy();
    await jobContract.deployed();
  });

  describe("Job Creation", function () {
    it("Should create a new job", async function () {
      const title = "Test Job";
      const description = "Test Description";
      const budget = ethers.utils.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      await expect(
        jobContract.connect(client).createJob(title, description, deadline, {
          value: budget,
        })
      )
        .to.emit(jobContract, "JobCreated")
        .withArgs(1, client.address, title, budget, deadline);

      const job = await jobContract.getJob(1);
      expect(job.title).to.equal(title);
      expect(job.description).to.equal(description);
      expect(job.budget).to.equal(budget);
      expect(job.deadline).to.equal(deadline);
      expect(job.client).to.equal(client.address);
      expect(job.status).to.equal(0); // Open status
    });

    it("Should fail if budget is 0", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        jobContract
          .connect(client)
          .createJob("Test Job", "Test Description", deadline, {
            value: 0,
          })
      ).to.be.revertedWith("Budget must be greater than 0");
    });

    it("Should fail if deadline is in the past", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 86400;

      await expect(
        jobContract
          .connect(client)
          .createJob("Test Job", "Test Description", deadline, {
            value: ethers.utils.parseEther("1"),
          })
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Proposal Submission", function () {
    beforeEach(async function () {
      await jobContract.connect(client).createJob(
        "Test Job",
        "Test Description",
        Math.floor(Date.now() / 1000) + 86400,
        {
          value: ethers.utils.parseEther("1"),
        }
      );
    });

    it("Should submit a proposal", async function () {
      const coverLetter = "Test Cover Letter";
      const bid = ethers.utils.parseEther("0.5");
      const estimatedTime = 7; // days

      await expect(
        jobContract
          .connect(freelancer)
          .submitProposal(1, coverLetter, bid, estimatedTime)
      )
        .to.emit(jobContract, "ProposalSubmitted")
        .withArgs(1, 1, freelancer.address, bid);

      const proposals = await jobContract.getJobProposals(1);
      expect(proposals.length).to.equal(1);
      expect(proposals[0].freelancer).to.equal(freelancer.address);
      expect(proposals[0].bid).to.equal(bid);
      expect(proposals[0].estimatedTime).to.equal(estimatedTime);
    });

    it("Should fail if bid exceeds budget", async function () {
      await expect(
        jobContract
          .connect(freelancer)
          .submitProposal(
            1,
            "Test Cover Letter",
            ethers.utils.parseEther("2"),
            7
          )
      ).to.be.revertedWith("Bid exceeds job budget");
    });

    it("Should fail if client tries to submit proposal", async function () {
      await expect(
        jobContract
          .connect(client)
          .submitProposal(
            1,
            "Test Cover Letter",
            ethers.utils.parseEther("0.5"),
            7
          )
      ).to.be.revertedWith("Client cannot submit proposal");
    });
  });

  describe("Proposal Acceptance", function () {
    beforeEach(async function () {
      await jobContract.connect(client).createJob(
        "Test Job",
        "Test Description",
        Math.floor(Date.now() / 1000) + 86400,
        {
          value: ethers.utils.parseEther("1"),
        }
      );

      await jobContract
        .connect(freelancer)
        .submitProposal(
          1,
          "Test Cover Letter",
          ethers.utils.parseEther("0.5"),
          7
        );
    });

    it("Should accept a proposal", async function () {
      await expect(jobContract.connect(client).acceptProposal(1, 1))
        .to.emit(jobContract, "ProposalAccepted")
        .withArgs(1, 1, freelancer.address);

      const job = await jobContract.getJob(1);
      expect(job.status).to.equal(1); // InProgress status
      expect(job.selectedFreelancer).to.equal(freelancer.address);
    });

    it("Should fail if not the job client", async function () {
      await expect(
        jobContract.connect(freelancer).acceptProposal(1, 1)
      ).to.be.revertedWith("Not the job client");
    });
  });

  describe("Job Completion", function () {
    beforeEach(async function () {
      await jobContract.connect(client).createJob(
        "Test Job",
        "Test Description",
        Math.floor(Date.now() / 1000) + 86400,
        {
          value: ethers.utils.parseEther("1"),
        }
      );

      await jobContract
        .connect(freelancer)
        .submitProposal(
          1,
          "Test Cover Letter",
          ethers.utils.parseEther("1"),
          7
        );

      await jobContract.connect(client).acceptProposal(1, 1);
    });

    it("Should complete a job and transfer funds", async function () {
      const initialBalance = await freelancer.getBalance();

      await expect(jobContract.connect(client).completeJob(1))
        .to.emit(jobContract, "JobCompleted")
        .withArgs(1, client.address, freelancer.address, ethers.utils.parseEther("1"));

      const finalBalance = await freelancer.getBalance();
      expect(finalBalance.sub(initialBalance)).to.equal(
        ethers.utils.parseEther("1")
      );

      const job = await jobContract.getJob(1);
      expect(job.status).to.equal(2); // Completed status
    });

    it("Should fail if not the job client", async function () {
      await expect(
        jobContract.connect(freelancer).completeJob(1)
      ).to.be.revertedWith("Not the job client");
    });
  });

  describe("Job Cancellation", function () {
    beforeEach(async function () {
      await jobContract.connect(client).createJob(
        "Test Job",
        "Test Description",
        Math.floor(Date.now() / 1000) + 86400,
        {
          value: ethers.utils.parseEther("1"),
        }
      );
    });

    it("Should cancel a job and refund client", async function () {
      const initialBalance = await client.getBalance();

      const tx = await jobContract.connect(client).cancelJob(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await client.getBalance();
      expect(finalBalance.add(gasUsed).sub(initialBalance)).to.equal(
        ethers.utils.parseEther("1")
      );

      const job = await jobContract.getJob(1);
      expect(job.status).to.equal(3); // Cancelled status
    });

    it("Should fail if job is not open", async function () {
      await jobContract
        .connect(freelancer)
        .submitProposal(
          1,
          "Test Cover Letter",
          ethers.utils.parseEther("1"),
          7
        );
      await jobContract.connect(client).acceptProposal(1, 1);

      await expect(
        jobContract.connect(client).cancelJob(1)
      ).to.be.revertedWith("Can only cancel open jobs");
    });
  });
}); 