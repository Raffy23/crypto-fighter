import gameContractABI from "./abi/gameContractABI"
import tokenContractABI from "./abi/tokenContractABI"
import {AlertBox} from "./AlertBox";

export function showError(error) {
  new AlertBox("#alert-area", {
    closeTime: 3000,
    persistent: false,
    hideCloseButton: false
  }).show(error);
}

export function slotToName(slot) {
  switch (slot) {
    case 0: return "Head"
    case 1: return "Chest"
    case 2: return "Arms"
    case 3: return "Pants"
    case 4: return "Shoes"
    default:
      return slot
  }
}

export function materializeAll(start, end, f) {
  const array = []

  for(let i=start; i<end; i++) {
    array.push(f(i))
  }

  return array
}

Array.prototype.contains = function(f) {
  for (const element of this) {
    if (f(element))
      return true
  }

  return false
}