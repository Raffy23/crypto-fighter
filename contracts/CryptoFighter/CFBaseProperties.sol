// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./CFPlayerBase.sol";

contract CFBaseProperties is CFPlayerBase {

    uint internal _baseHealth;
    uint internal _attackCost;
    uint internal _startAttackPoints;
    uint internal _apPM;
    uint internal _tokenPrice;
    uint32 internal _maxInventorySize;
    Player internal _newPlayerTemplate;

    function baseHealth() external view returns (uint) {
        return _baseHealth;
    }

    function attackCost() external view returns (uint) {
        return _attackCost;
    }

    function startAttackPoints() external view returns (uint) {
        return _startAttackPoints;
    }

    function attackPointsPerMinute() external view returns (uint) {
        return _apPM;
    }

    function tokenPrice() external view returns (uint256) {
        return _tokenPrice;
    }

    function inventorySize() external view returns (uint) {
        return _maxInventorySize;
    }

    function getNewPlayerArmorHead() external view returns (uint64) {
        return _newPlayerTemplate.armorHead;
    }

    function getNewPlayerArmorChest() external view returns (uint64) {
        return _newPlayerTemplate.armorChest;
    }

    function getNewPlayerArmorArms() external view returns (uint64) {
        return _newPlayerTemplate.armorArms;
    }

    function getNewPlayerArmorPants() external view returns (uint64) {
        return _newPlayerTemplate.armorPants;
    }

    function getNewPlayerArmorShoes() external view returns (uint64) {
        return _newPlayerTemplate.armorShoes;
    }

}