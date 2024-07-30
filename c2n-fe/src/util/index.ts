import {
  providers,
  Contract,
  BigNumber,
  utils as etherUtils
} from 'ethers'
import {
  tokenAbi,
} from '@src/config'
import abiJSON from '@src/util/abis.json'
import { EARNED_TOKEN_ADDRESS } from '../config';

/**
 * Transfer bigNumber to string
 * @param {any} bigNumber 
 * @param {number} fractionDigits 
 * @returns {string|any}
 */
export function formatEther(bigNumber, fractionDigits=2): number|any {
  if (typeof bigNumber === 'number' || typeof bigNumber === 'string') {
    try{
      bigNumber = BigNumber.from((''+bigNumber).replace(/\.\d+/g, ''));
    }
    catch(e) {
      console.error(e);
      return bigNumber;
    }
  }
  if (!bigNumber || !(bigNumber instanceof BigNumber)) {
    return bigNumber;
  }
  try {
    return parseFloat(parseFloat(etherUtils.formatEther(BigNumber.from(bigNumber))).toFixed(fractionDigits))
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * Transfer bigNumber to string
 * @param {any} bigNumber 
 * @param {number} fractionDigits 
 * @returns {string|any}
 */
 export function formatUnits(bigNumber, fractionDigits=2, decimals=18): number|any {
  if (typeof bigNumber === 'number' || typeof bigNumber === 'string') {
    try{
      bigNumber = BigNumber.from((''+bigNumber).replace(/\.\d+/g, ''));
    }
    catch(e) {
      console.error(e);
      return bigNumber;
    }
  }
  if (!bigNumber || !(bigNumber instanceof BigNumber)) {
    return bigNumber;
  }
  try {
    return parseFloat(parseFloat(etherUtils.formatUnits(BigNumber.from(bigNumber), decimals)).toFixed(fractionDigits))
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * eth to number
 * @param {*} value 
 * @returns 
 */
export function parseEther(value) {
  try {
    return etherUtils.parseUnits(value+'', "ether");
  } catch(e) {
    console.error(e);
    return value;
  }
}

/**
 * 
 * @param value 
 * @returns 
 */
export function parseWei(value) {
  if(value instanceof BigNumber) {
    value = value.toString();
  }
  try {
    return etherUtils.parseUnits(value+'', "wei");
  } catch(e) {
    console.error(e);
    return value;
  }
}

export async function getAccounts() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts;
}

export function formatDate(timestamp:number|string, formatter){
  const d = new Date(new Number(timestamp) as number);
  if(!d || isNaN(d.getTime())) {
    return '';
  }

  function fillZero(num){
    return (num+'').replace(/^(\d)$/, '0$1');
  }

  let ret = formatter || 'YYYY-MM-DD';

  ret = ret.replace(/YYYY/gi, d.getFullYear())
  .replace(/MM/g, fillZero(d.getMonth()+1))
  .replace(/Month/g, 
    [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    ][d.getMonth()]
  )
  .replace(/DD/gi, fillZero(d.getDate()))
  .replace(/HH/gi, fillZero(d.getHours()))
  .replace(/mm/g, fillZero(d.getMinutes()))
  .replace(/ss/g, fillZero(d.getSeconds()));

  return ret;
}

// Convert a hex string to a byte array
export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
export function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
  }
  return hex.join("");
}

export function formatNumber(num) {
  num = num >= 1000000 ? (~~(num/1000000).toFixed(2) + 'M') : num;
  return /\d/.test(num) && ("" + num).replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") || ''
}

export function seperateNumWithComma(num) {
  return /\d/.test(num) && ("" + num).replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") || ''
}