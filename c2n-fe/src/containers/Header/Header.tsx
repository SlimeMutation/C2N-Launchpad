import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { Layout, Row, Col, Menu, Dropdown } from 'antd';
import { MenuOutlined } from '@ant-design/icons'

import { useResponsive } from '@src/hooks/useResponsive';

import WalletButton from '@src/components/elements/WalletButton';
import NetworkButton from '@src/components/elements/NetworkButton';

import styles from './Header.module.scss'

import { IconAppLogo } from '@src/components/icons'

export default function Header() {
  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  const [showSider, setShowSider] = useState(false);

  const { Header } = Layout;
  const router = useRouter();

  let activeTabIndex = useMemo(() => {
    return [
      '/',
      '/stake',
      '/farming',
      '/pools',
      '/project',
      '/bridge',
    ].indexOf(router.pathname)
  }, [router])

  const menu = (
    <Menu style={{ background: '#000000', border: '2px solid #FFB85280' }}>
      <div className={[styles['menu-item']].join(' ')}>
        <Link href="/">
          <div className={[styles.button, activeTabIndex == 0 ? styles['active'] : ''].join(' ')}>Home</div>
        </Link>
      </div>
      <div className={[styles['menu-item']].join(' ')}>
        <Link href="/farming">
          <div className={[styles.button, activeTabIndex == 2 ? styles['active'] : ''].join(' ')}>Farm</div>
        </Link>
      </div>
      <div className={[styles['menu-item']].join(' ')}>
        <Link href="/pools">
          <div className={[styles.button, activeTabIndex == 3 || activeTabIndex == 4 ? styles['active'] : ''].join(' ')}>Projects</div>
        </Link>
      </div>
      <div className={[styles['menu-item']].join(' ')}>
        <Link href="/stake">
          <div className={[styles.button, activeTabIndex == 1 ? styles['active'] : ''].join(' ')}>Staking</div>
        </Link>
      </div>
      <div className={[styles['menu-item']].join(' ')}>
        <WalletButton
          className={styles['wallet-button-mobile']}
          style={{ background: 'none', 'boxShadow': 'none' }}
        ></WalletButton>
      </div>
    </Menu>
  )

  return <Header className={styles.header}>
    <Row className="main-content">
      <Col span={6}>
        {/* logo */}
        <Link href="/">
          <div className={styles['logo']} style={{ cursor: 'pointer' }}>
            <h1 className={"Boba title app-name " + styles.title}>
              {/* <i className={['icon', styles['logo-icon']].join(' ')}></i> */}
              <span className={styles.logo}></span>
              {/* <IconAppLogo className={['icon', styles['logo-icon']].join(' ')} /> */}
              {/* <span className={styles['app-name']}>C2N</span> */}
            </h1>
          </div>
        </Link>
      </Col>
      <Col span={isDesktopOrLaptop ? 18 : 4} offset={isDesktopOrLaptop ? 0 : 14}>
        {
          isDesktopOrLaptop
            ? (
              <Row className={styles.menu} key="desktop" justify="space-between" align="middle">
                <Link href="/">
                  <div className={[styles.button, activeTabIndex == 0 ? styles['active'] : ''].join(' ')}>Home</div>
                </Link>
                <Link href="/farming">
                  <div className={[styles.button, activeTabIndex == 2 ? styles['active'] : ''].join(' ')}>Farm</div>
                </Link>
                <Link href="/pools">
                  <div className={[styles.button, activeTabIndex == 3 || activeTabIndex == 4 ? styles['active'] : ''].join(' ')}>Projects</div>
                </Link>
                <Link href="/stake">
                  <div className={[styles.button, activeTabIndex == 1 ? styles['active'] : ''].join(' ')}>Staking</div>
                </Link>
                <WalletButton></WalletButton>
                <NetworkButton></NetworkButton>
              </Row>
            ) : ['/safepal'].includes(router.pathname)
              ? <>
                <WalletButton
                  className={styles['wallet-button-safepal']}
                ></WalletButton>
              </>
              : <>
                <Row justify="end" align="middle" style={{ width: '100%', height: '100%' }}>
                  <MenuOutlined style={{ fontSize: '0.36rem' }} onClick={() => setShowSider(!showSider)}>
                  </MenuOutlined>
                </Row>
                <Layout.Sider
                  collapsed={!showSider}
                  collapsedWidth={0}
                  theme="light"
                  onClick={() => setShowSider(!showSider)}
                  style={{ 'position': 'fixed', 'right': '0', 'textIndent': '1em', 'zIndex': '100' }}>
                  {menu}
                </Layout.Sider>
                <div className={styles['sider-background']} onClick={() => setShowSider(!showSider)} style={{ display: showSider ? 'block' : 'none' }}>
                  &nbsp;
                </div>
              </>
        }
      </Col>
    </Row>
  </Header>
}