import { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Input, message, Form, Row, Col, InputNumber, Spin } from 'antd';
import axios from '@src/api/axios'
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import BasicButton from '@src/components/elements/Button.Basic';
import { useWallet } from '@src/hooks/useWallet';
import { formatDate, hexToBytes, parseEther, formatEther } from "@src/util/index"
import { BigNumber } from '@ethersproject/bignumber';

import styles from './ParticipateModal.module.scss'
import AppPopover from '@src/components/elements/AppPopover';
import TransactionButton from "@src/components/elements/TransactionButton";
import FormItemLabel from 'antd/es/form/FormItemLabel';
import { formatUnits } from 'ethers/lib/utils';

const NUMBER_1E5 = 100000;

export default function ParticipateModal(props) {
  const {
    loading,
  } = useWallet();
  const data = props.data || {};
  const [eth, setEth] = useState<any>();
  const [bre, setBre] = useState<any>(10);
  const [max, setMax] = useState<any>(10);

  const tokenPriceInPT = formatEther(props.tokenPriceInPT, 18);

  const allocationTop = useMemo(() => {
    return data.allocationTop;
  }, [data])

  const decimals = useMemo(() => {
    return data.paymentTokenDecimal;
  }, [data])

  useEffect(() => {
    if (allocationTop) {
      const bre = 10;
      setBre(bre);
      setMax(bre);
      setEth(calEth(bre));
    }
  }, [allocationTop, decimals, calEth]);

  function handleInputChange(value) {
    let bre = value;
    setBre(bre);
    setEth(calEth(bre));
  }

  function calEth(breValue) {
    let eth;
    try {
      eth = Number(tokenPriceInPT) * Number(breValue)
      // eth = formatEther(BigNumber.from((NUMBER_1E5 * breValue)).mul(Math.pow(10, 18 - decimals)).mul(data.tokenPriceInPT || 1).div(NUMBER_1E5), 8);
    } catch (e) {
      eth = 0;
    }
    return eth?.toFixed(6) || '';
  }

  function handleOk() {
    props.handleOk({ value: bre });
  }

  return (
    <Modal
      title={null}
      width={732}
      visible={props.visible}
      onOk={handleOk}
      onCancel={props.handleCancel}
      okText={'Purchase'}
      footer={null}
      className={styles['modal']}
    >
      <h2 className={styles['title']}>
        Purchase
      </h2>
      <Row>
        <p className={styles['desc']}>
          Buy your {data.tokenName} ({data.symbol}) tokens with no extra fee, you can purchase with a maximum of {'\u00a0'}
          <AppPopover content={max}><span className={styles['maximum']}>{max && max.toFixed(4)}</span> {data.symbol || ''}</AppPopover>. {'\u00a0'}
          Make sure to confirm the transaction in your wallet and wait for it to confirm on-chain.
        </p>
      </Row>
      <Row className={[styles['input']].join(' ')}>
        <Col span={2}>
          From:
        </Col>
        <Col span={20} offset={2} className={styles['from-input']}>
          <div className={styles['number']}>
            {eth}
          </div>
          <div className={styles['unit']}>
            {/* {data.paymentTokenSymbol || 'PL'} */}
            ETH
          </div>
        </Col>
      </Row>


      <Row className={styles['input']}>
        <Col span={2}>
          To:
        </Col>
        <Col span={20} offset={2}>
          <AppPopover content={<>Max Amount: {max && max.toFixed(2)} {data.symbol || ''}</>}>
            <InputNumber
              className={styles['number']}
              defaultValue={bre}
              min={'1'}
              max={Math.floor(max) || 1}
              step="1"
              stringMode
              controls={false}
              onChange={handleInputChange}
              // disabled={true}
            />
            <div className={styles['unit']}>
              {data.symbol || ''}
            </div>
          </AppPopover>
        </Col>
      </Row>

      {/* <Row>
        Max Amount: {max.toFixed(2)} {data.symbol || ''}
      </Row>
      <Row>
        Current Price: {tokenPriceInPT} ETH / {data.symbol || ''}
      </Row> */}

      <Row justify="end" style={{ marginTop: '35px' }}>
        <BasicButton
          style={{
            width: '212px',
            height: '54px',
            backgroundColor: '#DEDEDE',
            backgroundImage: 'none',
            marginRight: '20px',
            color: '#505050',
            fontSize: '20px',
          }}
          onClick={props.handleCancel}>
          Cancel
        </BasicButton>
        <BasicButton
          style={{
            width: '212px',
            height: '54px',
            fontSize: '20px',
            backgroundImage: 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)'
          }}
          loading={loading}
          onClick={handleOk}>
          Purchase
        </BasicButton>
      </Row>
    </Modal>
  )
}