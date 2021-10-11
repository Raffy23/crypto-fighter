// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./CFRoles.sol";
import "./CFItemBase.sol";

/*
 * This contract provides various getter methods to query properties from items since the ABI of the
 * Item struct is not fixed we can't use it in external functions to return the properties
 */
abstract contract CFItems is CFItemBase {

    uint64 internal _maxItemID;
    mapping (uint64 => Item) internal _items;
    mapping (uint64 => bool) internal _isShopItem;
    mapping (uint64 => uint) internal _itemPrice;

    event ItemCreated(address indexed creator, uint64 indexed id);
    event ItemBought(address indexed from, uint slot, uint64 item);

    function createItem(uint slot, uint32 attack, uint32 defense, uint32 health, bool shopItem, uint shopPrice, string calldata name) external virtual;

    function maximumItemID() external view returns (uint) {
        return _maxItemID;
    }

    function getItemSlot(uint64 id) external view returns (EquipmentSlot) {
        return _items[id].slot;
    }

    function getItemAttack(uint64 id) external view returns (uint) {
        return _items[id].attack;
    }

    function getItemDefense(uint64 id) external view returns (uint) {
        return _items[id].defense;
    }

    function getItemHealth(uint64 id) external view returns (uint) {
        return _items[id].health;
    }

    function isShopItem(uint64 id) external view returns (bool) {
        return _isShopItem[id];
    }

    function getShopPrice(uint64 id) external view returns (uint) {
        return _itemPrice[id];
    }

    function getItemName(uint64 id) external view returns (string memory) {
        return _items[id].name;
    }

}