import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import createMiddleware from './middleware/clientMiddleware';
import reducer from './reducer'
import axios from '@src/api/axios'

export function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const middleware = [createMiddleware(client), reduxRouterMiddleware, thunk];

  let finalCreateStore;
  finalCreateStore = applyMiddleware(...middleware)(_createStore);

  // if (data) {
  //   data.pagination = Immutable.fromJS(data.pagination);
  // }
  const store = finalCreateStore(reducer, data);

  return store;
}


const store = createStore({}, axios, {});

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store