// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ERC223/token/ERC223/IERC223Recipient.sol";
import "./ERC223/token/ERC223/SafeMath.sol";
import "./ERC223/token/ERC223/Roles.sol";
import "./CryptoFighterToken.sol";
import "./CryptoFighter/CFRoles.sol";
import "./CryptoFighter/CFItems.sol";
import "./CryptoFighter/CFPlayer.sol";
import "./CryptoFighter/CFUtilites.sol";

contract CryptoFighterGame is IERC223Recipient, CFRoles, CFItems, CFPlayer, CFUtilities {
    using Roles for Roles.Role;
    using SafeMath for uint256;

    CryptoFighterToken internal _tokenContract;

    uint private seed;
    bool private _canCreatePlayers = false;

    constructor(uint baseHealth, uint attackCost, uint attackPoints, uint apPM, uint32 maxInventorySize, CryptoFighterToken tokenContract) public {
        require(baseHealth > 0);
        require(attackCost > 0);
        require(attackPoints > 0);
        require(apPM > 0);
        require(maxInventorySize > 0);

        _baseHealth = baseHealth;
        _attackCost = attackCost;
        _startAttackPoints = attackPoints;
        _apPM = apPM;
        _maxInventorySize = maxInventorySize;
        _maxItemID = 1;

        _owners.add(msg.sender);
        _tokenContract = tokenContract;

        seed = uint(keccak256(abi.encodePacked(now, msg.sender, tokenContract)));
    }

    modifier canSpawnPlayer() {
        require(_players[msg.sender].refreshTime == 0);
        require(_canCreatePlayers);
        _;
    }

    // ============================================================================================
    //                                      Actual fight logic
    // ============================================================================================

    event FightWon(address indexed attacker, address indexed defender);
    event FightLost(address indexed attacker, address indexed defender);

    function attack(address _enemy) external hasAccount(msg.sender) hasAccount(_enemy) hasActionPoints(_attackCost) {
        _players[msg.sender].actionPoints -= _attackCost;

        seed = uint(keccak256(abi.encodePacked(now, msg.sender, seed, _players[msg.sender].refreshTime, _players[_enemy].refreshTime)));

        uint meAttack  = getAttackOf(msg.sender);
        uint meDefense = getDefenseOf(msg.sender);
        uint meHealth  = getHealthOf(msg.sender);

        uint enemyAttack  = getAttackOf(_enemy);
        uint enemyDefense = getDefenseOf(_enemy);
        uint enemyHealth  = getHealthOf(_enemy);

        for (uint round = 0; round < 3; round++) {
            uint rand = uint(keccak256(abi.encodePacked(seed, round)));
            if (rand % (meAttack + enemyDefense) < meAttack) {
                if (enemyHealth >= meAttack) enemyHealth.sub(meAttack);
                else {
                    seed = rand;
                    enemyHealth = 0;
                    break;
                }
            }

            rand = uint(keccak256(abi.encodePacked(rand, seed)));
            if (rand % (enemyAttack + meDefense) < enemyAttack) {
                if (meHealth >= enemyAttack) meHealth.sub(enemyAttack);
                else {
                    seed = rand;
                    meHealth = 0;
                    break;
                }
            }

            seed = rand;
            if (enemyHealth == 0 || meHealth == 0)
                break;
        }

        if (enemyHealth < meHealth) {
            _players[msg.sender].wins = _players[msg.sender].wins.add(1);

            emit FightWon(msg.sender, _enemy);
        } else {
            _players[msg.sender].losses = _players[msg.sender].losses.add(1);

            emit FightLost(msg.sender, _enemy);
        }
    }

    // ============================================================================================
    //                                    Marketplace
    // ============================================================================================

    event TokenPriceChanged (address from, uint price);
    function setTokenPrice(uint _price) external onlyOwner {
        require(_price > 0);

        _tokenPrice = _price;
        emit TokenPriceChanged(msg.sender, _price);
    }

    function buyToken() external payable {
        require(_tokenPrice > 0, "Token price was not set!");

        uint256 tokens = msg.value.div(_tokenPrice);
        _tokenContract.transfer(msg.sender, tokens);
    }

    event TokenSupplied(address indexed from, uint256 amount);
    function tokenFallback(address _from, uint _value, bytes calldata _data) external override {
        require(msg.sender == address(_tokenContract), "We don't accept these tokens here");

        uint itemID = bytesToUint(_data);
        require(itemID <= _maxItemID, "ItemID > max shop item id");

        if (itemID == 0) {
            require(_owners.has(_from), "Only owners can supply the game with tokens");
            emit TokenSupplied(_from, _value);
        }
        else {
            require(_players[_from].refreshTime != 0, "_from must be a player");
            require(_isShopItem[uint64(itemID)], "itemID is not buyable!");
            require(_itemPrice[uint64(itemID)] == _value, "given _value doesn't equal the price of the item");

            uint inventorySlot = getFreeInventorySlotIndex(_from);
            require(inventorySlot < _maxInventorySize, "No free inventory slots");

            _playerInventory[_from][inventorySlot] = uint64(itemID);
            emit ItemBought(_from, inventorySlot, uint64(itemID));
        }
    }

    // ============================================================================================
    //                                          Register
    // ============================================================================================

    event PlayerRegistrationStatus(bool value);
    function setCreatePlayers(bool value) external onlyPrivileged {
        if (value) {
            require(_newPlayerTemplate.armorHead  > 0 && _newPlayerTemplate.armorHead  <= _maxItemID);
            require(_newPlayerTemplate.armorChest > 0 && _newPlayerTemplate.armorChest <= _maxItemID);
            require(_newPlayerTemplate.armorArms  > 0 && _newPlayerTemplate.armorArms  <= _maxItemID);
            require(_newPlayerTemplate.armorPants > 0 && _newPlayerTemplate.armorPants <= _maxItemID);
            require(_newPlayerTemplate.armorShoes > 0 && _newPlayerTemplate.armorShoes <= _maxItemID);
        }

        _canCreatePlayers = value;
        emit PlayerRegistrationStatus(value);
    }

    function canCreateNewPlayers() external view returns (bool) {
        return _canCreatePlayers;
    }

    // ============================================================================================
    //                                          ITEM
    // ============================================================================================

    function equipItem(uint inventorySlot) external override hasAccount(msg.sender) {
        uint64 itemID      = _playerInventory[msg.sender][inventorySlot];
        uint64 tmp         = 0;
        require(itemID > 0);

        EquipmentSlot slot = _items[itemID].slot;
        if     (slot == EquipmentSlot.Head ) { tmp = _players[msg.sender].armorHead;  _players[msg.sender].armorHead  = itemID; }
        else if(slot == EquipmentSlot.Chest) { tmp = _players[msg.sender].armorChest; _players[msg.sender].armorChest = itemID; }
        else if(slot == EquipmentSlot.Arms ) { tmp = _players[msg.sender].armorArms;  _players[msg.sender].armorArms  = itemID; }
        else if(slot == EquipmentSlot.Pants) { tmp = _players[msg.sender].armorPants; _players[msg.sender].armorPants = itemID; }
        else if(slot == EquipmentSlot.Shoes) { tmp = _players[msg.sender].armorShoes; _players[msg.sender].armorShoes = itemID; }
        else {
            revert("Unknown Equipment slot!");
        }

        _playerInventory[msg.sender][inventorySlot] = tmp;
    }

    function createItem(uint slot, uint32 attack, uint32 defense, uint32 health, bool shopItem, uint shopPrice, string calldata name) external override onlyPrivileged {
        _items[_maxItemID] = Item(EquipmentSlot(slot), attack, defense, health, name);

        if (shopItem) {
            _isShopItem[_maxItemID] = true;
            _itemPrice[_maxItemID]  = shopPrice;
        }

        emit ItemCreated(msg.sender, _maxItemID);

        uint64 newMaxID = _maxItemID + 1;
        require(newMaxID > 0);

        _maxItemID += 1;
    }

    // ============================================================================================
    //                                          PLAYER
    // ============================================================================================

    function setNewPlayerTemplate(uint64 head, uint64 chest, uint64 arms, uint64 pants, uint64 shoes) override external onlyOwner {
        require(head  > 0 && head  <= _maxItemID);
        require(chest > 0 && chest <= _maxItemID);
        require(arms  > 0 && arms  <= _maxItemID);
        require(pants > 0 && pants <= _maxItemID);
        require(shoes > 0 && shoes <= _maxItemID);

        _newPlayerTemplate.armorHead  = head;
        _newPlayerTemplate.armorChest = chest;
        _newPlayerTemplate.armorArms  = arms;
        _newPlayerTemplate.armorPants = pants;
        _newPlayerTemplate.armorShoes = shoes;
    }

    function createNewPlayer() override external canSpawnPlayer {
        _players[msg.sender] = Player({
            actionPoints: _startAttackPoints,
            refreshTime: block.timestamp,
            wins: 0,
            losses: 0,

            armorHead: _newPlayerTemplate.armorHead,
            armorChest: _newPlayerTemplate.armorChest,
            armorArms: _newPlayerTemplate.armorArms,
            armorPants: _newPlayerTemplate.armorPants,
            armorShoes: _newPlayerTemplate.armorShoes
            });

        emit PlayerSpawned(msg.sender);
    }

    function getAttackOf(address _player) public hasAccount(_player) override view returns (uint) {
        Player memory player = _players[_player];
        return
        _items[player.armorHead ].attack +
        _items[player.armorChest].attack +
        _items[player.armorArms ].attack +
        _items[player.armorPants].attack +
        _items[player.armorShoes].attack;
    }

    function getDefenseOf(address _player) public hasAccount(_player) override view returns (uint) {
        Player memory player = _players[_player];
        return
        _items[player.armorHead ].defense +
        _items[player.armorChest].defense +
        _items[player.armorArms ].defense +
        _items[player.armorPants].defense +
        _items[player.armorShoes].defense;
    }

    function getHealthOf(address _player) public hasAccount(_player) override view returns (uint) {
        Player memory player = _players[_player];
        return _baseHealth +
        _items[player.armorHead ].health +
        _items[player.armorChest].health +
        _items[player.armorArms ].health +
        _items[player.armorPants].health +
        _items[player.armorShoes].health;
    }

    function tokenContractAddress() external view returns (address) {
        return address(_tokenContract);
    }

    function payout(address payable _receiver, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount);
        _receiver.transfer(_amount);
    }

    // ============================================================================================
    //                                    Base property setter
    // ============================================================================================

    function setBaseHealth(uint baseHealth) external onlyModerator {
        require(baseHealth > 0);
        _baseHealth = baseHealth;
    }

    function setAttackCost(uint attackCost) external onlyModerator {
        require(attackCost > 0);
        _attackCost = attackCost;
    }

    function setStartAttackPoints(uint startAttackPoints) external onlyModerator {
        require(startAttackPoints > 0);
        _startAttackPoints = startAttackPoints;
    }

    function setAttackPointsPerMinute(uint apM) external onlyModerator {
        require(apM > 0);
        _apPM = apM;
    }

    function setInventorySize(uint32 size) external onlyModerator {
        require(size > _maxInventorySize);
        _maxInventorySize = size;
    }

    function setCryptoFighterTokenAddress(CryptoFighterToken tokenContract) external onlyOwner {
        _tokenContract = tokenContract;
    }

}