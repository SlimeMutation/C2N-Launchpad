import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  providers,
  utils as etherUtils
} from 'ethers'

const SET_ACCOUNT = 'wallet/SET_ACCOUNT'
const SET_WALLET = 'wallet/SET_WALLET'
const INIT_ACCOUNT = 'wallet/INIT_ACCOUNT'
const INIT_WALLET = 'wallet/INIT_WALLET'
const CONNECTING = 'wallet/CONNECTING'
const SHOW_WALLET = 'wallet/show'
const SET_CHAIN = 'wallet/SET_CHAIN'
const SET_ETH_TO_USD = 'wallet/SET_ETH_TO_USD'
const SET_IS_METAMASK_INSTALLED = 'wallet/SET_IS_METAMASK_INSTALLED'

const initialState = {
  wallet: null,
  account: null,
  connecting: false,
  show: false,
  chain: undefined,
  ethToUsd: 0,
  isWalletInstalled: true,
};

export default function reducer(state = initialState, action = {}) {
  let type = action.type.replace(/\/fulfilled$/g, '');
  switch (type) {
    case SET_ACCOUNT:
    case SET_WALLET:
    case INIT_ACCOUNT:
    case INIT_WALLET:
      return {
        ...state,
        [type.replace(/^.*_/g, '').toLowerCase()]: action.payload,
      }
    case CONNECTING:
      return {
        ...state,
        connecting: payload,
      }
    case SHOW_WALLET:
      return {
        ...state,
        show: action.payload,
      }
    case SET_CHAIN:
      return {
        ...state,
        chain: action.payload,
      }
    case SET_ETH_TO_USD:
      return {
        ...state,
        ethToUsd: action.payload,
      }
    case SET_IS_METAMASK_INSTALLED:
      return {
        ...state,
        isWalletInstalled: action.payload,
      }
    default:
      return state;
  }
}

export function setAccount(account) {
  return {
    type: SET_ACCOUNT,
    payload: account
  };
}

export function setWallet(wallet) {
  return {
    type: SET_WALLET,
    payload: wallet,
  };
}

export const initAccount = createAsyncThunk(INIT_ACCOUNT, async () => {
  const accounts = await window.ethereum && window.ethereum.request({ method: 'eth_requestAccounts' }).then(v=>v)
  return accounts[0];
})

export function initWallet() {
  return {
    type: INIT_WALLET,
    promise: () => {
      const provider = new providers.Web3Provider(window.ethereum);
      const wallet = provider.getSigner();
      return wallet;
    }
  };
}

export function setConnecting(value) {
  return {
    type: CONNECTING,
    payload: value,
  };
}

export function showWallet(value) {
  return {
    type: SHOW_WALLET,
    payload: value,
  }
}

export function setChain(value) {
  return {
    type: SET_CHAIN,
    payload: value,
  }
}

export function setEthToUsd(value) {
  return {
    type: SET_ETH_TO_USD,
    payload: value,
  }
}

export function setisWalletInstalled(value) {
  return {
    type: SET_IS_METAMASK_INSTALLED,
    payload: value,
  }
}