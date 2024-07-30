import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  providers,
  Contract,
  utils as etherUtils
} from 'ethers'

import {
  STAKED_TOKEN_ADDRESS,
} from '@src/config'
import abiJSON from '@src/util/abis.json'

const SET_WALLET_ADDRESS = 'contract/SET_WALLET_ADDRESS'
const SET_SIGNER = 'contract/SET_SIGNER'
const SET_CONTRACTS = 'contract/SET_CONTRACTS'
const INIT_CONTRACTS = 'contract/INIT_CONTRACTS'
const SET_BALANCE = 'contract/SET_BALANCE'
const SET_SYMBOL = 'contract/SET_SYMBOL'
const SET_BRESYMBOL = 'contract/SET_BRESYMBOL'
const SET_DEPOSITED = 'contract/SET_DEPOSITED'
const SET_ALLOWANCE = 'contract/SET_ALLOWANCE'
const SET_LOADING = 'contract/SET_LOADING'

const initialState = {
  walletAddress: null,
  signer: null,
  stakingContract: null,
  saleContract: null,
  depositTokenContract: null,
  breContract: null,
  signer: null,
  contractsReady: false,
  // numbers
  // token deposited
  balance: undefined,
  symbol: undefined,
  earnedSymbol: undefined,
  deposited: undefined,
  allowance: undefined,
  loading: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WALLET_ADDRESS: 
      return {
        ...state,
        walletAddress: action.payload,
      }
    case SET_SIGNER:
    case SET_BALANCE:
    case SET_SYMBOL:
    case SET_BRESYMBOL:
    case SET_DEPOSITED:
    case SET_ALLOWANCE:
      return {
        ...state,
        [action.type.replace(/^.*_/g, '').toLowerCase()]: action.payload,
      }
    case INIT_CONTRACTS:
      return {
        ...state,
        ...action.payload,
        contractsReady: true,
      }
    case SET_CONTRACTS:
      return {
        ...state,
        ...action.payload,
        contractsReady: true,
      }
    case SET_LOADING: 
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state;
  }
}

export function setWalletAddress(data) {
  return {
    type: SET_WALLET_ADDRESS,
    payload: data,
  }
}

export function setSigner(data) {
  return {
    type: SET_SIGNER,
    payload: data,
  }
}

export function setContracts(contracts) {
  return {
    type: SET_CONTRACTS,
    payload: contracts,
  }
}

export function setBalance(data) {
  return {
    type: SET_BALANCE,
    payload: data,
  }
}

export function setAllowance(data) {
  return {
    type: SET_ALLOWANCE,
    payload: data,
  }
}

export function setDeposited(data) {
  return {
    type: SET_DEPOSITED,
    payload: data,
  }
}

export function setDepositSymbol(data) {
  return {
    type: SET_SYMBOL,
    payload: data,
  }
}

export function setEarnedSymbol(data) {
  return {
    type: SET_BRESYMBOL,
    payload: data,
  }
}

export function setLoading(data) {
  return {
    type: SET_LOADING,
    payload: data,
  }
}