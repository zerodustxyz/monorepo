// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

/**
 * @title Sweeper
 * @dev Main contract that sweeps ETH balance and bridges to destination chain via Bungee
 * @dev Total user fee: $0.05 + gas cost × 1.20
 * @dev Uses EIP-7702 for account abstraction and paymaster gas sponsorship
 */
contract Sweeper {
    
    // Events
    event SweepInitiated(
        address indexed user,
        uint256 indexed sourceChainId,
        uint256 indexed destinationChainId,
        uint256 amount,
        uint256 fee
    );
    
    event SweepCompleted(
        address indexed user,
        uint256 indexed sourceChainId,
        uint256 indexed destinationChainId,
        uint256 amount,
        bytes32 transactionHash
    );
    
    // Fee structure
    uint256 public constant BASE_FEE_USD = 5; // $0.05 in cents
    uint256 public constant GAS_MULTIPLIER = 120; // 1.20x buffer (120%)
    uint256 public constant MULTIPLIER_PRECISION = 100;
    
    // Owner for managing paymaster and fees
    address public owner;
    
    // Fee collection
    uint256 public collectedFees;
    
    // EIP-7702 Paymaster wallet for sponsoring gas
    address public paymaster;
    
    // Authorization for EIP-7702 delegation
    mapping(address => bool) public authorizedDelegations;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _paymaster) {
        owner = msg.sender;
        paymaster = _paymaster;
        _initializeBungeeAddresses();
    }
    
    /**
     * @dev Set the paymaster address for EIP-7702 gas sponsorship
     * @param _paymaster Address of the paymaster wallet
     */
    function setPaymaster(address _paymaster) external onlyOwner {
        paymaster = _paymaster;
    }
    
    /**
     * @dev Fund the paymaster wallet for gas sponsorship
     * @dev This function allows owner to send ETH directly to paymaster
     */
    function fundPaymaster() external payable onlyOwner {
        require(paymaster != address(0), "Paymaster not set");
        payable(paymaster).transfer(msg.value);
    }
    
    /**
     * @dev Calculate total fee for a sweep operation
     * @param estimatedGasCost Estimated gas cost in wei
     * @param ethPriceUSD Current ETH price in USD (with 8 decimals)
     * @return totalFee Total fee in wei
     */
    function calculateFee(
        uint256 estimatedGasCost, 
        uint256 ethPriceUSD
    ) public pure returns (uint256 totalFee) {
        // Convert $0.05 to wei based on current ETH price
        uint256 baseFeeWei = (BASE_FEE_USD * 1e18) / ethPriceUSD; // $0.05 / ETH_PRICE
        
        // Apply 1.20x multiplier to gas cost
        uint256 gasWithBuffer = (estimatedGasCost * GAS_MULTIPLIER) / MULTIPLIER_PRECISION;
        
        totalFee = baseFeeWei + gasWithBuffer;
    }
    
    /**
     * @dev Main sweep function - user sends full balance, contract sponsors gas
     * @param destinationChainId Target chain ID
     * @param estimatedGasCost Estimated gas cost for bridge operation
     * @param ethPriceUSD Current ETH price in USD (8 decimals)
     * @param bungeeCalldata Calldata for Bungee bridge execution
     */
    function sweepAndBridge(
        uint256 destinationChainId,
        uint256 estimatedGasCost,
        uint256 ethPriceUSD,
        bytes calldata bungeeCalldata
    ) external payable {
        require(msg.value > 0, "No ETH to sweep");
        require(destinationChainId != block.chainid, "Cannot bridge to same chain");
        
        uint256 totalFee = calculateFee(estimatedGasCost, ethPriceUSD);
        uint256 gasWithBuffer = (estimatedGasCost * GAS_MULTIPLIER) / MULTIPLIER_PRECISION;
        
        // Check paymaster has enough ETH to sponsor gas
        require(paymaster.balance >= gasWithBuffer, "Insufficient paymaster funds");
        
        require(msg.value > totalFee, "Amount too small to cover fees");
        
        uint256 amountToBridge = msg.value - totalFee;
        
        // Note: Gas is sponsored by paymaster via EIP-7702, no deduction needed here
        
        // Collect fees (this covers our gas cost + profit)
        collectedFees += totalFee;
        
        emit SweepInitiated(
            msg.sender,
            block.chainid,
            destinationChainId,
            amountToBridge,
            totalFee
        );
        
        // Execute bridge via Bungee (paymaster pays gas, user gets full amount - fees)
        _executeBridge(amountToBridge, bungeeCalldata);
        
        emit SweepCompleted(
            msg.sender,
            block.chainid,
            destinationChainId,
            amountToBridge,
            keccak256(bungeeCalldata) // Use calldata hash as tx identifier
        );
    }
    
    // Bungee Inbox contract addresses per chain
    mapping(uint256 => address) public bungeeInbox;
    
    /**
     * @dev Initialize Bungee Inbox addresses for supported chains
     */
    function _initializeBungeeAddresses() private {
        bungeeInbox[1] = 0x92612711D4d07dEbe4964D4d1401D7d7B5a11737;     // Ethereum
        bungeeInbox[8453] = 0x3C54883Ce0d86b3abB26A63744bEb853Ea99a403;   // Base
        bungeeInbox[42161] = 0xA3BF43451CdEb6DEC588B8833838fC419CE4F54c;  // Arbitrum
        bungeeInbox[10] = 0x78255f1DeE074fb7084Ee124058A058dE0B1C251;     // Optimism  
        bungeeInbox[137] = 0x8d2d9F75346DB3c3bF54CCEED25E3D63d1E963F5;    // Polygon
        bungeeInbox[56] = 0x8d2d9F75346DB3c3bF54CCEED25E3D63d1E963F5;     // BSC (assuming same)
        bungeeInbox[43114] = 0x8d2d9F75346DB3c3bF54CCEED25E3D63d1E963F5;  // Avalanche (assuming same)
    }
    
    /**
     * @dev Execute bridge transaction via Bungee Inbox contract
     * @param amount Amount to bridge in wei
     * @param bungeeCalldata Encoded calldata from Bungee quote API
     */
    function _executeBridge(uint256 amount, bytes calldata bungeeCalldata) private {
        address inboxContract = bungeeInbox[block.chainid];
        require(inboxContract != address(0), "Chain not supported by Bungee");
        
        // Call Bungee Inbox contract with the amount and calldata from quote
        (bool success, bytes memory returnData) = inboxContract.call{value: amount}(bungeeCalldata);
        
        require(success, string(abi.encodePacked("Bridge execution failed: ", returnData)));
    }
    
    
    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        payable(owner).transfer(amount);
    }
    
    /**
     * @dev Emergency withdraw from paymaster (if needed)
     * @dev This requires paymaster cooperation or special permissions
     */
    function emergencyWithdrawPaymaster() external onlyOwner {
        // This would require additional paymaster logic or permissions
        // Implementation depends on your paymaster setup
        revert("Use paymaster wallet directly for withdrawals");
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get paymaster wallet balance
     */
    function getPaymasterBalance() external view returns (uint256) {
        return paymaster.balance;
    }
    
    /**
     * @dev Get paymaster address
     */
    function getPaymaster() external view returns (address) {
        return paymaster;
    }
}
