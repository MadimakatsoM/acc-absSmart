// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SmartToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18;
    constructor() ERC20("SmartTestToken", "STT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mintTo(address reciever, uint256 amount) public {
        _mint(reciever, amount * 10 ** decimals());
    }
}