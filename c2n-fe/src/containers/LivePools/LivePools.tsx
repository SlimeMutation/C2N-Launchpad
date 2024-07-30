import LivePoolCard from '../../components/elements/LivePoolCard'
import styles from './LivePools.module.scss'
import Router from 'next/router'
import { Motion, spring } from 'react-motion';
import { Row, Col } from 'antd'

import { ProjectData } from '@src/types/ProjectData';

import { IconPoolsEmpty } from '@src/components/icons'

import { useResponsive } from '@src/hooks/useResponsive';

type LivePoolsProds = {
  className?: string;
  children?: any;
  data?: Array<ProjectData>;
}

export default function LivePools(props: LivePoolsProds) {
  const poolData = props.data || [];

  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  const onCardClick = (info) => {
    // if (info?.status == -1) {
    //   return;
    // }
    // if (info?.type == 1) {
    //   info.cardLink && window.open(info.cardLink);
    //   return;
    // }
    if (info?.type == 0) {
      Router.push({ pathname: '/project', query: { id: info.id } });
      return;
    }
  }

  return (
    <div
      className={styles['live-pools'] + ' ' + (props.className || '')}
    >
      {props.children}
      <h2 className={styles.title}>Live Pools</h2>
      {
        poolData && poolData.length > 0
          ? <>
            <div className={styles['sub-title']}></div>
            <Row className={styles['live-pool-list']} gutter={isDesktopOrLaptop ? 16 : [0, 16]}>
              {
                poolData.map((info, index) => {
                  return (
                    <Col span={isDesktopOrLaptop ? 12 : 24} style={{ width: '100%' }} key={index}>
                      <LivePoolCard
                        onClick={() => onCardClick(info)}
                        info={info}
                        className={styles['card']}
                      ></LivePoolCard>
                    </Col>
                  )
                })
              }
            </Row>
          </>
          : <>
            <Row justify="center">
              <IconPoolsEmpty style={{ marginTop: '30px' }} />
            </Row>
            <Row justify="center">
              <div className={styles['empty-text']}>
                There are no more projects at the moment
              </div>
            </Row>
          </>
      }
    </div>
  )
}