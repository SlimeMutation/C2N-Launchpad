import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col, Space } from 'antd';

import { useWallet } from "@src/hooks/useWallet";
import BasicButton from '@src/components/elements/Button.Basic'
import { disconnect } from 'process';

import styles from './WalletModal.module.scss'
import { IconAccount, IconNetwork } from '@src/components/icons';
import Image from 'next/image'
import connectors, { ConnectorNames, walletLocalStorageKey, connectorLocalStorageKey} from '@src/types/Connector'
import useAuth from '@src/hooks/useAuth';

export default function WalletModal() {
  const {
    showWallet,
    walletShowed,
    switchNetwork,
    chain,
    validChains,
    connect,
    disconnect,
  } = useWallet()

  const {
    account,
    login,
    logout,
  } = useAuth()

  const status = getStatus();

  function getStatus() {
    if(!account) {
      // no connect
      return 0;
    }
    if(account && chain) {
      // connected
      return 1;
    }
    if(account && !chain) {
      // connect but wrong network
      return 2;
    }
  }

  const onCancel = () => {
    showWallet(false);
  }

  const wrongNetworkPanel = (<>
    <Row justify="center" align="middle">
      <div className={styles['title']}>
        Wrong Network
      </div>
    </Row>
    <Row justify="space-between" align="middle">
      <p>
        You are not currently connected to <b>{validChains && validChains[0].name}</b>.
        Please switch networks to use this application.
      </p>
    </Row>
    <Row justify="center">
      <BasicButton className={styles['connect-button']} 
        style={{width: '100%'}}
        onClick={switchNetwork}>
          <span>Switch Network</span>
      </BasicButton>
    </Row>
    </>
  )

  let walletTitle = '';

  if(typeof window !== 'undefined') {
    walletTitle = window.localStorage.getItem(walletLocalStorageKey);
  }

  const accountPanel = (
    <div style={{ width: '100%' }}>
      <Row justify="center">
        <div className={styles['title']}>
          Connected With {walletTitle}
        </div>
      </Row>
      <Row>
        <Col span={2}>
          <IconAccount></IconAccount>
        </Col>
        <Col span={12} style={{color: '#505050'}}>
          Current Account: 
        </Col>
      </Row>
      <Row>
        <Col span={20} offset={2} style={{fontSize:'14px', color: '#000000'}}>
          <p>{account}</p>
        </Col>
      </Row>
      <Row>
        <Col span={2}>
          <IconNetwork></IconNetwork>
        </Col>
        <Col span={12} style={{color: '#505050'}}>
          Current Network: 
        </Col>
      </Row>
      <Row>
        <Col span={20} offset={2} style={{fontSize:'14px', color: '#000000'}}>
          <p>{chain&&chain.name}</p>
        </Col>
      </Row>
      <Row justify="center">
        <BasicButton className={styles['connect-button']} 
          style={{width: '100%'}}
          onClick={logout}
          >
            <span>Disconnect</span>
        </BasicButton>
      </Row>
    </div>
  )

  const connectPanel = (
    <div>
      <Row justify="start">
        <div className={styles['title']}>
          Connect wallet
        </div>
      </Row>
      <Row className={styles['connect-panel']} justify="center" gutter={[16, 24]}>
        {
        connectors.map((connector, index) => {
          return (
              <Col className={styles['connect-button']} span={24} key={index}
                onClick={() => {
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

                  // Since iOS does not support Trust Wallet we fall back to WalletConnect
                  if (connector.title === "Trust Wallet" && isIOS) {
                    login(ConnectorNames.WalletConnect);
                  } else {
                    login(connector.connectorId);
                  }

                  localStorage.setItem(walletLocalStorageKey, connector.title);
                  localStorage.setItem(connectorLocalStorageKey, connector.connectorId);
                  showWallet(false);
                }}>
                  <connector.icon className={
                    [styles['icon']].join(' ')
                  }></connector.icon>
                  <span style={{
                    fontSize: '18px',
                    color: '#000000',
                    marginLeft: '12px'
                  }}>{connector.title}</span>
              </Col>
          )
        })
      }
      </Row>
    </div>
  )

  return (
    <>
      <Modal 
        title={null}
        visible={walletShowed}
        onCancel={onCancel}
        footer={null}
        >
          {
            account
              ? (chain ? accountPanel : wrongNetworkPanel)
              : connectPanel
          }
      </Modal>
    </>
  )
}