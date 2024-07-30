import { useEffect, useState, useMemo, useRef } from "react";
import { InputNumber, Row, Col, Carousel, Select, Modal, Pagination, Radio, Timeline } from "antd";
const { Option } = Select;

import { Motion, spring } from 'react-motion';
import axios from '@src/api/axios'

import {
  BigNumber,
  Contract,
} from "ethers";
import {
  EARNED_TOKEN_ADDRESS,
  STAKING_POOL_ID,
  tokenAbi,
} from '@src/config'
import bridgeUnitConfig from '@src/config/bridge'
import tokenUnits from '@src/config/token_info'
import TransactionButton from "@src/components/elements/TransactionButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { parseEther, seperateNumWithComma, formatNumber, formatDate, formatUnits } from "@src/util/index";
import { useWallet } from '@src/hooks/useWallet'
import { useStake } from '@src/hooks/useStake'
import { useThirdParty } from '@src/hooks/useThirdParty'
import { usePageLoading } from '@src/hooks/usePageLoading'
import { useMessage } from '@src/hooks/useMessage'
import { useResponsive } from '@src/hooks/useResponsive';

import styles from './BridgeForm.module.scss';
import { useErrorHandler } from "@src/hooks/useErrorHandler";
import { useBridge } from "@src/hooks/useBridge";
import { IconBridge, IconHistory, IconPoolsEmpty, IconSwitch } from '@src/components/icons'
import AppPopover from "@src/components/elements/AppPopover";
import BasicButton from "@src/components/elements/Button.Basic";

import Image from "next/image";
import { ArrowRightOutlined, QuestionCircleFilled } from "@ant-design/icons";

