// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface CFPlayerBase {

    struct Player {
        uint actionPoints;
        uint refreshTime;
        uint wins;
        uint losses;

        uint64 armorHead;
        uint64 armorChest;
        uint64 armorArms;
        uint64 armorPants;
        uint64 armorShoes;
    }

}
