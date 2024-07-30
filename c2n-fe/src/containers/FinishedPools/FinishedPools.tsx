import Router from 'next/router'

import { Row, Col, Table } from 'antd';

import styles from "./FinishedPools.module.scss";
import { ProjectData } from '@src/types/ProjectData'
import { formatNumber } from "@src/util/index";
import { useThirdParty } from '@src/hooks/useThirdParty';
import { useResponsive } from '@src/hooks/useResponsive';

import {
  BigNumber
} from 'ethers'

type LivePoolsProds = {
  className?: string;
  data: Array<ProjectData>;
};

const calTokenPriceInUsd = function(tokenPriceInPT, ethToUsd) {
  // FIXME: get paymentTokenDecimals from backend
  const paymentTokenDecimas = 6;
  return tokenPriceInPT ? Number(tokenPriceInPT)/Math.pow(10, paymentTokenDecimas) : 0;
}

export default function LivePools(props: LivePoolsProds) {
  const dataSource = props.data;
  const {
    ethToUsd,
  } = useThirdParty();
  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();
  return (
    <div
      className={
        styles["live-pools"] + " " + (props.className || "")
      }
    >
      <h2 className={styles.title}>Finished Pools</h2>
      {
        isDesktopOrLaptop
        ? (
          <Row 
           className={styles["finish-pool-item"]+' '+styles["header"]}
           justify="space-between"
           >
            <Col span={8} className={styles["col1"]}>Project</Col>
            <Col span={4} className={styles["col2"]}>IDO Token Price</Col>
            <Col span={4} className={styles["col3"]}>Current Price</Col>
            <Col span={4} className={styles["col4"]}>No. Followers</Col>
            {/* <Col span={4} className={styles["col5"]}>ROI(ATH)</Col> */}
          </Row>
        )
        : <></>
      }
      {
        dataSource.map((poolInfo,index)=>{
         return (
          <Row 
           className={styles["finish-pool-item"]} 
           justify="space-between"
           align="middle" 
           onClick={()=>{Router.push({pathname:'/project', query:{id: poolInfo.id}})}}
           key={index}
          >
            <Col span={isDesktopOrLaptop ? 8 : 24} className={styles["col1"]}>
              <Row align="middle" gutter={16}>
                <Col span={8}>
                  <i
                    className={
                      poolInfo.img
                        ? styles["icon"]
                        : styles["icon"] + " loading-element"
                    }
                    style={poolInfo.img ? { backgroundImage: `url(${poolInfo.img})` } : {}}
                  />
                </Col>
                <Col span={16}>
                  <div className={styles['product-name']}>{poolInfo.name}</div>
                  <div className={styles['describe']}>{poolInfo.description}</div>
                </Col>
              </Row>
            </Col>
            <Col span={isDesktopOrLaptop ? 4 : 12} className={styles["col2"]}>
              {
                isTabletOrMobile
                ? <><div>IDO Token Price</div></>
                : <></>
              }
              ${calTokenPriceInUsd(poolInfo.tokenPriceInPT,ethToUsd).toFixed(4) || '0'}
            </Col>
            <Col span={isDesktopOrLaptop ? 4 : 12} className={styles["col3"]}>
              {
                isTabletOrMobile
                ? <><div>Current Price</div></>
                : <></>
              }
              ${(poolInfo?.currentPrice||0).toFixed(4) || '0'}
            </Col>
            <Col span={isDesktopOrLaptop ? 4 : 12} className={styles["col4"]}>
              {
                isTabletOrMobile
                ? <><div>No. Followers</div></>
                : <></>
              }
              {poolInfo.follower || "0"}
            </Col>
            {/* <Col span={isDesktopOrLaptop ? 4 : 12} className={styles["col5"]}>
              {
                isTabletOrMobile
                ? <><div>Total Raised</div></>
                : <></>
              }
              {poolInfo.roi}
            </Col> */}
          </Row>
        )
      })
    }
    </div>
  );
}
