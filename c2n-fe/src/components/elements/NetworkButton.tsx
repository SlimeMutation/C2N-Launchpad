import { useMemo } from 'react'
import styles from './NetworkButton.module.scss'
import { useWallet } from '@src/hooks/useWallet';
import { useMessage } from '@src/hooks/useMessage';

import { Dropdown, message, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { IconDown } from '../icons';

/**
 * Button that connect wallet or show current account
 */
export default function NetworkButton(props) {
  const {
    walletAddress,
    breContract,
    saleContract,
    getAccount,
    showWallet,
    chain,
    validChains,
    switchNetwork,
  } = useWallet();

  const {
    setErrorMessage,
  } = useMessage()

  const onButtonClick = switchNetwork

  const menus: MenuProps['items'] = useMemo(() => validChains.map((item, i) => {
    return {
      key: i,
      label:
        (<div className={[styles['menu-item'], item.chainId == chain?.chainId ? styles['disabled'] : ''].join(' ')}
          onClick={() => onButtonClick(item.chainId)}
          key={item.chainId}>
          <item.logo className={styles['logo']}></item.logo>
          <div
            className={styles['text']}>{item.name}</div>
        </div>)
    }
  }), [validChains, chain])

  const chainMeta = useMemo(() => {
    let target = validChains.find((item) => { return item?.chainId == chain?.chainId });
    return target;
  }, [chain]);

  return (
    <Dropdown
      menu={{ items: menus }}
    >{
        walletAddress ? (<div
          className={[styles['network-button'], props.className].join(' ')}
        >
          {
            chainMeta && chainMeta.logo ?
              (<chainMeta.logo></chainMeta.logo>)
              : <div className={styles['logo']}></div>
          }
          <div className={styles['text']}>{chainMeta && chainMeta.name || 'Switch Network'}</div>
          <IconDown className={styles['down']}></IconDown>
        </div>) : (<div />)
      }
    </Dropdown>
  )
}