import type { AppProps } from 'next/app'
import { Row, Col } from 'antd'

import styles from './farming.module.scss'
import FarmingForm from '@src/containers/FarmingForm/FarmingForm'
import { useResponsive } from '@src/hooks/useResponsive';
import farmConfigs from '@src/config/farms'
import { QuestionCircleOutlined } from '@ant-design/icons';

import {
  EARNED_TOKEN_ADDRESS,
} from '@src/config'

/**
 * Stake form page
 */
export default function Pools({ Component, pageProps }: AppProps) {
  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  return (
    <main className={styles['container'] + " container"}>
      <section className={styles['intro'] + ' main-content'}>
        <h2 className={styles['stake-title']}>
          <Row justify="space-between">
            <Col>
              <span>Yield Farms</span>
            </Col>
            <Col>
              <span style={{ fontSize: '16px', verticalAlign: 'middle' }}>
                <QuestionCircleOutlined style={{ fontSize: '36px', verticalAlign: 'middle', marginRight: '.2em' }}></QuestionCircleOutlined>
                See Tutorial: &nbsp;
                <span
                  className={styles['link']}
                  onClick={() => {
                  }}>{isDesktopOrLaptop ? 'C2N Farm Tutorial' : 'Tutorial'} </span>
              </span>
            </Col>
          </Row>
        </h2>
        <h3 className={styles['stake-subtitle']}>
          Yield Farms allow users to earn Reward token while supporting C2N by staking LP Tokens.
        </h3>
      </section>
      <section className={styles['staking']}>
        <div className="main-content">
          <Row gutter={32}>
            {
              farmConfigs.map((item, index) => {
                return (
                  <Col span={isDesktopOrLaptop ? 8 : 24}
                    key={index}
                  >
                    <FarmingForm
                      chainId={item.chainId}
                      depositTokenAddress={item.depositTokenAddress}
                      earnedTokenAddress={item.earnedTokenAddress}
                      stakingAddress={item.stakingAddress}
                      poolId={item.poolId}
                      available={item.available}
                      depositSymbol={item.depositSymbol}
                      earnedSymbol={item.earnedSymbol}
                      title={item.title}
                      depositLogo={item.depositLogo}
                      earnedLogo={item.earnedLogo}
                      getLptHref={item.getLptHref}
                      aprRate={item.aprRate}
                      aprUrl={item.aprUrl}
                    />
                  </Col>
                )
              })
            }
          </Row>
        </div>
      </section>
    </main>
  )
}
