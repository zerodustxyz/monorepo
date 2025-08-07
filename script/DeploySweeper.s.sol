// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Sweeper.sol";

contract DeploySweeperScript is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address paymasterAddress = vm.envAddress("PAYMASTER_ADDRESS");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the Sweeper contract with paymaster address
        Sweeper sweeper = new Sweeper(paymasterAddress);
        
        console.log("Sweeper deployed to:", address(sweeper));
        console.log("Paymaster address:", paymasterAddress);
        console.log("Owner address:", sweeper.owner());
        
        vm.stopBroadcast();
    }
}