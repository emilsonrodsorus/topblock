pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract Migrations is ERC1155  {
  address public owner;
  uint public last_completed_migration;

  constructor() ERC1155("https://game.example/api/item/{id}.json") {
        // _mint(msg.sender, GOLD, 10**18, "");
        // _mint(msg.sender, SILVER, 10**27, "");
        // _mint(msg.sender, THORS_HAMMER, 1, "");
        // _mint(msg.sender, SWORD, 10**9, "");
        // _mint(msg.sender, SHIELD, 10**9, "");
    }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
