const truffleAssert = require('truffle-assertions');

const Token = artifacts.require("CryptoFighterToken");
const Game = artifacts.require("CryptoFighterGame");

const assertEventNot = function(transactionHash, eventSignatureString) {
  assert.equal(
      containsEvent(transactionHash, eventSignatureString),
      false,
      "Expected NOT to contain event + eventSignatureString"
  );
}

const assertEvent = async function(transactionHash, eventSignatureString) {
  assert.equal(
      await containsEvent(transactionHash, eventSignatureString),
      true,
      "Expected to contain event + eventSignatureString"
  );
}

const assertAtLeastOneEvent = async function(transactionHash, eventSignatures) {
  let found = false;
  for (const eventSignatureString of eventSignatures) {
    found = await containsEvent(transactionHash, eventSignatureString)
    if (found)
      return;
  }

  assert.equal(false, "Expected to contain at least one event");
}

// the truffle tx object does not contain events that are emitted by another
// contract during a transaction (i.e. not the one that was called directly)
// solution: get web3 transaction receipt and look for event signature
const containsEvent = async function(transactionHash, eventSignatureString) {
  /*
  Since we cannot use the truffle tx return object, we have to filter
  the web3 transaction object obtained via getTransactionReceipt.

  Events are stored in the tx.logs array, where the topic[0] contains
  the keccak hash of the event signature.

  https://codeburst.io/deep-dive-into-ethereum-logs-a8d2047c7371
  */

  let tx = await web3.eth.getTransactionReceipt(transactionHash);
  let eventHash = web3.utils.sha3(eventSignatureString);

  let eventFound = false;
  for (let i = 0; i < tx.logs.length; i++) {
    let topic = tx.logs[i].topics[0];
    if(topic === eventHash) {
      eventFound = true;
      break;
    }
  }
  return eventFound;
}

