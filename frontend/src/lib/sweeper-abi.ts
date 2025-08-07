// ZeroDust Sweeper Contract ABI
export const SWEEPER_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_paymaster",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function", 
    "name": "sweepAndBridge",
    "inputs": [
      {
        "name": "destinationChainId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "estimatedGasCost", 
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "ethPriceUSD",
        "type": "uint256", 
        "internalType": "uint256"
      },
      {
        "name": "bungeeCalldata",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "calculateFee", 
    "inputs": [
      {
        "name": "estimatedGasCost",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "ethPriceUSD",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "totalFee",
        "type": "uint256", 
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paymaster", 
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collectedFees",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBalance",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256", 
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPaymasterBalance",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256" 
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SweepInitiated",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sourceChainId", 
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "destinationChainId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false, 
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SweepCompleted",
    "inputs": [
      {
        "name": "user",
        "type": "address", 
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sourceChainId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "destinationChainId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "transactionHash",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  }
] as const;