// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../ERC223/token/ERC223/SafeMath.sol";
import "../ERC223/token/ERC223/Roles.sol";
import "./CFItems.sol";
import "./CFPlayerBase.sol";
import "./CFBaseProperties.sol";

/*
 * This base class provides various getter methods to be able to query properties form the defined
 * player class.
 */
abstract contract CFPlayer is CFPlayerBase, CFItemBase, CFBaseProperties {
    using SafeMath for uint256;
    using SafeMath for uint64;
    using SafeMath for uint32;

    mapping (address => Player) internal _players;
    mapping (address => mapping (uint => uint64)) internal _playerInventory;

    modifier hasAccount(address sender) {
        require(_players[sender].refreshTime != 0);
        _;
    }

    modifier hasActionPoints(uint amount) {
        require(_players[msg.sender].actionPoints >= amount);
        _;
    }

    function equipItem(uint inventorySlot) external virtual;

    function setNewPlayerTemplate(uint64 head, uint64 chest, uint64 arms, uint64 pants, uint64 shoes) external virtual;

    event PlayerSpawned(address indexed from);
    function createNewPlayer() external virtual;

    function getAttackOf(address _player) public virtual view returns (uint);

    function getDefenseOf(address _player) public virtual view returns (uint);

    function getHealthOf(address _player) public virtual view returns (uint);

    function getArmorHead(address _player) external hasAccount(_player) view returns (uint64) {
        return _players[_player].armorHead;
    }

    function getArmorArms(address _player) external hasAccount(_player) view returns (uint64) {
        return _players[_player].armorChest;
    }

    function getArmorChest(address _player) external hasAccount(_player) view returns (uint64) {
        return _players[_player].armorArms;
    }

    function getArmorPants(address _player) external hasAccount(_player) view returns (uint64) {
        return _players[_player].armorPants;
    }

    function getArmorShoes(address _player) external hasAccount(_player) view returns (uint64) {
        return _players[_player].armorShoes;
    }

    function actionPoints() hasAccount(msg.sender) external view returns (uint) {
        return _players[msg.sender].actionPoints;
    }

    function isPlayer() external view returns (bool) {
        return _players[msg.sender].refreshTime > 0;
    }

    function inventory(uint slot) hasAccount(msg.sender) external view returns (uint64) {
        return _playerInventory[msg.sender][slot];
    }

    function trashItem(uint slot) hasAccount(msg.sender) external {
        _playerInventory[msg.sender][slot] = 0;
    }

    function getFreeInventorySlotIndex(address _player) internal view returns (uint256) {
        for (uint slot = 0; slot < _maxInventorySize; slot++) {
            if (_playerInventory[_player][slot] == 0)
                return slot;
        }

        return _maxInventorySize;
    }

    function getNotClaimedActionPoints() external hasAccount(msg.sender) view returns (uint){
        return ((now - _players[msg.sender].refreshTime) / 1 minutes) * _apPM;
    }

    function refreshAttackPoints() external hasAccount(msg.sender) {
        uint points = ((now - _players[msg.sender].refreshTime) / 1 minutes) * _apPM;

        _players[msg.sender].actionPoints = _players[msg.sender].actionPoints.add(points);
        _players[msg.sender].refreshTime  = now;
    }

    function getWins(address player) external hasAccount(player) view returns (uint) {
        return _players[player].wins;
    }

    function getLosses(address player) external hasAccount(player) view returns (uint) {
        return _players[player].losses;
    }

}