export default function BridgeForm(props: { available: boolean }) {
  const dispatch = useAppDispatch();

  const TokenOptions = bridgeUnitConfig;

  const [historyRecord, setHistoryRecord] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [recordTotal, setRecordTotal] = useState<number>(0);
  const [tokenType, setTokenType] = useState<string>('BRE');
  const pageSize = 20;

  let poolInfoTimer = null;

  const {
    quoteBridgeAmount,
    createBridgeOrder,
    updateOrder,
    getOrderList,
    signer,
    depositTokenContract,
    setDepositTokenAddress,
  } = useBridge();

  const {
    setSuccessMessage,
    setErrorMessage,
  } = useMessage()

  const {
    getErrorMessage,
  } = useErrorHandler();

  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  // TODO: modify pool id
  // 0: bre pool 1: boba pool
  const poolId = STAKING_POOL_ID;

  const {
    walletAddress,
    chain,
  } = useWallet();

  const {
  } = useThirdParty();

  const {
    PageLoader,
    setPageLoading,
  } = usePageLoading()


  useEffect(() => {
    setPageLoading(true);
    getOrder().finally(() => {
      setPageLoading(false);
    })
    setTimeout(() => {
      getOrder().finally(() => {
        setPageLoading(false);
      })
    }, 5000);
    return () => {
      setPageLoading(false);
    }
  }, [walletAddress, pageIndex])

  async function getOrder() {
    if (!walletAddress) {
      return;
    }
    const orderListData = await getOrderList({
      accountId: walletAddress,
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
    let data = orderListData?.data || [];
    setHistoryRecord(data);
    setRecordTotal(orderListData.dataCount);
  }

  function BridgeInputForm({ tokenUnits, style }) {
    const available = props.available;
    const {
      quoteBridgeAmount,
      createBridgeOrder,
      signer,
      depositTokenContract,
      setDepositTokenAddress,
    } = useBridge();

    const [fromNum, setFromNum] = useState<number>();
    const [toNum, setToNum] = useState<number>();
    const [fromUnitValue, setFromUnitValue] = useState<string>(tokenUnits[0].value);
    const [toUnit, setToUnit] = useState<string>(tokenUnits[1].value);
    const [exchangeStatus, setExchangeStatus] = useState(0);
    const [balance, setBalance] = useState(null);
    const [decimals, setDecimals] = useState(18);
    const [waiting, setWaiting] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [quoteData, setQuoteData] = useState(null);
    const [quoteTimer, setQuoteTimer] = useState<any>();

    const fromUnit = useMemo(() => {
      return tokenUnits.find(v => v.value === fromUnitValue);
    }, [fromUnitValue]);

    const requiredChainId = useMemo(() => {
      const tokenInfo = tokenUnits.find(v => v.value === fromUnitValue);
      return tokenInfo?.chainId;
    }, [fromUnitValue])

    useEffect(() => {
      if (fromUnitValue && toUnit && fromNum) {
        clearTimeout(quoteTimer);
        setQuoteTimer(setTimeout(() => {
          updateQuoteAmount();
        }, 300))
      }
    }, [toUnit, fromNum])

    useEffect(() => {
      getBalance();
    }, [depositTokenContract])

    useEffect(() => {
      if (fromUnitValue) {
        const tokenInfo = tokenUnits.find(v => v.value === fromUnitValue);
        setToUnit(tokenInfo.toValue);
        // if(fromUnitValue == toUnit) {
        //   let toUnitIndex = tokenUnits.findIndex(v=>v.value === toUnit);
        //   setToUnit(toUnitIndex+1 >= tokenUnits.length ? tokenUnits[0].value : tokenUnits[toUnitIndex+1].value);
        // }
      }
    }, [fromUnitValue])

    useEffect(() => {
      const tokenInfo = tokenUnits.find(v => v.value === fromUnitValue);
      if (tokenInfo.contractAddress && tokenInfo?.chainId == chain?.chainId) {
        setDepositTokenAddress(tokenInfo.contractAddress);
      } else {
        setDepositTokenAddress('');
      }
    }, [fromUnitValue, chain])

    useEffect(() => {
      const tokenInfo = tokenUnits.find(v => v.chainId == chain?.chainId);
      if (tokenInfo) {
        setFromUnitValue(tokenInfo.value);
      }
    }, [chain])

    useEffect(() => {
      setOrderData(null);
    }, [walletAddress, fromUnitValue, fromNum, chain]);

    function getBalance() {
      if (depositTokenContract) {
        depositTokenContract.balanceOf(walletAddress)
          .then((result: BigNumber) => {
            setBalance(result);
          });

        depositTokenContract.decimals()
          .then((result: number) => {
            setDecimals(result);
          });
      }
    }

    const handleFromUnitChange = function (value) {
      setFromUnitValue(value);
    }

    const handleToUnitChange = function (value) {
      setToUnit(value);
    }


    function updateQuoteAmount() {
      quoteBridgeAmount({ deposit_coin: fromUnitValue, receive_coin: toUnit, quantity: fromNum })
        .then(res => {
          setQuoteData(res?.data || null);
          if (res?.data?.receive_amount) {
            let amount = res.data.receive_amount - res.data.receive_fee;
            amount = amount < 0 ? 0 : amount;
            amount = Number(amount.toFixed(4));
            setToNum(amount);
          }
        })
    }

    const onExchangeButtonClick = () => {
      if (!fromNum) {
        setErrorMessage(`Please input exchange token number`);
        return;
      }
      if (quoteData) {
        const min = Number(quoteData.deposit_min)
        if (fromNum < min) {
          setErrorMessage(`Cannot exchange less than ${min.toFixed(4)} ${fromUnit.label}`);
          return;
        }
        const max = Number(quoteData.deposit_max);
        if (fromNum > max) {
          setErrorMessage(`Cannot exchange more than ${max.toFixed(4)} ${fromUnit.label}`);
          return;
        }
      }

      let client_order;
      setExchangeStatus(2);

      new Promise((resolve, reject) => {
        if (orderData) {
          resolve(orderData);
        } else {
          return createBridgeOrder({
            account_id: walletAddress,
            deposit_coin: fromUnitValue,
            receive_coin: toUnit,
            deposit_amount: fromNum,
            receive_addr: walletAddress,
            receive_memo: '',
            refund_addr: walletAddress,
            refund_memo: '',
            client_order: 'true'
          })
            .then((res) => {
              setOrderData(res.data);
              resolve(res.data)
            })
            .catch((res) => {
              setExchangeStatus(0);
              setErrorMessage('Create order fail.')
            })
        }
      })
        .then(async (data: any) => {
          client_order = data?.order_id;
          if (!data || !client_order) {
            throw new Error('Create order fail.')
          }
          if (data?.sp_receive_addr && data?.order_id) {
            const tokenInfo = tokenUnits.find(v => v.value === fromUnitValue);
            const depositTokenContract = new Contract(tokenInfo.contractAddress, tokenAbi, signer);
            // const decimals = await depositTokenContract.decimals();
            const amount = parseEther(fromNum).div(Math.pow(10, 18 - decimals));
            return new Promise(async (resolve, reject) => {
              setExchangeStatus(3);
              resolve(null);
            }).then(async (transaction) => {
              setExchangeStatus(4);
              if (fromUnitValue === '44:ETH') {
                const tx = {
                  to: data.sp_receive_addr,
                  value: amount,
                  // data: '',
                }
                return signer.sendTransaction(tx)
              } else {
                return depositTokenContract.transfer(data.sp_receive_addr, amount)
              }
            })
              .then(async (transaction) => {
                updateOrder({
                  id: client_order,
                  txid: transaction.hash || transaction.blockHash,
                  receive_addr: walletAddress,
                  client_order: client_order
                })
                setOrderData(null);
                return transaction.wait();
              })
              .then(() => {
                setSuccessMessage('Exchange success. The transaction progress would be completed in a few minutes.');
                setTimeout(() => {
                  getOrder();
                }, 5000);
                getBalance();
                return getOrder();
              })
              .catch(e => {
                setExchangeStatus(0);
                throw (e);
              })
              .finally(() => {
                setExchangeStatus(0);
              })
          }
        })
        .catch((e) => {
          setExchangeStatus(0);
          console.error(e);
          let msg = getErrorMessage(e);
          setErrorMessage('Exchange failed. ' + (msg || ''));
        })
    }

    const debouncedOnExchangeButtonClick = () => {
      if (waiting) {
      } else {
        onExchangeButtonClick();
        setWaiting(true);
        setTimeout(() => setWaiting(false), 2000);
      }
    };

    function onSwitchButtonClick() {
      setFromUnitValue(fromUnit.toValue);
    }

    return (<div style={style}>
      <Row gutter={[16, 16]}>
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="space-between">
            {
              depositTokenContract
                ? <>
                  <div className="balance">Balance: {formatUnits(balance, 4, decimals)?.toFixed(4)} {fromUnit.label}</div>
                </>
                : <>
                  <div className="balance">Balance: -</div>
                </>
            }
          </Row>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="start" wrap={false}>
            <span className={styles['input-label']}>From:</span>
            <div className={styles['input']}>
              <InputNumber
                className={styles['number']}
                value={fromNum}
                max={formatUnits(balance, 4, decimals)}
                step="0.0001"
                onChange={value => setFromNum(value)}
                stringMode
                controls={false}
                bordered={false}
              />
              <div className={styles['unit']}>
                {fromUnit?.label || ''}
              </div>
            </div>
          </Row>
        </Col>
        {
          isDesktopOrLaptop ?
            <></>
            : (
              <Col span={isDesktopOrLaptop ? 2 : 24} style={{ textAlign: 'right' }}>
                <BasicButton
                  className={['button', styles['switch-button']].join(' ')}
                  style={{ width: '69px', verticalAlign: 'top', lineHeight: '60px' }}
                  onClick={() => { onSwitchButtonClick() }}
                >
                  <IconSwitch style={{ transform: 'rotate(90deg)' }}></IconSwitch>
                </BasicButton>
              </Col>
            )
        }
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="start" wrap={false}>
            <span className={styles['input-label']}>To:</span>
            <div className={styles['input']}>
              <InputNumber
                className={styles['number']}
                value={toNum}
                step="0.0001"
                stringMode
                controls={false}
                bordered={false}
                disabled
              />
              <div className={styles['unit']}>
                {fromUnit.toLabel}
              </div>
            </div>
          </Row>
        </Col>
        {
          isDesktopOrLaptop ?
            (
              <Col span={isDesktopOrLaptop ? 2 : 24}>
                <BasicButton
                  className={['button', styles['switch-button']].join(' ')}
                  style={{ width: '69px', verticalAlign: 'top', lineHeight: '60px' }}
                  onClick={() => { onSwitchButtonClick() }}
                >
                  <IconSwitch></IconSwitch>
                </BasicButton>
              </Col>
            ) : <></>
        }
        <Col span={isDesktopOrLaptop ? 6 : 24}>
          {
            available ?
              (
                <TransactionButton
                  className="button"
                  onClick={debouncedOnExchangeButtonClick}
                  noConnectText={'Connect wallet to exchange'}
                  style={{ width: '100%' }}
                  loading={![0, 1].includes(exchangeStatus)}
                  loadingText={exchangeStatus == 2 ? 'Creating order...' : exchangeStatus == 3 ? 'Approving...' : exchangeStatus == 4 ? 'Paying...' : 'Please wait...'}
                  requiredChainId={fromUnit.chainId}
                  switchNetworkText={'Switch Network to Exchange'}
                >
                  Exchange
                </TransactionButton>)
              : (
                <AppPopover wrap={true} content={'Boba Network Under Maintenance'}>
                  <TransactionButton
                    className="button disabled"
                    disabled={true}
                    onClick={() => { }}
                    style={{ width: '100%' }}
                  >
                    Exchange
                  </TransactionButton>
                </AppPopover>
              )
          }
        </Col>
      </Row>
    </div>)
  }

  function HistoryRecordRow(recordData, index) {
    const depositAmount = parseFloat(recordData.depositAmount).toFixed(4);
    const receiveAmount = Number(recordData.receiveAmount - recordData.receiveFee).toFixed(4);
    const depositUnit = tokenUnits.find(item => item.value == recordData.depositCoin)?.label || '';
    const receiveUnit = tokenUnits.find(item => item.value == recordData.receiveCoin)?.label || '';
    const status: number = ~~recordData.status;
    const time = recordData.createTime + '000';
    const createDate = formatDate(time, 'MM/DD/YYYY')
    const createTime = formatDate(time, 'HH:mm')
    return isDesktopOrLaptop ? (
      <Row gutter={[16, 16]} className={styles['history-row']} align="middle" key={index}>
        <Col span={3} className={styles['line-2']}>
          {createDate}
          <br />
          {createTime}
        </Col>
        <Col span={3} className={styles['line-2']}>
          {depositAmount} <br /> {depositUnit}
        </Col>
        <Col span={3} offset={0} className={styles['line-2']}>
          {receiveAmount} <br /> {receiveUnit}
        </Col>
        <Col span={12} offset={0}>
          {
            recordData.depositTxid ?
              <>
                <AppPopover content={recordData.depositTxid}>
                  {recordData.depositTxid.replace(/^(.{10}).*(.{10})$/g, '$1...$2') || '-'}
                </AppPopover>
              </>
              :
              <>-</>
          }
        </Col>
        <Col span={3} offset={0}>
          {/* //order status 1.创建订单  2 已绑定txid   3 已入金  12 提现处理中  13 提现处理失败   14 提现处理成功   15 订单处理异常 */}
          {
            recordData.status == 1 && <span style={{ color: 'orange' }}>Not paid</span>
            || [2, 12, 13, 15].includes(status) && <span style={{ color: 'orange' }}>In Progress</span>
            || [16].includes(status) && <span style={{ color: 'red' }}>Failed</span>
            || [14].includes(status) && <span style={{ color: 'green' }}>Finish</span>
            || <span style={{ color: 'orange' }}>In Progress</span>
          }
        </Col>
      </Row>
    )
      : (
        <Timeline.Item>
          <Row gutter={[16, 16]} className={styles['history-row']} key={index}>
            <Col span={16} style={{ color: '#666666' }} className={styles['line-2']}>
              {createDate} {createTime}
            </Col>
            <Col span={4} offset={3} className={styles['line-2']}>
              {/* //order status 1.创建订单  2 已绑定txid   3 已入金  12 提现处理中  13 提现处理失败   14 提现处理成功   15 订单处理异常 */}
              {
                recordData.status == 1 && <span style={{ color: 'orange' }}>Not paid</span>
                || [2, 12, 13, 15].includes(status) && <span style={{ color: 'orange' }}>In Progress</span>
                || [16].includes(status) && <span style={{ color: 'red' }}>Failed</span>
                || [14].includes(status) && <span style={{ color: 'green' }}>Finish</span>
                || <span style={{ color: 'orange' }}>In Progress</span>
              }
            </Col>
            <Col span={8} offset={1} className={styles['line-2']}>
              {depositAmount} <br /> {depositUnit}
            </Col>
            <Col span={2} offset={2}>
              <ArrowRightOutlined></ArrowRightOutlined>
            </Col>
            <Col span={8} offset={1} className={styles['line-2']}>
              {receiveAmount} <br /> {receiveUnit}
            </Col>
            <Col span={24} offset={0} className={styles['line-2']} style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
              <span style={{ fontWeight: '700' }}>Transaction ID: </span>&nbsp;
              {recordData.depositTxid}
            </Col>
          </Row>
        </Timeline.Item>
      )
  }

  // const TargetBridgeForm = useMemo(()=>{
  //   return BridgeInputForm({tokenUnits:TokenOptions[tokenType], style:{}})
  // }, [tokenType])

  return (
    <PageLoader>
      <div className={styles['bridge-form']}>
        <Modal visible={confirmModalVisible}></Modal>
        {/* deposit form */}
        <section className={styles['section']}>
          <Row justify="space-between" gutter={[16, 16]}>
            <Col className={styles['container']} span={isDesktopOrLaptop ? 24 : 24}>
              <h2 className={styles['title']}>
                <Row justify="space-between">
                  <Col>
                    <IconBridge className={styles['title-logo']}></IconBridge>
                    <span style={{ marginLeft: '10px' }}>Bridge</span>
                  </Col>
                  <Col>
                    {/* <span style={{fontSize:'16px', verticalAlign:'middle'}}>
                  See Tutorial: &nbsp;
                  <span 
                  className={styles['link']}
                  onClick={()=>{
                    window.open('https://medium.com/@boba_brewery/boba-brewery-website-update-earn-your-yield-farming-rewards-by-farming-bre-lp-tokens-63bb42103e5')
                  }}>{isDesktopOrLaptop ? 'C2N Bridge Tutorial' : 'Tutorial'} </span>
                </span> */}
                  </Col>
                </Row>
              </h2>
              <Row justify="center">
                <div className={styles['radios']}>
                  <div onClick={() => { setTokenType('BRE') }}
                    className={[styles['radio-item'], tokenType === 'BRE' ? styles['active'] : ''].join(' ')}>
                    <img
                      src="https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/Brewery32x32.png"
                      className={styles['token-logo']}>
                    </img>
                    <span>BRE</span>
                  </div>
                  <div onClick={() => { setTokenType('ETH') }}
                    className={[styles['radio-item'], tokenType === 'ETH' ? styles['active'] : ''].join(' ')}>
                    <img
                      src="https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/eth-logo.png"
                      className={styles['token-logo']}>
                    </img>
                    <span>ETH</span>
                  </div>
                  <div onClick={() => { setTokenType('USDT') }}
                    className={[styles['radio-item'], tokenType === 'USDT' ? styles['active'] : ''].join(' ')}>
                    <img
                      src="http://bobabrewery.oss-ap-southeast-1.aliyuncs.com/usdt-logo.png"
                      className={styles['token-logo']}>
                    </img>
                    <span>USDT</span>
                  </div>
                </div>
              </Row>
              {
                BridgeInputForm({ tokenUnits: TokenOptions['BRE'], style: { display: tokenType == 'BRE' ? '' : 'none' } })
              }
              {
                BridgeInputForm({ tokenUnits: TokenOptions['ETH'], style: { display: tokenType == 'ETH' ? '' : 'none' } })
              }
              {
                BridgeInputForm({ tokenUnits: TokenOptions['USDT'], style: { display: tokenType == 'USDT' ? '' : 'none' } })
              }
            </Col>
          </Row>
        </section>

        {/* history */}
        <section className={styles['section']}>
          <Row justify="space-between">
            <Col className={styles['container']} span={isDesktopOrLaptop ? 24 : 24}>
              <h2 className={styles['title']}>
                <IconHistory className={styles['title-logo']}></IconHistory>
                <span style={{ marginLeft: '10px' }}>History</span>
              </h2>
              <div className={styles['history']}>
                {
                  recordTotal > 0 && isDesktopOrLaptop ?
                    (<Row gutter={[16, 16]} className={styles['history-header']}>
                      <Col span={3}>
                        Date
                      </Col>
                      <Col span={3}>
                        Deposit
                      </Col>
                      <Col span={3} offset={0}>
                        Receive
                      </Col>
                      <Col span={12} offset={0}>
                        Transaction ID
                      </Col>
                      <Col span={3} offset={0}>
                        Status
                      </Col>
                    </Row>)
                    : <></>
                }
                {
                  recordTotal > 0
                    ? <>
                      {
                        historyRecord.map((item, index) => {
                          return (
                            HistoryRecordRow(item, index)
                          )
                        })
                      }
                      <Pagination simple defaultCurrent={1}
                        className={styles['pagination']}
                        hideOnSinglePage
                        pageSize={pageSize}
                        total={recordTotal}
                        onChange={(page, pageSize) => { setPageIndex(page) }}
                      />
                    </>
                    : (
                      <>
                        <Row justify="center" style={{ position: 'relative', height: '280px' }}>
                          <IconPoolsEmpty style={{ marginTop: '30px', position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' }} />
                        </Row>
                        <Row justify="center">
                          <div className={styles['empty-text']}>
                            There is no record at the moment
                          </div>
                        </Row>
                      </>
                    )
                }
              </div>
            </Col>
          </Row>
        </section>

      </div>
    </PageLoader>
  );
}
