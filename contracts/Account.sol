// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// u
// import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "hardhat/console.sol";

// IAccount is needed as it's a standard way for smart accounts to verify and proccess userops
// this smart account doesn't have an address
contract Account is IAccount {
    uint256 public count; // to debug
    address public owner;
    address public entryPoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

    constructor(address _owner) {
        owner = _owner;
    }

    // Verifies that a user operation is valid and allowed by checking:
    // - The user's signature (to ensure the request is genuinely from them).
    // - The nonce (to prevent the same operation from being processed more than once aka replay attack).
    // If everything is valid, it returns a success code, 0.
    // If not, it either returns a specific error code, 1 or reverts the transaction.

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256)
    external view returns (uint256 validationData) {

        address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);
        return owner == recovered ? 0 : 1;
    }

    function counter() external {
        count++;
    }

    function setEntryPoint(address epAddress) public {
        // require(entryPoint == address(0), "Account: entry point already set");
        entryPoint = epAddress;
    }

    function execute(address target, uint256 value, bytes calldata data) external {
        require(msg.sender == entryPoint || msg.sender == address(this), "Account: only entrypoint or account can execute");
        (bool success, ) = target.call{value: value}(data);
        console.log(success);
        require(success, "Account: call failed");
    }
}

// Create 1: hash (deployer(AF) + nonce)
// Create 2 : hash (bytecode + salt)

contract AccountFactory {
    function createAccount(address owner) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner))); 

        bytes memory creationCode = type(Account).creationCode;

        bytes memory bytecode = abi.encodePacked(creationCode, abi.encode(owner));

        address addr = Create2.computeAddress(salt, keccak256(bytecode)); // will provided the predicted address of smart wallet

        uint256 codeSize = addr.code.length;
        
        if (codeSize > 0) {
            return addr;
        }

        return deploy(salt, bytecode);
    }
    
    function deploy(bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        // require(address(this).balance >= amount, "Create2: insufficient balance");
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}

