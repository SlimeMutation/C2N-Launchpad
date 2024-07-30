import { useCallback, useEffect } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { NoBscProviderError } from '@binance-chain/bsc-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector'
import { ConnectorNames, connectorLocalStorageKey } from '@pancakeswap/uikit'
import { connectorsByName } from '@src/util/web3React'
import { setupNetwork } from '@src/util/wallet'
import { useMessage } from './useMessage'
import { useAppDispatch } from '@src/redux/hooks'
import { useLocalStorage } from './useLocalStorage'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { chainId, activate, deactivate, account, active } = useWeb3React()
  const { setErrorMessage } = useMessage()
  const { getLocal } = useLocalStorage();

  const login:(connectorID:string)=>Promise<any> = useCallback(
    (connectorID: string) => {
      const connector = connectorsByName[connectorID]
      if (connector) {
        return activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            const hasSetup = await setupNetwork()
            if (hasSetup) {
              activate(connector)
            }
          } else {
            window.localStorage.removeItem(connectorLocalStorageKey)
            if (error instanceof NoEthereumProviderError || error instanceof NoBscProviderError) {
              setErrorMessage('No provider was found')
            } else if (
              error instanceof UserRejectedRequestErrorInjected ||
              error instanceof UserRejectedRequestErrorWalletConnect
            ) {
              if (connector instanceof WalletConnectConnector) {
                const walletConnector = connector as WalletConnectConnector
                walletConnector.walletConnectProvider = null
              }
              setErrorMessage('Please authorize to access your account')
            } else {
              setErrorMessage(error.message)
            }
          }
        }).then(() => {
          window.localStorage.setItem('bobabrewery_auto_connect', '1');
        })
      } else {
        setErrorMessage('The connector config of '+ connectorID + ' is wrong, ')
        return Promise.reject();
      }
    },
    [activate, setErrorMessage],
  )

  const logout = useCallback(() => {
    deactivate()
    // clearUserStates(dispatch, chainId)
  }, [deactivate, dispatch, chainId])


  useEffect(function mount(){
    let autoConnect = window.localStorage.getItem('bobabrewery_auto_connect');
    let connectorId = window.localStorage.getItem(connectorLocalStorageKey);
    if(connectorId && autoConnect) {
      window.localStorage.removeItem('bobabrewery_auto_connect');
      login(connectorId);
    }
  }, []);

  return { login, logout, account, active, chainId }
}

export default useAuth
