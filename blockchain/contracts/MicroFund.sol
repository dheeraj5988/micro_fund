// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MicroFund
 * @dev A decentralized peer-to-peer lending platform with KYC verification and reputation scoring
 */
contract MicroFund is Ownable, ReentrancyGuard {
    
    // Enums
    enum LoanStatus { Funding, Active, Repaid, Defaulted }

    // Structs
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate; // in basis points (e.g., 500 = 5%)
        uint256 duration; // in seconds
        string purpose;
        LoanStatus status;
        uint256 amountFunded;
        uint256 createdAt;
        uint256 fundingDeadline;
        uint256 repaymentDeadline;
    }

    struct User {
        string username;
        bool isKycVerified;
        uint256 reputationScore; // Default 50, Max 100
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 defaultCount;
    }

    // State variables
    mapping(address => User) public users;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => mapping(address => uint256)) public loanFunders; // loanId => lender => amount
    mapping(uint256 => address[]) public loanFundersList; // loanId => array of lenders
    
    uint256 public nextLoanId = 1;
    uint256 public platformFeePercentage = 2; // 2% fee
    uint256 public platformFeeBalance;

    // Events
    event UserRegistered(address indexed user, string username);
    event KYCVerified(address indexed user);
    event KYCRevoked(address indexed user);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanActivated(uint256 indexed loanId);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event PlatformFeeWithdrawn(address indexed owner, uint256 amount);

    // Modifiers
    modifier onlyVerifiedUser() {
        require(users[msg.sender].isKycVerified, "User not verified");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId > 0 && _loanId < nextLoanId, "Loan does not exist");
        _;
    }

    /**
     * @dev Register a user (Admin function)
     * @param _user The user address to register
     * @param _username The username for the user
     */
    function registerUser(address _user, string calldata _username) external onlyOwner {
        require(_user != address(0), "Invalid address");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        users[_user].username = _username;
        users[_user].reputationScore = 50; // Default reputation score
        
        emit UserRegistered(_user, _username);
    }

    /**
     * @dev Verify KYC for a user (Admin function)
     * @param _user The user address to verify
     */
    function verifyKYC(address _user) external onlyOwner {
        require(_user != address(0), "Invalid address");
        users[_user].isKycVerified = true;
        emit KYCVerified(_user);
    }

    /**
     * @dev Revoke KYC for a user (Admin function)
     * @param _user The user address to revoke KYC from
     */
    function revokeKYC(address _user) external onlyOwner {
        require(_user != address(0), "Invalid address");
        users[_user].isKycVerified = false;
        emit KYCRevoked(_user);
    }

    /**
     * @dev Create a new loan
     * @param _amount Loan amount in wei
     * @param _interestRate Interest rate in basis points
     * @param _duration Loan duration in seconds
     * @param _purpose Purpose of the loan
     */
    function createLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        string calldata _purpose
    ) external onlyVerifiedUser returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_interestRate > 0 && _interestRate <= 10000, "Invalid interest rate");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_purpose).length > 0, "Purpose cannot be empty");

        uint256 loanId = nextLoanId;
        nextLoanId++;

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            duration: _duration,
            purpose: _purpose,
            status: LoanStatus.Funding,
            amountFunded: 0,
            createdAt: block.timestamp,
            fundingDeadline: block.timestamp + 30 days,
            repaymentDeadline: 0
        });

        users[msg.sender].totalBorrowed += _amount;

        emit LoanCreated(loanId, msg.sender, _amount, _interestRate, _duration);
        return loanId;
    }

    /**
     * @dev Fund a loan
     * @param _loanId The loan ID to fund
     */
    function fundLoan(uint256 _loanId) external payable nonReentrant loanExists(_loanId) onlyVerifiedUser {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Funding, "Loan is not in funding phase");
        require(block.timestamp < loan.fundingDeadline, "Funding deadline has passed");
        require(msg.value > 0, "Must send ETH");
        require(loan.amountFunded + msg.value <= loan.amount, "Funding exceeds loan amount");

        // Record the funding
        if (loanFunders[_loanId][msg.sender] == 0) {
            loanFundersList[_loanId].push(msg.sender);
        }
        loanFunders[_loanId][msg.sender] += msg.value;
        loan.amountFunded += msg.value;

        // Calculate platform fee
        uint256 fee = (msg.value * platformFeePercentage) / 100;
        platformFeeBalance += fee;

        // Transfer funds to borrower (minus fee)
        (bool success, ) = payable(loan.borrower).call{value: msg.value - fee}("");
        require(success, "Transfer failed");

        // Activate loan if fully funded
        if (loan.amountFunded >= loan.amount) {
            loan.status = LoanStatus.Active;
            loan.repaymentDeadline = block.timestamp + loan.duration;
            emit LoanActivated(_loanId);
        }

        emit LoanFunded(_loanId, msg.sender, msg.value);
    }

    /**
     * @dev Repay a loan
     * @param _loanId The loan ID to repay
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Only borrower can repay");
        require(loan.status == LoanStatus.Active, "Loan is not active");

        // Calculate total repayment amount (principal + interest)
        uint256 interestAmount = (loan.amount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.amount + interestAmount;

        require(msg.value >= totalRepayment, "Insufficient repayment amount");

        loan.status = LoanStatus.Repaid;
        users[msg.sender].totalRepaid += loan.amount;

        // Increase reputation score for successful repayment
        if (users[msg.sender].reputationScore < 100) {
            users[msg.sender].reputationScore = min(
                users[msg.sender].reputationScore + 5,
                100
            );
            emit ReputationUpdated(msg.sender, users[msg.sender].reputationScore);
        }

        // Distribute repayment to lenders proportionally
        address[] storage fundersList = loanFundersList[_loanId];
        for (uint256 i = 0; i < fundersList.length; i++) {
            address lender = fundersList[i];
            uint256 lenderShare = loanFunders[_loanId][lender];
            uint256 proportionalRepayment = (totalRepayment * lenderShare) / loan.amount;

            (bool success, ) = payable(lender).call{value: proportionalRepayment}("");
            require(success, "Lender transfer failed");
        }

        // Refund excess payment if any
        if (msg.value > totalRepayment) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalRepayment}("");
            require(refundSuccess, "Refund failed");
        }

        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }

    /**
     * @dev Mark a loan as defaulted (called after repayment deadline passes)
     * @param _loanId The loan ID to mark as defaulted
     */
    function markLoanDefaulted(uint256 _loanId) external loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(block.timestamp > loan.repaymentDeadline, "Repayment deadline has not passed");

        loan.status = LoanStatus.Defaulted;
        users[loan.borrower].defaultCount++;
        
        // Decrease reputation score for default
        if (users[loan.borrower].reputationScore > 0) {
            users[loan.borrower].reputationScore = max(
                users[loan.borrower].reputationScore - 10,
                0
            );
            emit ReputationUpdated(loan.borrower, users[loan.borrower].reputationScore);
        }

        emit LoanDefaulted(_loanId);
    }

    /**
     * @dev Withdraw platform fees (Admin only)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        require(platformFeeBalance > 0, "No fees to withdraw");
        uint256 amount = platformFeeBalance;
        platformFeeBalance = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit PlatformFeeWithdrawn(owner(), amount);
    }

    /**
     * @dev Get loan details
     * @param _loanId The loan ID
     */
    function getLoan(uint256 _loanId) external view loanExists(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }

    /**
     * @dev Get user details
     * @param _user The user address
     */
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }

    /**
     * @dev Get loan funders
     * @param _loanId The loan ID
     */
    function getLoanFunders(uint256 _loanId) external view loanExists(_loanId) returns (address[] memory) {
        return loanFundersList[_loanId];
    }

    /**
     * @dev Helper function to get minimum value
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Helper function to get maximum value
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
