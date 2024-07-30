import styles from './WalletButton.module.scss'
import { useWallet } from '@src/hooks/useWallet';

import { Modal } from 'antd';
import { IconWalletButton } from '../icons';

/**
 * Button that connect wallet or show current account
 */
export default function WalletButton(props) {
  const {
    walletAddress,
    breContract,
    saleContract,
    getAccount,
    showWallet,
  } = useWallet();

  return walletAddress ? 
      (<div 
          className={[styles['wallet-button'], props.className].join(' ')}
          onClick={()=>showWallet(true)}
        >
        <IconWalletButton style={{verticalAlign:"text-bottom"}}></IconWalletButton> {walletAddress && walletAddress.replace?.(/^(.{6}).+(.{4})$/g, '$1...$2')}
        </div>)
      :
      <div className={styles['wallet-button']+' '+(props.className||'')} onClick={()=>showWallet(true)}>
        <IconWalletButton style={{verticalAlign:"text-bottom"}}></IconWalletButton> Connect Wallet
      </div>
}