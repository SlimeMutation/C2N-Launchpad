import { useEffect, useState, useMemo, useRef } from "react";
import { InputNumber, Row, Col, Carousel, Divider, Tabs, Modal, Spin } from "antd";
const { TabPane } = Tabs;
import Router from 'next/router'

import { Motion, spring } from 'react-motion';
import axios from '@src/api/axios'

import {
  BigNumber, Contract, providers
} from "ethers";
import TransactionButton from "@src/components/elements/TransactionButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { formatEther, parseEther, seperateNumWithComma, formatNumber } from "@src/util/index";
import { useWallet } from '@src/hooks/useWallet'
import { useStake } from '@src/hooks/useStake'
import { useThirdParty } from '@src/hooks/useThirdParty'
import { usePageLoading } from '@src/hooks/usePageLoading'
import { useMessage } from '@src/hooks/useMessage'
import { useResponsive } from '@src/hooks/useResponsive';

import styles from './FarmingForm.module.scss';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useErrorHandler } from "@src/hooks/useErrorHandler";
import AppPopover from "@src/components/elements/AppPopover";
import BasicButton from "@src/components/elements/Button.Basic";

type FarmingFormProps = {
  chainId,
  depositTokenAddress,
  earnedTokenAddress,
  stakingAddress,
  poolId,
  available,
  depositSymbol,
  earnedSymbol,
  title,
  depositLogo,
  earnedLogo,
  getLptHref,
  aprRate,
  aprUrl
}

