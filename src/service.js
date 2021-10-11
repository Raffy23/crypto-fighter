import gameContractABI from "./abi/gameContractABI";
import tokenContractABI from "./abi/tokenContractABI";
import {materializeAll, showError, slotToName} from "./lib";
import {AlertBox} from "./AlertBox";
import observable from '@riotjs/observable'

const contractInstances = { game: null, token: null }
const filters = { tx: new Map() }
const contractEvents  = observable()
const knownPlayers = []

let lastTokenPrice = 0
let itemsCache = null

export class GameContractService {

  events = contractEvents
  knownPlayers = knownPlayers

  self() { return web3.eth.defaultAccount }
  gameAddress() { return contractInstances.game.address.toLowerCase() }
  changeSelf(to) {
    web3.eth.defaultAccount = to
    this.events.trigger('player-changed', to)
  }

  canCreateNewPlayers() { return contractInstances.game.canCreateNewPlayers.call() }

  isPlayer() { return contractInstances.game.isPlayer.call() }
  isOwner()  { return contractInstances.game.isOwner.call()  }
  isModerator() { return contractInstances.game.isMod.call() }
  inventorySize() { return contractInstances.game.inventorySize.call() }
  inventory(slot) { return contractInstances.game.inventory.call(slot) }
  equipItem(slot) { return handleTransaction(contractInstances.game.equipItem, slot) }
  trashItem(slot) { return handleTransaction(contractInstances.game.trashItem, slot) }
  buyTokens(tokens) {
    if (lastTokenPrice === 0) {
      lastTokenPrice = this.tokenPrice()
    }

    const value = lastTokenPrice.mul(Number(tokens))
    return handleTransaction(contractInstances.game.buyToken, {value: value})
  }

  payout(address, amount) { return handleTransaction(contractInstances.game.payout, address, amount)}

  getMaxItemID() { return contractInstances.game.maximumItemID.call() }
  getItemName(id) { return contractInstances.game.getItemName.call(id) }
  getItem(id) {
    return {
      id: id,
      slot: slotToName(contractInstances.game.getItemSlot.call(id).toNumber()),
      attack: contractInstances.game.getItemAttack.call(id),
      defense: contractInstances.game.getItemDefense.call(id),
      health: contractInstances.game.getItemHealth.call(id),
      isShop: contractInstances.game.isShopItem.call(id),
      price: contractInstances.game.getShopPrice.call(id),
      name: contractInstances.game.getItemName.call(id)
    }
  }
  getAllItems() {
    if (itemsCache === null)
      itemsCache = materializeAll(1, this.getMaxItemID(), this.getItem)

    return itemsCache
  }
  getInventory() { return materializeAll(0, this.inventorySize(), this.inventory) }

  createItem(item) {return handleTransaction(contractInstances.game.createItem, item.slot, item.attack, item.defense, item.health, item.isShop, item.price, item.name) }
  buyItem(item) {
    const encodedParameter = "0x" + web3.padLeft(web3.toHex(item.id).slice(2), 2)
    return handleTransaction(
        contractInstances.token.transfer['address,uint256,bytes'],
        contractInstances.game.address, item.price,
        encodedParameter
    )
  }

  tokenSymbol() { return contractInstances.token.symbol.call() }
  tokenName()   { return contractInstances.token.name.call()   }
  tokenBalanceOf(addr) { return contractInstances.token.balanceOf.call(addr) }
  tokenBalanceOfSelf() { return contractInstances.token.balanceOf.call(this.self())}
  tokenBalanceOfGame() { return contractInstances.token.balanceOf.call(contractInstances.game.address) }
  tokenSupply() { return contractInstances.token.totalSupply.call() }
  canMintToken(address) { return contractInstances.token.isMinter.call(address) }

  tokenContractAddress() { return contractInstances.game.tokenContractAddress.call() }
  tokenPrice()  { return contractInstances.game.tokenPrice.call() }
  mintTokens(amount) { return handleTransaction(contractInstances.token.mint, contractInstances.game.address, amount)}
  setTokenPrice(price) { return handleTransaction(contractInstances.game.setTokenPrice, price) }
  setCreatePlayers(value) { return handleTransaction(contractInstances.game.setCreatePlayers, value) }
  createPlayer() { return handleTransaction(contractInstances.game.createNewPlayer) }

  getAttackOf(player) { return contractInstances.game.getAttackOf.call(player) }
  getAttackOfSelf()   { return contractInstances.game.getAttackOf.call(this.self()) }
  getDefenseOf(player) { return contractInstances.game.getDefenseOf.call(player) }
  getDefenseOfSelf()   { return contractInstances.game.getDefenseOf.call(this.self()) }
  getHealthOf(player) { return contractInstances.game.getHealthOf.call(player) }
  getHealthOfSelf()   { return contractInstances.game.getHealthOf.call(this.self()) }

