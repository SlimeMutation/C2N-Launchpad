import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Layout, Row, Col, Menu, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons'

import { useResponsive } from '@src/hooks/useResponsive';
import { useWallet } from '@src/hooks/useWallet';
import { useMessage } from '@src/hooks/useMessage';

import styles from './HomeBanner.module.scss'
import { IconC2n } from '@src/components/icons';
import Image from 'next/image';
import { useAirdropContract } from '@src/hooks/useContract';
import { tokenInfos } from '@src/config';

export default function Header() {
  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  const {
    chain,
    walletAddress
  } = useWallet();
  const airdropContract = useAirdropContract()
  const {
    setSuccessMessage
  } = useMessage();

  const token = useMemo(() => {
    return tokenInfos.find(item => item.chainId == chain?.chainId) || tokenInfos[0];
  }, [chain]);

  function copy(text) {
    navigator.clipboard.writeText(text).then(function () {
      setSuccessMessage('Copied')
    }, function (err) {
    });
  }
  async function addToken(tokenAddress, symbolName) {
    if (!chain) {
      message.error('connect wallet and try again !')
      return
    }
    if (chain.chainId !== token.chainId) {
      message.error('switch network and try again !')
      return
    }
    await window.ethereum && window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: symbolName, // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
          image: '',
        }
      }
    });
  }
  const handleClaim = async () => {
    if (!airdropContract || !walletAddress) {
      message.warn('connect wallet first')
    }
    try {
      const res = await airdropContract.withdrawTokens()
      console.log(res, 're')
    } catch (error) {
      message.error(error.reason || error?.data?.message || error?.message || 'claim failed')
    }
  }

  return <div className={styles['home-banner']}>
    <Row justify="space-between" align="middle" className={styles['main']}>
      <Col span={isDesktopOrLaptop ? 16 : 24}>
        <Row gutter={16}>
          <Col span={isDesktopOrLaptop ? 4 : 24}>
            <Row justify="center" align="middle">
              <IconC2n className={styles.icon} />
            </Row>
          </Col>
          <Col span={isDesktopOrLaptop ? 20 : 24}>
            <Row>
              <Col span={24} className={styles['text1']}>
                {token.symbol} Tokens Online Now!
              </Col>
              <Col className={styles['text2']}>
                Contract Address: &nbsp;
                {
                  isDesktopOrLaptop ? <></> : <br />
                }
                {token.address}
                &nbsp;
                {/* <CopyOutlined className={styles['copy']} onClick={()=>{copy(token.address)}}></CopyOutlined> */}
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={isDesktopOrLaptop ? 4 : 12}>
        <div className={styles['button']}
          onClick={handleClaim}
        >
          Claim {token.symbol}
        </div>
      </Col>
      <Col span={isDesktopOrLaptop ? 4 : 12}>
        <div className={styles['button']}
          onClick={() => {
            addToken(token.address, token.symbol)
          }}
        >
          Add {token.symbol} to Wallet
        </div>
      </Col>
    </Row>
  </div>
}
