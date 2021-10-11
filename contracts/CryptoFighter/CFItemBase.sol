// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

/*
 * Base class that defines the Item properties and such for the Crypto Fighter game
 */
interface CFItemBase {

    enum EquipmentSlot { Head, Chest, Arms, Pants, Shoes }

    struct Item {
        EquipmentSlot slot;
        uint64 attack;
        uint64 defense;
        uint128 health;
        string name;
    }

}