  getArmorHead(player) { return contractInstances.game.getArmorHead.call(player) }
  getArmorHeadSelf() { return contractInstances.game.getArmorHead.call(this.self()) }
  getArmorChest(player) { return contractInstances.game.getArmorArms.call(player) }
  getArmorChestSelf() { return contractInstances.game.getArmorArms.call(this.self()) }
  getArmorArms(player) { return contractInstances.game.getArmorChest.call(player) }
  getArmorArmsSelf() { return contractInstances.game.getArmorChest.call(this.self()) }
  getArmorPants(player) { return contractInstances.game.getArmorPants.call(player) }
  getArmorPantsSelf() { return contractInstances.game.getArmorPants.call(this.self()) }
  getArmorShoes(player) { return contractInstances.game.getArmorShoes.call(player) }
  getArmorShoesSelf() { return contractInstances.game.getArmorShoes.call(this.self()) }

  getWins(player) { return contractInstances.game.getWins(player) }
  getWinsSelf() { return contractInstances.game.getWins(this.self()) }
  getLosses(player) { return contractInstances.game.getLosses(player) }
  getLossesSelf() { return contractInstances.game.getLosses(this.self()) }

  getPlayerStats(player) {
    return {
      id: player,
      attack: this.getAttackOf(player),
      defense: this.getDefenseOf(player),
      health: this.getHealthOf(player)
    }
  }

  getPlayer(player) {
    return {
      id: player,
      head: contractInstances.game.getArmorHead.call(player),
      arms: contractInstances.game.getArmorArms.call(player),
      chest: contractInstances.game.getArmorChest.call(player),
      pants: contractInstances.game.getArmorPants.call(player),
      shoes: contractInstances.game.getArmorShoes.call(player),
    }
  }

  getPlayerSelf() { return this.getPlayer(this.self()) }
  setPlayerTemplate(head, chest, arms, pants, shoes) {
    return handleTransaction(contractInstances.game.setNewPlayerTemplate, head, chest, arms, pants, shoes)
  }

  attack(other) { return handleTransaction(contractInstances.game.attack, other, {eGas: 1000}) }
  actionPoints() { return contractInstances.game.actionPoints.call() }
  refreshAP() { return handleTransaction(contractInstances.game.refreshAttackPoints) }
  getNotClaimedActionPoints() { return contractInstances.game.getNotClaimedActionPoints.call() }

  addOwner(address) { return handleTransaction(contractInstances.game.addOwner, address) }
  addModerator(address) { return handleTransaction(contractInstances.game.addModerator, address) }
  renounceOwner() { return handleTransaction(contractInstances.game.retireOwner) }
  renounceModerator() { return handleTransaction(contractInstances.game.retireModerator) }
  fireModerator(address) { return handleTransaction(contractInstances.game.fireModerator, address)}

  getNewPlayerArmorHead() { return contractInstances.game.getNewPlayerArmorHead.call() }
  getNewPlayerArmorChest()  { return contractInstances.game.getNewPlayerArmorChest.call() }
  getNewPlayerArmorArms()  { return contractInstances.game.getNewPlayerArmorArms.call() }
  getNewPlayerArmorPants()  { return contractInstances.game.getNewPlayerArmorPants.call() }
  getNewPlayerArmorShoes()  { return contractInstances.game.getNewPlayerArmorShoes.call() }

  searchForPlayers(blocks, exclude) {
    const latest = web3.eth.blockNumber
    const from   = Math.max(0, latest-blocks)

    return Promise.all([
      getAllEventsFor('PlayerSpawned', from, latest, (entry) => {return entry.args.from}),
      getAllEventsFor('FightWon', from, latest, (entry) => {return entry.args.attacker}),
      getAllEventsFor('FightLost', from, latest, (entry) => {return entry.args.attacker}),
    ]).then((players) => {
      const ex  = new Set(exclude)
      const res = new Set()

      for(const address of players[0]) if (!ex.has(address)) res.add(address)
      for(const address of players[1]) if (!ex.has(address)) res.add(address)
      for(const address of players[2]) if (!ex.has(address)) res.add(address)

      return res
    })
  }

}

