// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ERC223/token/ERC223/ERC223.sol";
import "./ERC223/token/ERC223/ERC223Mintable.sol";
import "./ERC223/token/ERC223/ERC223Burnable.sol";

contract CryptoFighterToken is ERC223Token, ERC223Mintable, ERC223Burnable {
    string private _name    = "CryptoFighterToken";
    string private _symbol  = "CFT";
    uint8 private _decimals = 0;

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

}