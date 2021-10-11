Crypto Fighter Game 
===================
The crypto fighter game, is a little blockchain game used as final project for the smart contracts 
course and can be deployed via ganache on a development chain or on any other blockchain.

* The game and token are implemented as a ERC223 token contracts and reside in `/contracts/`
* WebUI was created with PureCSS and RiotJS, which are stored in `/src/`
* Project uses an out of date version of web3 and solidity!

Project Description
-------------------
CryptoFighter, as the name suggests, is a little blockchain game where the participants can fight
against each other in an arena (Currently not featured in the WebUI). Besides, fighting they can also
buy new items (armor) which directly influences their stats and therefore can have an impact on the
fights they take. The items can be bought with tokens in a shop like environment. The player can 
manage their items in a simple inventory view. Sometimes it may be hard to find other players, so
the WebUI also features some functions to automatically search for other players.

Building & Deployment
---------------------
* Build the smart contracts via truffle and copy the abi of the contracts into the files in `/src/abi/`
* Build the WebUI with rollup and drop a web3.min.js version `0.20.6` into `/public`
* Deploy the smart contracts with truffle into a chain and copy the contents of `/public` to a webserver root