export default function FarmingForm(props: FarmingFormProps) {
  const dispatch = useAppDispatch();

  const [depositNum, setDepositNum] = useState<number>();
  const [withdrawNum, setWithdrawNum] = useState<number>();
  const [depositInputError, setDepositInputError] = useState();
  const [despositTokenSymbol, setDespositTokenSymbol] = useState();
  const [earnedTokenSymbol, setEarnedTokenSymbol] = useState();
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  let poolInfoTimer = null;
  const [rewardPerSecond, setRewardPerSecond] = useState();
  const [apr, setApr] = useState<any>('**');
  const [priceInLP, setPriceInLP] = useState<any>(null);

  const {
    depositedAmount,
    earnedBre,
    totalPending,
    balance,
    approve,
    deposit,
    withdraw,
    updateBalanceInfo,
    stakingContract,
    viewStakingContract,
    setDepositTokenAddress,
    setStakingAddress,
    setAllowanceAddress,
    setPoolId,
  } = useStake();

  const [stakeLoading, setStakeLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const depositSymbol = props.depositSymbol;
  const earnedSymbol = props.earnedSymbol;

  const {
    setSuccessMessage,
    setErrorMessage,
  } = useMessage()

  const {
    getErrorMessage,
  } = useErrorHandler();

  const {
    isDesktopOrLaptop,
  } = useResponsive();

  // TODO: modify pool id
  const poolId = props.poolId;

  const tiers = useRef<any>(null);

  const {
    walletAddress,
    signer,
    chain,
    switchNetwork,
  } = useWallet();

  // const {
  //   stakedTokenToUsd,
  //   earnedTokenToUsd,

  //   getBobaToUsd,
  //   getBreToUsd,
  // } = useThirdParty();

  const {
    PageLoader,
    setPageLoading,
  } = usePageLoading()

  useEffect(() => {
    // getBobaToUsd();
    // getBreToUsd();
    setPoolId(props.poolId);

    // setPageLoading(true);
  }, []);

  useEffect(() => {
    if (!stakingContract) {
      clearInterval(poolInfoTimer);
      return;
    }
    clearInterval(poolInfoTimer);
    /**
     * 获取farm池子信息
     */
    const schedule = () => {
      getPoolInfo(poolId);
      getRewardPerSecond();
      updateBalanceInfo();

      // getApR();
    }

    schedule();
    poolInfoTimer = setInterval(() => schedule, 20000);

    return () => {
      clearInterval(poolInfoTimer);
    }
  }, [stakingContract])

  const totalDeposits = useMemo(() => {
    if (poolInfo) {
      return poolInfo.totalDeposits || 0;
    } else {
      return 0;
    }
  }, [poolInfo])

  const secondsPerYear = 60 * 60 * 24 * 365;

  const isChainAvailable = useMemo(() => {
    return chain?.chainId == props.chainId;
  }, [chain])

  useEffect(() => {
    if (isChainAvailable) {
      setDepositTokenAddress(props.depositTokenAddress);
    } else {
      clearInterval(poolInfoTimer);
    }
  }, [isChainAvailable, chain]);

  // useEffect(() => {
  //   if (poolInfo) {
  //     // setPageLoading(false);
  //   }
  // }, [poolInfo]);
  useEffect(() => {
    updateContracts();
  }, [signer, chain])


  /**
   * update staking contracts according to signer/chain
   */
  function updateContracts() {
    if (chain?.chainId != props.chainId || !signer) {
      // clear contracts
      setStakingAddress('');
      setAllowanceAddress('');
      return;
    }
    if (props.stakingAddress) {
      setStakingAddress(props.stakingAddress);
      setAllowanceAddress(props.stakingAddress);
    }
  }

  async function userInfo(pid, address) {
    if (!stakingContract) {
      return Promise.reject();
    }
    const options = {};
    const ret =
      stakingContract.userInfo &&
      (await stakingContract.userInfo(0, address, options));
  }

  async function getPoolInfo(poolId) {
    if (!viewStakingContract) {
      return Promise.reject();
    }
    const options = {};
    try {
      const ret =
        viewStakingContract.poolInfo &&
        (await viewStakingContract.poolInfo(poolId));
      console.log(ret, 'ret')
      setPoolInfo(ret);
    } catch (e) {
      console.error(e);
    }
  }

  async function getRewardPerSecond() {
    if (!stakingContract) {
      return Promise.reject();
    }
    const options = {};
    try {
      const ret =
        viewStakingContract.rewardPerSecond &&
        (await viewStakingContract.rewardPerSecond());
      setRewardPerSecond(ret);
    } catch (e) {
      console.error(e)
    }
  }

  // async function getApR() {
  //   axios.get(props.aprUrl).then((res) => {
  //     const data = res?.data;
  //     const apr = (data.apr * 100).toFixed(2);
  //     setApr(apr);
  //     const priceInLP = (data.priceInLP).toFixed(2);
  //     setPriceInLP(priceInLP);
  //   })
  // }


  /**
   * on stake button click
   */
  async function onStakeButtonClick() {
    if (depositNum == 0) {
      return;
    }
    await updateBalanceInfo();
    if (depositNum > formatEther(balance)) {
      setErrorMessage(`Not enough ${depositSymbol} to stake!`);
      return;
    }
    setStakeLoading(true)
    return approve(props.stakingAddress, depositNum)
      .then((txHash) => {
        return deposit(poolId, depositNum)
          .then((transaction) => {
            return transaction.wait();
          })
          .then(() => {
            setStakeLoading(false)
            setSuccessMessage('Congratulations, you have successfully deposited ' + depositNum + ' ' + depositSymbol);
            setDepositNum(0);
            updateBalanceInfo();
            // const saveStake = async () => {
            //   const f = new FormData();
            //   f.append('walletAddress', walletAddress);
            //   f.append('amount', depositNum + '');
            //   f.append('type', poolId + '');
            //   f.append('chainId', chain.chainId) + '';
            //   f.append('contractAddress', props.stakingAddress);
            //   return axios.post('/boba/save/staking', f)
            // }
            // return new Promise((resolve, reject) => {
            //   function loop() {
            //     setTimeout(() => {
            //       saveStake()
            //         .then(resolve)
            //         .catch(() => {
            //           loop();
            //         })
            //     }, 3000)
            //   }
            //   loop();
            // })
          })
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        // FIXME: error of object cannot catch, hence handle string here.
        if (typeof e === 'string' && e.indexOf('ERC20: transfer amount exceeds allowance') > -1) {
          msg = 'Approve amount should be greater than staking amount!';
        }
        setErrorMessage('Stake failed. ' + (msg || ''));
        updateBalanceInfo();
      })
  }

  function onWithdrawButtonClick() {
    setWithdrawLoading(true)
    return withdraw(poolId, withdrawNum)
      .then((transaction) => {
        return transaction.wait();
      })
      .then(() => {
        setWithdrawLoading(false)
        setSuccessMessage('Withdraw success!');
        setWithdrawNum(0);
        updateBalanceInfo();
        // const saveWithdraw = async () => {
        //   const f = new FormData();
        //   f.append('walletAddress', walletAddress);
        //   f.append('amount', withdrawNum + '');
        //   f.append('type', poolId + '');
        //   f.append('chainId', chain.chainId + '');
        //   f.append('contractAddress', props.stakingAddress);
        //   return axios.post('/boba/save/withdraw', f)
        // }
        // return new Promise((resolve, reject) => {
        //   function loop() {
        //     setTimeout(() => {
        //       saveWithdraw()
        //         .then(resolve)
        //         .catch(() => {
        //           loop();
        //         })
        //     }, 3000)
        //   }
        //   loop();
        // })
        // .catch(e => {
        //   throw e;
        // })
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        setErrorMessage('Withdraw failed. ' + (msg || ''));
      })
  }

  function onHarvestButtonClick() {
    return withdraw(poolId, 0)
      .then((transaction) => {
        return transaction.wait();
      })
      .then(() => {
        setSuccessMessage('Harvest success!');
        updateBalanceInfo();
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        setErrorMessage('Harvest failed. ' + (msg || ''));
      })
  }

  const totalDepositsInEther: number = formatEther(totalDeposits) as number;
  // const totalDepositsInUsd: number = totalDepositsInEther * stakedTokenToUsd;
  const earnedBreInEther: number = formatEther(earnedBre);
  const depositedAmountInEther: number = formatEther(depositedAmount, 4)?.toFixed(4) || 0;

  function maxNumber(num) {
    return num > 0.01 ? num - 0.01 : num;
  }

  return (
    <div>
      {/* deposit form */}
      <Modal visible={formVisible} title={null} footer={null} onCancel={() => { setFormVisible(false) }}>
        <Tabs className={styles['modal']} type="card">
          {/* stake form */}
          <TabPane key="1" tab="Stake">
            <Row justify="space-between" gutter={[16, 16]}>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                <Row justify="space-between">
                  <div className="balance">
                    {
                      stakingContract ?
                        <>Balance: {formatEther(balance, 4)?.toFixed(4)} {depositSymbol}</>
                        : <>Balance: -</>
                    }
                  </div>
                  <div className={styles['max']} onClick={() => setDepositNum(maxNumber(formatEther(balance)))}>MAX</div>
                </Row>
              </Col>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                <div className={styles['input']}>
                  <InputNumber
                    className={styles['number']}
                    value={depositNum}
                    max={formatEther(balance, 4)}
                    step="0.0001"
                    onChange={value => setDepositNum(value > 0 ? value : '')}
                    stringMode
                    controls={false}
                    bordered={false}
                  />
                  <div className={styles['unit']}>{depositSymbol}</div>
                </div>
              </Col>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                {
                  props.available ?
                    (
                      <TransactionButton
                        className={styles['button']}
                        onClick={onStakeButtonClick}
                        loadingText="staking"
                        noConnectText={'Connect wallet to stake'}
                        requiredChainId={props.chainId}
                        switchNetworkText={'Switch network to stake'}
                        style={{ width: '100%' }}
                      >
                        Stake
                      </TransactionButton>)
                    : (
                      <AppPopover content={'Coming soon'} wrap={true}>
                        <TransactionButton
                          className={[styles['button'], styles['disabled']].join(' ')}
                          disabled={true}
                          onClick={() => { }}
                          requiredChainId={props.chainId}
                          switchNetworkText={'Switch network to stake'}
                          noConnectText={'Connect wallet to stake'}
                          style={{ width: '100%' }}
                        >
                          Stake
                        </TransactionButton>
                      </AppPopover>
                    )
                }
              </Col>
            </Row>
          </TabPane>
          {/* reward */}
          <TabPane key="2" tab="Claim">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ textAlign: 'center', fontSize: '1.6em' }}>Reward</div>
              </Col>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  {/* <img src={props.earnedLogo} style={{ borderRadius: '50%' }}></img> &nbsp; */}
                  <span style={{ fontSize: '1.2em' }}>{earnedBre === null ? <Spin /> : earnedBreInEther} {earnedSymbol}</span>
                </div>
              </Col>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                {
                  props.available ?
                    (<TransactionButton
                      className={styles['button']}
                      onClick={onHarvestButtonClick}
                      noConnectText={'Connect wallet to withdraw'}
                      style={{ width: '100%' }}
                      loadingText="claiming"
                    >
                      Claim
                    </TransactionButton>)
                    : (
                      <AppPopover content={'Coming soon'} wrap={true}>
                        <TransactionButton
                          className={[styles['button'], styles['disabled']].join(' ')}
                          disabled={true}
                          onClick={() => { }}
                          noConnectText={'Connect wallet to claim'}
                          style={{ width: '100%' }}
                        >
                          Claim
                        </TransactionButton>
                      </AppPopover>
                    )
                }
              </Col>
            </Row>
          </TabPane>
          {/* withdraw */}
          <TabPane key="3" tab="Unstake">
            <Row gutter={[16, 16]}>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                <Row justify="space-between">
                  {
                    stakingContract
                      ? <>
                        <div className="balance">Balance: {formatEther(depositedAmount, 4)?.toFixed(4)} {depositSymbol}</div>
                      </>
                      : <>
                        <div className="balance">Balance: -</div>
                      </>
                  }
                  <div className={styles['max']} onClick={() => setWithdrawNum(maxNumber(formatEther(depositedAmount, 4)))}>MAX</div>
                </Row>
              </Col>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                <div className={styles['input']}>
                  <InputNumber
                    className={styles['number']}
                    value={withdrawNum}
                    max={formatEther(depositedAmount, 4)}
                    step="0.0001"
                    onChange={value => setWithdrawNum(value > 0 ? value : '')}
                    stringMode
                    controls={false}
                    bordered={false}
                  />
                  <div className={styles['unit']}>{depositSymbol}</div>
                </div>
              </Col>
              <Col span={isDesktopOrLaptop ? 24 : 24}>
                {
                  props.available ?
                    (<TransactionButton
                      className={styles['button']}
                      onClick={onWithdrawButtonClick}
                      loadingText="withdrawing"
                      noConnectText={'Connect wallet to withdraw'}
                      style={{ width: '100%' }}
                    >
                      Unstake
                    </TransactionButton>)
                    : (
                      <AppPopover content={'Coming soon'} wrap={true}>
                        <TransactionButton
                          className={[styles['button'], styles['disabled']].join(' ')}
                          disabled={true}
                          onClick={() => { }}
                          noConnectText={'Connect wallet to unstake'}
                          style={{ width: '100%' }}
                        >
                          Unstake
                        </TransactionButton>
                      </AppPopover>
                    )
                }
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Modal>
      <div className={styles['farming-card']}>
        {/* Disable in wrong network */}
        {
          isChainAvailable
            ? <></>
            : (<div className={styles['mask']} onClick={() => {
              switchNetwork(props.chainId)
            }}>
              <div className={styles['mask-text']}>
                {/* Switch Network to use this farm */}
              </div>
              {/* <BasicButton >
              Switch Network
            </BasicButton> */}
            </div>)
        }
        <section className={styles['container']}>
          <Row className={styles['container-title']} align="middle" justify="start">
            {/* TODO: FIXME */}
            {/* {depositSymbol} - {earnedSymbol} */}
            {/* <img src={props.depositLogo} style={{ width: '1.2em', height: '1.2em', borderRadius: '50%' }}></img> */}
            &nbsp;
            {/* <img src={props.earnedLogo} style={{ width: '1.2em', height: '1.2em', borderRadius: '50%' }}></img> */}
            &nbsp;
            {props.title}
          </Row>
          <Divider style={{ margin: '0' }}></Divider>
          <Row className={styles['apy']} justify="center">
            {/* TODO: FIXME */}
            {apr === null ? <Spin /> : <>{apr || '-'} %</>}
            {/* 6569.52 % */}
          </Row>
          <Row className={styles['apy-extra']} justify="center">
            APR
          </Row>
          <div className={styles['records']}>
            <Row className={styles['record']} justify="space-between">
              <Col className={styles['record-label']}>
                Earned
              </Col>
              <Col className={styles['record-value']}>
                {/* <img src={props.earnedLogo} style={{ width: '1.2em', height: '1.2em', borderRadius: '50%', verticalAlign: 'text-bottom', marginRight: '.2em' }}></img> */}
                {earnedSymbol}
              </Col>
            </Row>
            <Row className={styles['record']} justify="space-between">
              <Col className={styles['record-label']}>
                Total staked
              </Col>
              <Col className={styles['record-value']}>
                {poolInfo === null ? <Spin /> : seperateNumWithComma(formatEther(totalDeposits))} {depositSymbol}
              </Col>
            </Row>
            <Row className={styles['record']} justify="space-between">
              <Col className={styles['record-label']}>
                My staked
              </Col>
              <Col className={styles['record-value']}>
                {depositedAmount === null ? <Spin /> : depositedAmountInEther} {depositSymbol}
              </Col>
            </Row>
            <Row className={styles['record']} justify="space-between">
              <Col className={styles['record-label']}>
                Available
              </Col>
              <Col className={styles['record-value']}>
                {balance === null ? <Spin /> : (formatEther(balance, 4)?.toFixed(4) || 0)} {depositSymbol}
              </Col>
            </Row>
          </div>
          <Row>
            <TransactionButton
              className={styles['button']}
              onClick={() => setFormVisible(true)}
              noConnectText={'Connect wallet to stake'}
              style={{ width: '100%' }}
            >
              Stake
            </TransactionButton>
          </Row>
          <Row className={styles['record']} justify="space-between">
            <Col className={styles['record-label']}>
              Rewards
            </Col>
            <Col className={styles['record-value']}>
              {earnedBre === null ? <Spin /> : earnedBreInEther} {earnedSymbol} &nbsp;
              <span
                onClick={() => { props.available && setFormVisible(true) }}
                className={styles['link']}
                style={{ background: '#DEDEDE', color: '#707070' }}
              >
                Claim
              </span>
            </Col>
          </Row>
          <Row className={styles['record']} justify="space-between">
            <Col className={styles['record-label']}>
              {
                priceInLP ?
                  <>1 {props.title} ≈ $ {priceInLP}</>
                  : <>{props.title}</>
              }
            </Col>
            <Col className={styles['record-value']}>
              <span onClick={() => { Router.push('/') }}
                className={styles['link']}
                style={{ background: '#D9EE77' }}
              >
                GET {depositSymbol}
              </span>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
}
