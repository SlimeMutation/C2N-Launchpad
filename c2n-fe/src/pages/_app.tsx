import { Providers } from '@src/Providers'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
import { useRef, useState, useEffect } from 'react'
import 'antd/dist/antd.css';
import '@src/styles/global.scss'

import { listenToWallet } from '@src/hooks/useWallet'
import { useResponsiveInit } from '@src/hooks/useResponsive'

import { Layout } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import AppHeader from "@src/containers/Header/Header";
import AppFooter from "@src/containers/Footer/Footer";
import WalletModal from '@src/containers/WalletModal/WalletModal'

declare global {
  interface Window {
    TWidgetLogin: any;
    message: any;
    ethereum: any;
    Telegram: any;
    addRegisterAmount: any;
    MSStream: any;
    BinanceChain: any;
  }
}

function LoadingModal() {

}

function Wrapper({ Component, pageProps }) {
  const { Content } = Layout;
  const [routeLoading, setRouteLoading] = useState<boolean>(false);

  const view = useRef(null);

  Router.events.on('routeChangeStart', () => {
    setRouteLoading(true);
  })
  Router.events.on('routeChangeComplete', () => {
    view.current && (view.current.scrollTop = 0);
    setRouteLoading(false);
  })
  listenToWallet();
  useResponsiveInit();

  return (
    <div className="main-wrapper">
      {
        routeLoading ? (
          <div className="route-loading">
            <div className="modal">
              <LoadingOutlined />
            </div>
          </div>
        ) : <></>
      }
      <AppHeader />
      <div className="main-body" ref={view}>
        <Content>
          <Component {...pageProps} />
          <AppFooter />
        </Content>
      </div>
      <style>{`
        .route-loading {
          position: fixed;
          width: 100vw;
          height: 100vh;
          background-color: #00000077;
          z-index: 99999;
        }
        .route-loading .modal {
          width: 120px;
          height: 120px;
          border-radius: 18px;
          position: fixed;
          top: 50%;
          left: 50%;
          background-color: #000000e0;
          transform: translate(-50%, -50%);
          line-height: 120px;
          text-align: center;
          font-size: 0.72rem;
          color: #ffffff;
        }
        
      `}</style>
    </div>
  )
}
export default function MyApp({ Component, pageProps }: AppProps) {
  // comsume referralcode
  useEffect(() => {
    let search, params, aff;
    if (typeof window !== 'undefined') {
      search = window.location.search;
      params = new URLSearchParams(search);
      aff = params.get('aff');
      if (aff) {
        window.localStorage.setItem('referral', aff);
      }
    }

  }, []);

  return (
    <Providers>
      <Head>
        <title>C2N</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
        <meta name="description" content="C2N is the first exclusive launchpad for decentralized fundraising in Boba ecosystem, offering the hottest and innovative projects in a fair, secure, and efficient way." />
        {/* <meta name="keywords" content="BobaBrewery C2N"/> */}
        <style>
          {`
            :root {
              --header-height: 110px;
            }

            @media (max-width: 769px) {
              :root {
                --header-height: 65px;
              }
            }
          `}
        </style>
      </Head>
      <WalletModal></WalletModal>
      <Wrapper pageProps={pageProps} Component={Component} />
    </Providers>
  )
}