export function loadGameContract(__address__) {
  console.log("LOADING Contracts ...")

  let address = null
  if (__address__ === undefined) {
    address = window.localStorage.getItem("game-contract")
  } else {
    address = __address__
  }

  if (!web3.isAddress(address))
    throw "No contract address was set!"

  const gameContract  = web3.eth.contract(gameContractABI.ABI)
  const tokenContract = web3.eth.contract(tokenContractABI.ABI)

  const gameContractI  = gameContract.at(address)
  const tokenAddress   = gameContractI.tokenContractAddress.call()
  if (!web3.isAddress(tokenAddress))
    throw "Can not query token address from contract!"

  const tokenContractI = tokenContract.at(tokenAddress)

  contractInstances.game  = gameContractI
  contractInstances.token = tokenContractI

  // Setup web3 filters:
  web3.eth.filter('latest', function(error, result) {
    if (error) console.error(error)
    else {
      const block = web3.eth.getBlock(result, true)
      for (const tx of block.transactions) {
        if(filters.tx.has(tx.hash)) {
          console.log(tx.hash + ' has been mined')

          filters.tx.get(tx.hash)(tx)
          filters.tx.delete(tx.hash)
        }
      }
    }
  })

  setupEventListener(contractInstances.game, 'ItemCreated')
  setupEventListener(contractInstances.game, 'PlayerSpawned')
  setupFilteredEventListener(contractInstances.game, 'FightWon', (event) => {
    return event.attacker === web3.eth.defaultAccount || event.defender === web3.eth.defaultAccount
  })
  setupFilteredEventListener(contractInstances.game, 'FightLost', (event) => {
    return event.attacker === web3.eth.defaultAccount || event.defender === web3.eth.defaultAccount
  })
  setupEventListener(contractInstances.game, 'TokenSupplied')
  setupEventListener(contractInstances.game, 'ItemBought')
  setupEventListener(contractInstances.game, 'TokenPriceChanged')
  setupFilteredEventListener(contractInstances.token, 'Transfer', (event) => {
    return event.from === web3.eth.defaultAccount || event.to === web3.eth.defaultAccount
  })
  setupEventListener(contractInstances.game, 'PlayerRegistrationStatus')
  setupEventListener(contractInstances.game, 'PlayerSpawned')

  contractEvents.on('TokenPriceChanged', (event) => {
    lastTokenPrice = event.price
  })

  contractEvents.on('ItemCreated', (event) => {
    itemsCache = null
  })

  contractEvents.on('PlayerSpawned', (event) => {
    knownPlayers.push(event.from)
  })

  console.debug("Initialization done!")
}

function setupEventListener(contract, name) {
  contract[name]({}).watch(function (error, result) {
    if (error) console.error(error)
    else contractEvents.trigger(name, {...result.args})
  })
}

function setupFilteredEventListener(contract, name, filter) {
  contract[name]({}).watch(function (error, result) {
    if (error) console.error(error)
    else if (filter({...result.args})) contractEvents.trigger(name, {...result.args})
  })
}

function getAllEventsFor(event, from, to, f) {
  const eventResults = []

  return new Promise((resolve, reject) => {
    contractInstances.game[event]({}, {fromBlock: from, toBlock: to }).get((error, result) => {
      if (error) reject(error)
      else for (const entry of result) {
        eventResults.push(f(entry))
      }

      resolve(eventResults)
    })
  })
}

export function handleTransaction(f, ...params) {
  return new Promise((resolve, reject) => {
    let transactionProps = {}
    let transactionParams = []

    if (params.length > 0) {
      const lastElement = params[params.length-1]
      if (typeof lastElement === 'object' && (lastElement.value !== undefined || lastElement.from !== undefined || lastElement.eGas !== undefined)) {
        transactionProps  = {...transactionProps, ...lastElement}
        transactionParams = params.slice(0, params.length-1)
      } else {
        transactionParams = params
      }
    }

    const transactionPropsBackup = {...transactionProps}
    f.estimateGas(...transactionParams, transactionProps, (error, gas) => {
      if (error) {
        showError("Estimate GAS:\n" + error)
        reject(error)
      } else {
        new AlertBox("#alert-area", {
          closeTime: 3000,
          persistent: false,
          hideCloseButton: false
        }).show(`Used ${gas} wei as gas for transaction`);

        let eGas = 0; if (transactionPropsBackup.eGas === undefined) eGas = 0; else eGas = transactionPropsBackup.eGas;
        transactionProps = {...transactionProps, gas: (gas + eGas)}
        f.sendTransaction(...transactionParams, transactionProps, (error, result) => {
          if (error) {
            showError(error)
            reject(error)
          } else {
            new AlertBox("#alert-area", {
              closeTime: 2000,
              persistent: false,
              hideCloseButton: false
            }).show(`Transaction was successful!`);
            filters.tx.set(result, resolve)
          }
        })
      }
    })
  });
}