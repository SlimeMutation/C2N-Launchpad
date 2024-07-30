import { ModalProvider, light, dark } from '@pancakeswap/uikit'
import { Web3ReactProvider } from '@web3-react/core'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { getLibrary } from '@src/util/web3React'
import { Store } from '@reduxjs/toolkit'
import localStore from '@src/redux/store'

const ThemeProviderWrapper = (props) => {
  return <ThemeProvider theme={dark} {...props} />
}

export const Providers = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
        <Provider store={localStore}>
          {children}
        </Provider>
    </Web3ReactProvider>
  )
}

export default Providers
