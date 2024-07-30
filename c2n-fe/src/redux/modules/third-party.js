const initialState = {
  bobaToUsd: 0,
  ethToUsd: 0,
  breToUsd: 0,
};

const SET_BOBA_TO_USD = '3rdParty/set_boba_to_usd';
const SET_ETH_TO_USD = '3rdParty/set_eth_to_usd';
const SET_BRE_TO_USD = '3rdParty/set_bre_to_usd';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_BOBA_TO_USD:
      return {
        ...state,
        bobaToUsd: action.payload,
      }
    case SET_ETH_TO_USD:
      return {
        ...state,
        ethToUsd: action.payload,
      }
    case SET_BRE_TO_USD:
      return {
        ...state,
        breToUsd: action.payload,
      }
    default:
      return state;
  }
}

export function setBobaToUsd(data) {
  return {
    type: SET_BOBA_TO_USD,
    payload: data,
  }
}

export function setEthToUsd(data) {
  return {
    type: SET_ETH_TO_USD,
    payload: data,
  }
}

export function setBreToUsd(data) {
  return {
    type: SET_BRE_TO_USD,
    payload: data,
  }
}