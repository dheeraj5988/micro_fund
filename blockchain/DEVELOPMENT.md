# Development Guide for MicroFund Contracts

## Local Development Setup

### 1. Start Local Hardhat Node

```bash
npx hardhat node
```

This starts a local Ethereum network on `http://127.0.0.1:8545` with:
- 20 pre-funded test accounts
- Each account has 10,000 ETH
- Deterministic addresses for testing

### 2. Deploy to Local Network

In a new terminal:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Save the contract address from the output.

### 3. Update Environment

```bash
# .env
HARDHAT_NETWORK=localhost
LOCAL_CONTRACT_ADDRESS=0x...
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test File

```bash
npx hardhat test test/MicroFund.test.ts
```

### Run with Coverage

```bash
npx hardhat coverage
```

This generates a coverage report showing which lines of code are tested.

### Run with Gas Reporter

```bash
REPORT_GAS=true npm run test
```

Shows gas usage for each function call.

## Common Development Tasks

### Compile Contracts

```bash
npm run compile
```

Creates artifacts in `artifacts/` directory.

### Generate TypeChain Types

```bash
npx hardhat typechain
```

Generates TypeScript types in `typechain-types/` for type-safe contract interaction.

### Lint Code

```bash
npx eslint contracts/**/*.sol
```

(Requires solhint: `npm install -D solhint`)

### Check Gas Optimization

```bash
REPORT_GAS=true npx hardhat test
```

## Contract Development Workflow

### 1. Write Test First (TDD)

```typescript
// test/MyFeature.test.ts
describe("MyFeature", function () {
  it("should do something", async function () {
    // Test code
  });
});
```

### 2. Run Test (Will Fail)

```bash
npx hardhat test test/MyFeature.test.ts
```

### 3. Implement Feature

```solidity
// contracts/MicroFund.sol
function myFeature() external {
  // Implementation
}
```

### 4. Run Test Again (Should Pass)

```bash
npx hardhat test test/MyFeature.test.ts
```

### 5. Commit

```bash
git add .
git commit -m "feat: add myFeature"
```

## Debugging

### Using Hardhat Console

```bash
npx hardhat console
```

Then interact with contracts:

```javascript
> const MicroFund = await ethers.getContractFactory("MicroFund");
> const contract = await MicroFund.deploy();
> const user = await contract.getUser("0x...");
> console.log(user);
```

### Using Logs in Tests

```typescript
it("should trace execution", async function () {
  const tx = await contract.someFunction();
  const receipt = await tx.wait();
  
  console.log("Gas used:", receipt?.gasUsed.toString());
  console.log("Events:", receipt?.logs);
});
```

### Using Events for Debugging

```solidity
event Debug(string message, uint256 value);

function myFunction() external {
  emit Debug("Function called", 42);
}
```

Then listen in tests:

```typescript
contract.on('Debug', (message, value) => {
  console.log(message, value.toString());
});
```

## Gas Optimization Tips

### 1. Use Structs Efficiently

```solidity
// ❌ Bad - wastes storage
struct Loan {
  uint8 status;
  address borrower;  // Wastes space after uint8
  uint256 amount;
}

// ✅ Good - packs efficiently
struct Loan {
  address borrower;
  uint256 amount;
  uint8 status;
}
```

### 2. Cache Storage Variables

```solidity
// ❌ Bad - reads from storage 3 times
function check() external {
  if (loans[loanId].status == 1) {
    loans[loanId].amountFunded += msg.value;
    emit Event(loans[loanId].amount);
  }
}

// ✅ Good - reads from storage once
function check() external {
  Loan storage loan = loans[loanId];
  if (loan.status == 1) {
    loan.amountFunded += msg.value;
    emit Event(loan.amount);
  }
}
```

### 3. Use Efficient Comparisons

```solidity
// ❌ Bad
require(amount > 0, "Amount must be greater than 0");

// ✅ Good
require(amount != 0, "Amount required");
```

## Version Control

### .gitignore for Blockchain

```
node_modules/
artifacts/
cache/
dist/
typechain-types/
.env
.env.local
coverage/
*.log
.DS_Store
```

### Commit Messages

Follow conventional commits:

```
feat: add loan repayment functionality
fix: correct reputation score calculation
test: add tests for loan funding
docs: update deployment guide
refactor: optimize storage packing
```

## Security Checklist Before Deployment

- [ ] All functions have appropriate access control
- [ ] Input validation on all parameters
- [ ] No overflow/underflow vulnerabilities (using uint256 arithmetic)
- [ ] ReentrancyGuard on critical functions
- [ ] Events emitted for important state changes
- [ ] Tests have 100% code coverage
- [ ] Contract passes security audit
- [ ] Gas optimization completed
- [ ] Documentation up to date

## Common Patterns

### Safe ETH Transfer

```solidity
// ✅ Recommended
(bool success, ) = payable(recipient).call{value: amount}("");
require(success, "Transfer failed");

// ❌ Avoid
recipient.transfer(amount);  // Limited gas, can fail
```

### State Consistency

```solidity
// ✅ Good - updates state atomically
function transfer(address to, uint256 amount) external {
  require(balances[msg.sender] >= amount, "Insufficient balance");
  balances[msg.sender] -= amount;
  balances[to] += amount;
  emit Transfer(msg.sender, to, amount);
}

// ❌ Bad - state can be inconsistent
function transfer(address to, uint256 amount) external {
  balances[msg.sender] -= amount;  // Could revert before this
  balances[to] += amount;
}
```

## Performance Optimization

### Batch Operations

```solidity
// Efficient for processing multiple items
function registerUsers(
  address[] calldata users,
  string[] calldata usernames
) external onlyOwner {
  require(users.length == usernames.length, "Length mismatch");
  
  for (uint256 i = 0; i < users.length; i++) {
    registerUser(users[i], usernames[i]);
  }
}
```

### Pagination for Large Datasets

```typescript
// Frontend example
async function getPaginatedLoans(page: number, pageSize: number = 10) {
  const loans = [];
  const startId = page * pageSize + 1;
  
  for (let i = 0; i < pageSize; i++) {
    try {
      const loan = await contract.getLoan(startId + i);
      loans.push(loan);
    } catch {
      break;  // No more loans
    }
  }
  
  return loans;
}
```

## Useful Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Solidity Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/)
- [Ethereum Gas Tracker](https://ethgasstation.info/)

## Getting Help

1. Check [Hardhat GitHub Issues](https://github.com/NomicFoundation/hardhat/issues)
2. Check [Solidity Docs](https://docs.soliditylang.org/)
3. Ask on [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
4. Review [OpenZeppelin Community Forum](https://forum.openzeppelin.com/)

---

Happy developing! 🚀
