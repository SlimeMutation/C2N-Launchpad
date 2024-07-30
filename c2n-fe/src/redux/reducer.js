import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';
// import { reducer as reduxAsyncConnect } from 'redux-async-connect';
// import {reducer as form} from 'redux-form';
import auth from './modules/auth';
import wallet from './modules/wallet';
import contract from './modules/contract';
import thirdParty from './modules/third-party';
import global from './modules/global';
import mediaQuery from './modules/media-query';

export default combineReducers({
  auth: auth,
  wallet: wallet,
  contract: contract,
  thirdParty: thirdParty,
  global: global,
  mediaQuery: mediaQuery,
});