contract("Game test", async accounts => {
  let tokenInstance;
  let gameInstance;

  let owner   = accounts[0];
  let player1 = accounts[1];
  let player2 = accounts[2];
  let player3 = accounts[3];
  let mod     = accounts[4];

  beforeEach("deploy and init", async () => {
    tokenInstance = await Token.new();
    await tokenInstance.mint(player1, 50);
    await tokenInstance.mint(player2, 50);
    await tokenInstance.mint(player3, 50);

    gameInstance = await Game.new(1000, 1, 10, 1, 16, tokenInstance.address);

    await tokenInstance.mint(owner, 100);
    await tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, 100, "0x0", {from: owner});

    await gameInstance.setTokenPrice(10);

    // Create initial new player stuff:
    await gameInstance.createItem(0, 1, 1, 10, false, 0, "item",  {from: owner});
    await gameInstance.createItem(1, 1, 1, 10, false, 0, "item",  {from: owner});
    await gameInstance.createItem(2, 1, 1, 10, false, 0, "item",  {from: owner});
    await gameInstance.createItem(3, 1, 1, 10, false, 0, "item",  {from: owner});
    await gameInstance.createItem(4, 1, 1, 10, false, 0, "item",  {from: owner});
    await gameInstance.setNewPlayerTemplate(1, 2, 3, 4, 5);
    await gameInstance.setCreatePlayers(true, {from: owner});
  });

  it("owner can't create item for non-existing slot", async () => {
    await truffleAssert.fails(gameInstance.createItem(99, 1, 1, 10, false, 0, "failed", {from: owner}));
  })

  it("player can't create state if game is closed", async () => {
    await gameInstance.setCreatePlayers(false, {from: owner});
    await truffleAssert.reverts(gameInstance.createNewPlayer({from: player1}));
  });

  it("player can't create multiple states", async () => {
    await gameInstance.createNewPlayer({from: player1});
    await truffleAssert.reverts(gameInstance.createNewPlayer({from: player1}));
  });

  it("player can create state", async () => {
    const result = await gameInstance.createNewPlayer({from: player1});

    truffleAssert.eventEmitted(result, 'PlayerSpawned', (ev) => {
      return ev['from'] === player1;
    },  'createNewPlayer should emmit correct PlayerSpawned event');
  });

  it("player can attack another player", async () => {
    await gameInstance.createNewPlayer({from: player1});
    await gameInstance.createNewPlayer({from: player2});

    const beforeWins = await gameInstance.getWins(player1)
    const beforeLosses = await gameInstance.getLosses(player1)
    const beforeAP = await gameInstance.actionPoints.call({from: player1});

    const tx = await gameInstance.attack(player2, {from: player1});

    const afterWins = await gameInstance.getWins(player1)
    const afterLosses = await gameInstance.getLosses(player1)
    const afterAP = await gameInstance.actionPoints.call({from: player1});

    assert(
        afterAP.lt(beforeAP),
        "Action Points should decrease after attacks"
    );

    await assertAtLeastOneEvent(
        tx.receipt.transactionHash,
        ['FightWon(address,address)', 'FightLost(address,address)']
    )

    assert(
        !(beforeWins.eq(afterWins) && beforeLosses.eq(afterLosses)),
        "Win or loss counter must be changed!"
    )
  });

  it("player can't attack non-existing player", async () => {
    await gameInstance.createNewPlayer({from: player1});
    await truffleAssert.reverts(gameInstance.attack(owner, {from: player1}));
  });

  it("non-player can't attack any other player", async () => {
    await gameInstance.createNewPlayer({from: player1});
    await truffleAssert.reverts(gameInstance.attack(player1));
  });

  it("player can buy items with tokens", async () => {
    const itemPrice = 10;
    await gameInstance.createItem(0, 9999, 9999, 9999, true, itemPrice, "item", {from: owner});
    await gameInstance.createNewPlayer({from: player1});

    const tx = await tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, itemPrice, "0x6", {from: player1});
    await truffleAssert.eventEmitted(tx, 'Transfer');

    await assertEvent(
        tx.receipt.transactionHash,
        'ItemBought(address,uint256,uint64)'
    );

    assert.equal(await tokenInstance.balanceOf.call(player1), 40);
    assert.equal(await gameInstance.inventory.call(0, {from: player1}), 6);
  })

  it("bought item is in inventory", async() => {
    const itemPrice = 10;
    await gameInstance.createItem(0, 9999, 9999, 9999, true, itemPrice, "item", {from: owner});
    await gameInstance.createNewPlayer({from: player1});

    await tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, itemPrice, "0x6", {from: player1});
    assert.equal(await gameInstance.inventory(0, {from: player1}), 6)
  })

  it("player can equip item", async() => {
    const itemPrice = 10;
    await gameInstance.createItem(0, 9999, 9999, 9999, true, itemPrice, "item", {from: owner});
    await gameInstance.createNewPlayer({from: player1});

    await tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, itemPrice, "0x6", {from: player1});
    await gameInstance.equipItem(0, {from: player1});
  })

  it("player can't equip non-existing item", async () => {
    await gameInstance.createNewPlayer({from: player1});
    await truffleAssert.reverts(gameInstance.equipItem(875764, {from: player1}));
  })

  it("player must pay the item price", async () => {
    await gameInstance.createItem(0, 9999, 9999, 9999, true, 99, "item", {from: owner});
    await truffleAssert.reverts(tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, 0, "0x6", {from: player1}));
  })

  it("player can't buy any item", async () => {
    await truffleAssert.reverts(tokenInstance.methods['transfer(address,uint256,bytes)'](gameInstance.address, 0, "0x1875398125", {from: player1}));
  })

  it("owner can't set token price to 0", async () => {
    await truffleAssert.reverts(gameInstance.setTokenPrice(0));
  })

  it("owner can remove moderator", async () => {
    await gameInstance.addModerator(mod, {from: owner});
    await gameInstance.fireModerator(mod, {from: owner});
    const r = await gameInstance.isMod({from: mod});
    assert.equal(r, false, "Fired moderator can't still be moderator!")
  })

  it("owner can add other owners", async () => {
    await gameInstance.addOwner(player3, {from: owner});
    assert(await gameInstance.isOwner({from: player3}));
  })

  it("owner can retire", async () => {
    await gameInstance.retireOwner({from: owner});
    assert(!await gameInstance.isOwner({from: owner}));
  })

  it("moderator can retire", async () => {
    await gameInstance.addModerator(mod, {from: owner});
    await gameInstance.retireModerator({from: mod});
    assert(!await gameInstance.isMod({from: mod}));
  })

});