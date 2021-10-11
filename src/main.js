import {component} from 'riot'
import App from './app.riot'
import {AlertBox} from "./AlertBox";

const remoteAddress = "http://localhost:9545"

/* Web3 must be an external plugin, otherwise building the bundle doesn't work */
/* Load Web3 for development network and set account 0 as default account ...  */
//if (typeof web3 === 'undefined') {
try {
  window['web3'] = new Web3(new Web3.providers.HttpProvider(remoteAddress));
  if (web3.eth.defaultAccount === undefined)
    web3.eth.defaultAccount = web3.eth.accounts[0]
} catch (error) {
  console.error(error)
  alert(error)
}
/*} else if (window.ethereum) {
  console.log("Injected ethereum detected, building web3 from it ...")
  window.web3 = new Web3(ethereum);
  ethereum.enable().then(() => {
    console.log("Enabled!")
  })
} else {
  console.log("Injected Web3, detected ... this may not work correctly")
  window.web3 = new Web3(web3.currentProvider);
}*/

/* Mount App component */
component(App)(document.getElementById('app-root'))