import { useEffect, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import type { AppProps } from 'next/app'

import store from '@src/redux/store'
import axios from '@src/api/axios'

import PoolCard from '@src/components/elements/PoolCard'
import LivePools from '@src/containers/LivePools/LivePools'
import FinishedPools from '@src/containers/FinishedPools/FinishedPools'
import styles from './pools.module.scss'
import WalletButton from '@src/components/elements/WalletButton'

import { useThirdParty } from '@src/hooks/useThirdParty';
import { usePageLoading } from '@src/hooks/usePageLoading';
import { useResponsive } from '@src/hooks/useResponsive';
import { useMessage } from '@src/hooks/useMessage';

import { Row, Col } from 'antd'
// import Mask from '@src/components/elements/mask'

export default function Pools({ Component, pageProps }: AppProps) {
  const {
  } = useThirdParty();

  const {
    PageLoader,
    setPageLoading,
  } = usePageLoading();

  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  const {
    setErrorMessage
  } = useMessage();

  const [data, setData] = useState<Array<any>>([]);
  const livePoolsData = useMemo(() => {
    return data.filter(v => {
      return [-1, 0, 1, 2, 3, 4].includes(v.status);
    })
  }, [data])
  const finishedPoolsData = useMemo(() => {
    let d = data.filter(v => {
      return [5].includes(v.status);
    }).sort((a, b) => { return a.saleEnd > b.saleEnd ? -1 : 0 });
    return d;
  }, [data])

  useEffect(() => {
    setPageLoading(true);

    axios.get('/boba/product/list')
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        setErrorMessage('Network error, please check your network and refresh.')
        console.error(error);
      })
      .finally(() => {
        setPageLoading(false);
      })

    return (() => {

    })
  }, []);

  useEffect(() => {
  }, [data])

  return (
    <main className={["container", styles['pools']].join(' ')} >
      <PageLoader>
        {/* <Mask /> */}
        <section className={styles['sec-1']}>
          <LivePools className={[styles['live-pools'], "main-content"].join(' ')} data={livePoolsData}>
          </LivePools>
        </section>
        <section className={styles['sec-2']}>
          {
            finishedPoolsData && finishedPoolsData.length > 0 ?
              <FinishedPools className="main-content" data={finishedPoolsData}></FinishedPools>
              : <></>
          }
        </section>
      </PageLoader>
    </main>
  )
}