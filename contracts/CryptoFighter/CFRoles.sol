// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../ERC223/token/ERC223/Roles.sol";

/*
 * This contract does handle the role management part of the Crypto Fighter game
 */
contract CFRoles {
    using Roles for Roles.Role;

    Roles.Role internal _owners;
    Roles.Role internal _mods;

    modifier onlyOwner() {
        require(_owners.has(msg.sender));
        _;
    }

    modifier onlyModerator() {
        require(_mods.has(msg.sender));
        _;
    }

    modifier onlyPrivileged() {
        require(_owners.has(msg.sender) || _mods.has(msg.sender));
        _;
    }

    function addOwner(address newOwner) external onlyOwner {
        _owners.add(newOwner);
    }

    function retireOwner() external onlyOwner {
        _owners.remove(msg.sender);
    }

    function addModerator(address newMod) external onlyOwner {
        _mods.add(newMod);
    }

    function retireModerator() external onlyModerator {
        _mods.remove(msg.sender);
    }

    function fireModerator(address mod) external onlyOwner {
        require(_mods.has(mod));
        _mods.remove(mod);
    }

    function isOwner() external view returns (bool) {
        return _owners.has(msg.sender);
    }

    function isMod() external view returns (bool) {
        return _mods.has(msg.sender);
    }

}
