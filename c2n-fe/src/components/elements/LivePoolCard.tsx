import React, { useCallback, useMemo, useState, useEffect } from "react";
import { ProjectData } from "@src/types/ProjectData";
import { formatDate } from "@src/util/index"
import { Row, Col, Popover, Statistic } from 'antd';
import styleNames from './LivePoolCard.module.scss';
import AppPopover from '@src/components/elements/AppPopover'
import { formatEther, seperateNumWithComma, formatNumber } from "@src/util/index";
import { useThirdParty } from '@src/hooks/useThirdParty';
import {
  BigNumber
} from 'ethers'
import { useResponsive } from "@src/hooks/useResponsive";

const { Countdown } = Statistic;
/**
 * Basic Button
 */

interface LivePoolCardProds {
  info: ProjectData,
  className?: any;
  styleNames?: any;
  onClick?: any;
};

const judgeClassName = (className, value) => {
  return value !== undefined ? className : ( className + " loading-element" );
};

export default function LivePoolCard(props: LivePoolCardProds) {
  const info = props.info || ({} as ProjectData);
  const styles = props.styleNames && Object.assign(styleNames, props.styleNames) || styleNames;

  const {
    ethToUsd,
  } = useThirdParty();

  const {
    isDesktopOrLaptop
  } = useResponsive()

  const [status, setStatus] = useState<number>(-1)

  useEffect(()=> {
    info && setStatus(info.status);
  }, [info]);

  const basicElement = useCallback((key, className, mapper?) => {
    const _className = (className || key || '').replace(/([A-Z])/g,'-$1').toLowerCase();
    const value = mapper && mapper(info[key]) || info[key];
    return (
      <div
        className={judgeClassName(
          styles[_className],
          value
        )}
      >
        {value || '\u00a0'}
      </div>
    );
  }, [info]);

  const progress = useMemo(()=>{
    let p = formatEther(info.totalTokensSold) * 125 / formatEther(info.amountOfTokensToSell||1);
    p = p > 100 ? 100 : p < 0 ? 0 : p;
    p = parseFloat(p.toFixed(2));
    return p;
  }, [info]);


  const tokenPriceInUsd:number = useMemo(()=>{
    // FIXME: get paymentTokenDecimals from backend
    const paymentTokenDecimas = 6;
    return props?.info?.tokenPriceInPT ? Number(props.info.tokenPriceInPT)/Math.pow(10, paymentTokenDecimas) : 0;
  }, [props])

  const timer = useMemo(() =>{
    return (<div className={styles['timer']}>
      <span style={{marginRight:'4px'}}>
        {[
          'Register starts in:',
          'Register ends in:',
          'Sale starts in:',
          'Sale ends in:',
          'Token unlocks in:',
          'Sale ended',
        ][status] || 'To start'}
      </span>
      {
        status > -1 && status < 5
        ? 
        <Countdown 
          className={styles['counter']}
          valueStyle={{fontSize:'16px',color:'#D7FF1E'}}
          key={status}
          value={
            [
              info.registrationTimeStarts,
              info.registrationTimeEnds,
              info.saleStart,
              info.saleEnd,
              info.unlockTime,
            ][info.status]
          } 
          format="HH:mm:ss" 
          onFinish={()=>{setStatus(status+1);}} />
          : ''
      }
    </div>)
  }, [info, status])

  
  const trickers = useMemo(()=>{
    let ret;
    try{
      ret = JSON.parse(info?.tricker)
    } catch(e) {
      // do nothing
    }
    return ret;
  }, [info])

  if(info.status == -1) {
    return (
      <div 
      className={`${styles['live-pool-card']} ${(props.className || '')} ${styles['not-start']}`} 
      onClick={props.onClick}
      style={trickers?.cardBackground ? {
        backgroundImage: `url(${trickers.cardBackground})`,
      }: {}}
      >
        {isDesktopOrLaptop ? timer : <></>}
        <Row justify="start" align={isDesktopOrLaptop ? "middle" : "top"} gutter={16} style={{marginTop:'30px'}}>
          <Col span={isDesktopOrLaptop ? 6 : 8} style={{textAlign:'center'}}>
            {/* icon */}
            <i
              className={judgeClassName(styles['icon-logo'], info.img)}
              style={info.img ? { backgroundImage: `url(${info.img})` } : {}}
            >
            </i>
          </Col>
          <Col span={isDesktopOrLaptop ? 18 : 16}>
            {/* product name / title */}
            {basicElement('name', 'productName')}
            {basicElement('description', 'describe')}
            {isDesktopOrLaptop ? <></> : timer}
          </Col>
        </Row>
        <Row 
        justify="start" 
        align="middle" 
        style={{marginTop:'20px'}}
        className={styles['total-raise-wrapper']}>
          <div className={styles['total-raise-label']}>Total raised</div>
          <AppPopover content={<>{seperateNumWithComma(info&&(info.totalRaised/1).toFixed(2))}</>}>
            {basicElement('totalRaised', 'totalRaise', v=>`$ --`)}
          </AppPopover>
        </Row>
        <Row 
        justify={'center'}
        style={{marginTop:'20px'}}
        className={styles['bottom-info']} 
        >
          <div className={styles['coming-soon']}>
            ~ Coming Soon ~
          </div>
        </Row>
        <Row>
          <Col span={24} offset={0}>
            <div className={styles['card-progress']}>
              <div className={styles['progress-background']}></div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div 
     className={styles['live-pool-card']+' '+(props.className || '')} 
     onClick={props.onClick}
    >
      {isDesktopOrLaptop ? timer : <></>}
      <Row justify="start" align={isDesktopOrLaptop ? "middle" : "top"} gutter={16} style={{marginTop:'30px'}}>
        <Col span={isDesktopOrLaptop ? 6 : 8} style={{textAlign:'center'}}>
          {/* icon */}
          <i
            className={judgeClassName(styles['icon-logo'], info.img)}
            style={info.img ? { backgroundImage: `url(${info.img})` } : {}}
          >
          </i>
        </Col>
        <Col span={isDesktopOrLaptop ? 18 : 16}>
          {/* product name / title */}
          {basicElement('name', 'productName')}
          {basicElement('description', 'describe')}
          {isDesktopOrLaptop ? <></> : timer}
        </Col>
      </Row>
      <Row 
       justify="start" 
       align="middle" 
       style={{marginTop:'20px'}}
       className={styles['total-raise-wrapper']}>
        <div className={styles['total-raise-label']}>
          Total raised
        </div>
        <AppPopover content={<>{seperateNumWithComma(info&&(info.totalRaised/1).toFixed(2))}</>}>
          <div className={styles['total-raise']}>
            {
              status>2
              ? <>$ {info?.totalRaised&&formatNumber((info?.totalRaised/1).toFixed(2))||'0.00'}</>
              : <span style={{fontSize: '.8em'}}>Starts on {formatDate(info.registrationTimeEnds, 'Month DD, YYYY')}</span>
            }
          </div>
        </AppPopover>
      </Row>
      <Row 
       justify={'space-between'}
       style={{marginTop:'20px'}}
       className={styles['bottom-info']} 
       >
        {/* 1 */}
        <Col span={8} className={styles['bottom-info-item']}>
          <div className={styles['row']}>
            <i className="bottom-icon icon icon-project-card-1"></i>
            <label className={styles['label']}>Followers</label>
          </div>
          <div className={[styles['row'], styles['value']].join(' ')}>
            {basicElement('follower', 'followers', v=>v||'0')}
          </div>
        </Col>
        {/* 2 */}
        <Col span={8} className={styles['bottom-info-item']}>
          <div className={styles['row']}>
            <i className="bottom-icon icon icon-project-card-2"></i>
            <label className={styles['label']}>Start Date</label>
          </div>
          <div className={[styles['row'], styles['value']].join(' ')}>
            {basicElement('createTime', 'startDate', v=>formatDate(v, 'YYYY-MM-DD'))}
          </div>
        </Col>
        {/* 3 */}
        <Col span={8} className={styles['bottom-info-item']}>
          <div className={styles['row']}>
            <i className="bottom-icon icon icon-project-card-3"></i>
            <label className={styles['label']}>Token Price</label>
          </div>
          <div className={[styles['row'], styles['value']].join(' ')}>
            {/* <AppPopover content={tokenPriceInUsd}> */}
              <div
                className={styles['token-price']}
              >
                $ {tokenPriceInUsd && tokenPriceInUsd.toFixed(4)}
              </div>
            {/* </AppPopover> */}
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24} offset={0}>
        <AppPopover content={`Sale: ${progress||'00.00'}%`}>
          <div className={styles['card-progress']}>
            <div className={styles['progress-background']}></div>
            <div className={styles['progress-colored']} style={{width: progress+'%'}}></div>
            {/* <div className={styles['progress-text']} style={{color: progress>0.6?'#ffffff':'#000000'}}>
              Sale: {progress||'-'}%
            </div> */}
          </div>
        </AppPopover>
        </Col>
      </Row>
    </div>
  );
}
