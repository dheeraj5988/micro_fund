import { expect } from "chai";
import { ethers } from "hardhat";
import { MicroFund } from "../typechain-types";

describe("MicroFund", function () {
  let microFund: MicroFund;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const MicroFund = await ethers.getContractFactory("MicroFund");
    microFund = await MicroFund.deploy();
    await microFund.waitForDeployment();
  });

  describe("User Registration and KYC", function () {
    it("Should register a user", async function () {
      await microFund.registerUser(addr1.address, "testuser");
      const user = await microFund.getUser(addr1.address);
      expect(user.username).to.equal("testuser");
      expect(user.reputationScore).to.equal(50);
    });

    it("Should verify KYC", async function () {
      await microFund.registerUser(addr1.address, "testuser");
      await microFund.verifyKYC(addr1.address);
      const user = await microFund.getUser(addr1.address);
      expect(user.isKycVerified).to.be.true;
    });

    it("Should revoke KYC", async function () {
      await microFund.registerUser(addr1.address, "testuser");
      await microFund.verifyKYC(addr1.address);
      await microFund.revokeKYC(addr1.address);
      const user = await microFund.getUser(addr1.address);
      expect(user.isKycVerified).to.be.false;
    });
  });

  describe("Loan Creation", function () {
    beforeEach(async function () {
      await microFund.registerUser(addr1.address, "borrower");
      await microFund.verifyKYC(addr1.address);
    });

    it("Should create a loan", async function () {
      const amount = ethers.parseEther("1");
      const interestRate = 500; // 5%
      const duration = 30 * 24 * 60 * 60; // 30 days

      await expect(
        microFund
          .connect(addr1)
          .createLoan(amount, interestRate, duration, "Business expansion")
      )
        .to.emit(microFund, "LoanCreated")
        .withArgs(1, addr1.address, amount, interestRate, duration);

      const loan = await microFund.getLoan(1);
      expect(loan.borrower).to.equal(addr1.address);
      expect(loan.amount).to.equal(amount);
    });

    it("Should not allow unverified users to create loans", async function () {
      const amount = ethers.parseEther("1");
      const interestRate = 500;
      const duration = 30 * 24 * 60 * 60;

      await expect(
        microFund
          .connect(addr2)
          .createLoan(amount, interestRate, duration, "Test")
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Loan Funding", function () {
    beforeEach(async function () {
      // Setup borrower
      await microFund.registerUser(addr1.address, "borrower");
      await microFund.verifyKYC(addr1.address);

      // Setup lender
      await microFund.registerUser(addr2.address, "lender");
      await microFund.verifyKYC(addr2.address);

      // Create a loan
      const amount = ethers.parseEther("1");
      const interestRate = 500;
      const duration = 30 * 24 * 60 * 60;

      await microFund
        .connect(addr1)
        .createLoan(amount, interestRate, duration, "Business expansion");
    });

    it("Should fund a loan", async function () {
      const fundAmount = ethers.parseEther("0.5");

      await expect(
        microFund.connect(addr2).fundLoan(1, { value: fundAmount })
      )
        .to.emit(microFund, "LoanFunded")
        .withArgs(1, addr2.address, fundAmount);

      const loan = await microFund.getLoan(1);
      expect(loan.amountFunded).to.equal(fundAmount);
    });

    it("Should activate loan when fully funded", async function () {
      const fullAmount = ethers.parseEther("1");

      await microFund.connect(addr2).fundLoan(1, { value: fullAmount });

      const loan = await microFund.getLoan(1);
      expect(loan.status).to.equal(1); // Active status
    });
  });
});
