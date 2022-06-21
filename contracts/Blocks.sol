// contracts/Blocks.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract Blocks is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    constructor() ERC1155("https://game.example/api/item/{id}.json") {
        // _mint(msg.sender, GOLD, 10**18, "");
        // _mint(msg.sender, SILVER, 10**27, "");
        // _mint(msg.sender, THORS_HAMMER, 1, "");
        // _mint(msg.sender, SWORD, 10**9, "");
        // _mint(msg.sender, SHIELD, 10**9, "");
    }

    address[16] public blockers;

    // Adopting a pet
    function mintABlock(uint blockId) public returns (uint) {
        require(blockId >= 0 && blockId <= 15);

        blockers[blockId] = msg.sender;

        _mint(msg.sender, blockId, "", "");

        return blockId;
    }

    // Retrieving the adopters
    function getBlockers() public view returns (address[16] memory) {
        return blockers;
    }
}