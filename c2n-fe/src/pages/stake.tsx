import type { AppProps } from 'next/app'

import Link from 'next/link'
import { Row, Col } from 'antd'

import styles from './stake.module.scss'
import StakingForm from '@src/containers/StakingForm/StakingForm'
import BasicButton from '@src/components/elements/Button.Basic'
import { useWallet } from '@src/hooks/useWallet';
import { useResponsive } from '@src/hooks/useResponsive';
import { WarningOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { tokenSymbols } from '@src/config'

import {
  tokenImage,
} from '@src/config'
import { useMemo } from 'react'
// import Mask from '@src/components/elements/mask'

/**
 * Stake form page
 */
export default function Pools({ Component, pageProps }: AppProps) {
  const {
    chain,
    switchNetwork,
    validChains,
    isWalletInstalled,
  } = useWallet();

  const {
    isDesktopOrLaptop,
  } = useResponsive();

  async function addToken(tokenAddress, symbolName) {
    console.log({ tokenAddress, symbolName })
    await window.ethereum && window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: symbolName, // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
          image: tokenImage,
        }
      }
    });
  }

  const tokenInfo = useMemo(() => {
    return tokenSymbols.find((item) => item.chainId == chain?.chainId) || tokenSymbols[0];
  }, [chain]);

  return (
    <main className={styles['container'] + " container"}>
      {/* <Mask /> */}
      <section className={styles['intro'] + ' main-content'}>
        <h2 className={styles['stake-title']}>
          <Row justify="space-between">
            <Col>
              <span>C2N Staking</span>
            </Col>
            <Col>
              <span style={{ fontSize: '16px', verticalAlign: 'middle' }}>
                <QuestionCircleOutlined style={{ fontSize: '36px', verticalAlign: 'middle', marginRight: '.2em' }}></QuestionCircleOutlined>
                See Tutorial: &nbsp;
                <span
                  className={styles['link']}
                  onClick={() => {
                  }}>{isDesktopOrLaptop ? 'C2N Staking Tutorial' : 'Tutorial'} </span>
              </span>
            </Col>
          </Row>
        </h2>
        <div className={styles['info']}>
          There is NO extra fee for {tokenInfo.symbol} token staking, NO extra fee for unlocking. Members in C2N are attracted by our promising projects, not restricted by us charging a fee. However, IDO projects might require their own different lock-up period, see more details from the
          <Link href="/pools">&nbsp;Projects page</Link>.
          <br />
          <br />
          <Row>
            <Col span={isDesktopOrLaptop ? 16 : 24}>
              Step1: Connect your wallet to stake {tokenInfo.symbol} token, which is required to participate in IDOs.
              <br />
              Step2: Use {tokenInfo.symbol} token to register for IDOs on C2N website, first come first serve.
              <br />
              Step3: Always remember, the longer you hold our BRE tokens, the more projects which have potentials and values you could participate with us!
              <br />
            </Col>
            <Col span={isDesktopOrLaptop ? 8 : 24}>
              <Row justify="center" align="bottom" style={{ height: '100%', marginTop: isDesktopOrLaptop ? 0 : '1em' }}>
                <BasicButton
                  className={styles['wallet-button']}
                  onClick={() => { addToken(tokenInfo.address, tokenInfo.symbol) }}
                >
                  Add {tokenInfo.symbol} to Wallet
                </BasicButton>
              </Row>
            </Col>
          </Row>
        </div>
      </section>
      <section className={styles['staking']}>
        <div className="main-content">
          {
            !isWalletInstalled
              ? <div style={{ paddingTop: '3em' }}>
                <Row justify="center" align="middle">
                  <WarningOutlined
                    style={{ fontSize: '60px', color: 'red' }}
                  />
                </Row>
                <Row justify="center" align="middle">
                  <Col className={styles['title']}>
                    <h2>Please install metamask</h2>
                  </Col>
                </Row>
              </div>
              : false && chain === undefined
                ? <></>
                : true || !!chain
                  ? <StakingForm
                    available={true}
                    poolId={0}
                  ></StakingForm>
                  : <div style={{ padding: '2em 0', backgroundColor: '#ffffff' }}>
                    <Row justify="center" align="middle">
                      <WarningOutlined
                        style={{ fontSize: '60px', color: 'red' }}
                      />
                    </Row>
                    <Row justify="center" align="middle">
                      <Col className={styles['title']}>
                        <h2>Wrong Network</h2>
                      </Col>
                    </Row>
                    <Row justify="center" align="middle">
                      <Col>
                        You are not currently connected to <b>{validChains && validChains[0].name}</b>.
                        Please switch networks to use this application.
                      </Col>
                    </Row>
                    <Row justify="center" style={{ marginTop: '1em' }}>
                      <Col span={8}>
                        <BasicButton className={styles['connect-button']}
                          style={{ width: '100%' }}
                          onClick={switchNetwork}>
                          <span>Switch Network</span>
                        </BasicButton>
                      </Col>
                    </Row>
                  </div>
          }
        </div>
      </section>
    </main>
  )
}