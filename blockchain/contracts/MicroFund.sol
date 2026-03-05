// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MicroFund is Ownable, ReentrancyGuard {
    
    enum LoanStatus { Funding, Active, Repaid, Defaulted }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
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
        uint256 reputationScore;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 defaultCount;
    }

    mapping(address => User) public users;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => mapping(address => uint256)) public loanFunders;
    mapping(uint256 => address[]) public loanFundersList;
    
    uint256 public nextLoanId = 1;
    uint256 public platformFeePercentage = 2; 
    uint256 public platformFeeBalance;

    event UserRegistered(address indexed user, string username);
    event KYCVerified(address indexed user);
    event KYCRevoked(address indexed user);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanActivated(uint256 indexed loanId);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event PlatformFeeWithdrawn(address indexed owner, uint256 amount);

    modifier onlyVerifiedUser() {
        require(users[msg.sender].isKycVerified, "User not verified");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId > 0 && _loanId < nextLoanId, "Loan does not exist");
        _;
    }

    // --- USER FUNCTIONS ---

    // CHANGED: Users can register themselves now
    function registerUser(string calldata _username) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        // Check if already registered (optional, or allow updates)
        if (users[msg.sender].reputationScore == 0) {
            users[msg.sender].reputationScore = 50; 
        }
        users[msg.sender].username = _username;
        emit UserRegistered(msg.sender, _username);
    }

    // --- ADMIN FUNCTIONS ---

    function verifyKYC(address _user) external onlyOwner {
        require(_user != address(0), "Invalid address");
        users[_user].isKycVerified = true;
        emit KYCVerified(_user);
    }

    function revokeKYC(address _user) external onlyOwner {
        require(_user != address(0), "Invalid address");
        users[_user].isKycVerified = false;
        emit KYCRevoked(_user);
    }

    // --- LOAN FUNCTIONS ---

    function createLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        string calldata _purpose
    ) external onlyVerifiedUser returns (uint256) {
        require(_amount > 0, "Amount > 0");
        require(_interestRate <= 10000, "Invalid Rate");
        require(_duration > 0, "Duration > 0");

        uint256 loanId = nextLoanId++;

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
        emit LoanCreated(loanId, msg.sender, _amount);
        return loanId;
    }

    function fundLoan(uint256 _loanId) external payable nonReentrant loanExists(_loanId) onlyVerifiedUser {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Funding, "Not funding");
        require(block.timestamp < loan.fundingDeadline, "Deadline passed");
        require(msg.value > 0, "Send ETH");
        require(loan.amountFunded + msg.value <= loan.amount, "Overfunded");

        if (loanFunders[_loanId][msg.sender] == 0) {
            loanFundersList[_loanId].push(msg.sender);
        }
        loanFunders[_loanId][msg.sender] += msg.value;
        loan.amountFunded += msg.value;

        emit LoanFunded(_loanId, msg.sender, msg.value);

        // CHANGED: Escrow Logic - Only transfer when fully funded
        if (loan.amountFunded >= loan.amount) {
            loan.status = LoanStatus.Active;
            loan.repaymentDeadline = block.timestamp + loan.duration;
            
            uint256 fee = (loan.amount * platformFeePercentage) / 100;
            platformFeeBalance += fee;

            (bool success, ) = payable(loan.borrower).call{value: loan.amount - fee}("");
            require(success, "Transfer failed");

            emit LoanActivated(_loanId);
        }
    }

    function repayLoan(uint256 _loanId) external payable nonReentrant loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Not active");
        require(block.timestamp <= loan.repaymentDeadline, "Repayment deadline passed");

        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.amount + interest;
        require(msg.value >= totalRepayment, "Insufficient amount");

        loan.status = LoanStatus.Repaid;
        users[loan.borrower].totalRepaid += loan.amount;

        // Update Reputation
        if (users[loan.borrower].reputationScore < 100) {
            users[loan.borrower].reputationScore = min(users[loan.borrower].reputationScore + 5, 100);
            emit ReputationUpdated(loan.borrower, users[loan.borrower].reputationScore);
        }

        // Distribute to Lenders with reentrancy protection
        address[] memory funders = loanFundersList[_loanId];
        for (uint256 i = 0; i < funders.length; i++) {
            address lender = funders[i];
            uint256 share = loanFunders[_loanId][lender];
            if(share > 0) {
                uint256 payout = (totalRepayment * share) / loan.amount;
                (bool success, ) = payable(lender).call{value: payout}("");
                require(success, "Lender payout failed");
            }
        }

        // Refund excess
        if (msg.value > totalRepayment) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalRepayment}("");
            require(success, "Refund failed");
        }

        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }

    function markLoanDefaulted(uint256 _loanId) external onlyOwner loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Not active");
        require(block.timestamp > loan.repaymentDeadline, "Not past deadline");

        loan.status = LoanStatus.Defaulted;
        users[loan.borrower].defaultCount += 1;
        
        // Penalize reputation
        if (users[loan.borrower].reputationScore > 0) {
            users[loan.borrower].reputationScore = (users[loan.borrower].reputationScore > 10) 
                ? users[loan.borrower].reputationScore - 10 
                : 0;
            emit ReputationUpdated(loan.borrower, users[loan.borrower].reputationScore);
        }

        emit LoanDefaulted(_loanId);
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        require(platformFeeBalance > 0, "No fees to withdraw");
        uint256 amount = platformFeeBalance;
        platformFeeBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit PlatformFeeWithdrawn(owner(), amount);
    }

    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 10, "Fee too high");
        platformFeePercentage = _feePercentage;
    }

    // --- VIEW FUNCTIONS ---

    function getLoan(uint256 _loanId) external view loanExists(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }

    function getUser(address _userAddress) external view returns (User memory) {
        return users[_userAddress];
    }

    function getLoanFunders(uint256 _loanId) external view loanExists(_loanId) returns (address[] memory) {
        return loanFundersList[_loanId];
    }

    function getLoanFunderShare(uint256 _loanId, address _lender) external view loanExists(_loanId) returns (uint256) {
        return loanFunders[_loanId][_lender];
    }

    // --- UTILITY FUNCTIONS ---

    function min(uint256 a, uint256 b) internal pure returns (uint256) { return a < b ? a : b; }
    function max(uint256 a, uint256 b) internal pure returns (uint256) { return a > b ? a : b; }
    
    receive() external payable {}
}
