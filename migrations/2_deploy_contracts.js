const Web3 = require("web3");
const web3 = new Web3();

const Token = artifacts.require("CryptoFighterToken");
const Game = artifacts.require("CryptoFighterGame");

module.exports = async function(deployer) {
  const beerPrice = web3.utils.toWei("1", "ether");

  await deployer.deploy(Token);
  await deployer.deploy(Game, 1000, 1, 10, 1, 16, Token.address);
};