import { useEffect, useState, useMemo, useRef } from "react";
import { InputNumber, Row, Col, Carousel } from "antd";
import { Motion, spring } from 'react-motion';
// import axios from '@src/api/axios'

// import {
//   BigNumber,
//   Contract,
//   providers,
// } from "ethers";
// import abiJSON from '@src/util/abis.json'
// import {
//   EARNED_TOKEN_ADDRESS,
//   STAKING_POOL_ID,
// } from '@src/config'
import TransactionButton from "@src/components/elements/TransactionButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { formatEther, parseEther, seperateNumWithComma, formatNumber } from "@src/util/index";
import { useWallet } from '@src/hooks/useWallet'
import { useStake } from '@src/hooks/useStake'
import { useThirdParty } from '@src/hooks/useThirdParty'
import { usePageLoading } from '@src/hooks/usePageLoading'
import { useMessage } from '@src/hooks/useMessage'
import { useResponsive } from '@src/hooks/useResponsive';

import styles from './StakingForm.module.scss';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useErrorHandler } from "@src/hooks/useErrorHandler";
import AppPopover from "@src/components/elements/AppPopover";

function TierCard(props: any) {
  const data = props && props['data'] || [];
  return (<div className={[styles['tier-card'], 'tier-card'].join(' ')}>
    <div className="wrapper">
      <Row justify="center" className={styles['tier-title']}>
        {data[0] || ''}
      </Row>
      <Row justify="center" className={styles['tier-label']}>
        Staking Requirement
      </Row>
      <Row justify="center" className={styles['tier-value-large']}>
        {data[1] || ''}
      </Row>
      <Row justify="center" className={styles['tier-label']}>
        Whitelist Requirement Twitter
      </Row>
      <Row justify="center" className={styles['tier-value-small']}>
        Like, Comment & Retweet
      </Row>
      <Row justify="center" className={styles['tier-label']}>
        Guaranteed Allocation
      </Row>
      <Row justify="center" className={styles['tier-value-small']}>
        Yes
      </Row>
      <Row justify="center" className={styles['tier-label']}>
        Allocation Weight
      </Row>
      <Row justify="center" className={styles['tier-value-medium']}>
        {data[2] || ''}
      </Row>
    </div>
  </div>)
}

type StakingFormProps = {
  poolId: number,
  available: boolean,
}

export default function StakingForm(props: StakingFormProps) {
  const dispatch = useAppDispatch();

  const [depositNum, setDepositNum] = useState<number>();
  const [withdrawNum, setWithdrawNum] = useState<number>();
  const [depositInputError, setDepositInputError] = useState();
  const [poolInfo, setPoolInfo] = useState<any>();
  let poolInfoTimer = null;
  const [rewardPerSecond, setRewardPerSecond] = useState();

  const {
    depositedAmount,
    earnedBre,
    totalPending,
    balance,
    depositSymbol,
    earnedSymbol,
    approve,
    deposit,
    withdraw,
    updateBalanceInfo,
    stakingContract,
    viewStakingContract,
    setDepositTokenAddress,
    setEarnedTokenAddress,
    setAllowanceAddress,
    setStakingAddress,
    globalPoolStakingAddress,
    globalPoolDepositTokenAddress,
    globalPoolEarnedTokenAddress,
  } = useStake();

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
  const poolId = props.poolId;

  const tiers = useRef<any>(null);

  const {
    walletAddress,
    chain,
  } = useWallet();
  const chainId = chain?.chainId;


  const {
    stakedTokenToUsd,
    earnedTokenToUsd,

    getBobaToUsd,
    getBreToUsd,
  } = useThirdParty();

  const {
    PageLoader,
    setPageLoading,
  } = usePageLoading()

  /**
   * 获取代币价格的接口
   */
  // useEffect(() => {
  //   getBobaToUsd();
  //   getBreToUsd();

  //   // setPageLoading(true);
  // }, []);

  useEffect(() => {
    if (!viewStakingContract) {
      return;
    }
    clearInterval(poolInfoTimer);
    getPoolInfo(poolId);
    getRewardPerSecond();
    updateBalanceInfo();

    poolInfoTimer = setInterval(() => {
      getPoolInfo(poolId);
      getRewardPerSecond();
      updateBalanceInfo();
    }, 20000);

    return () => {
      clearInterval(poolInfoTimer);
    }
  }, [viewStakingContract, walletAddress, chain])

  const totalDeposits = useMemo(() => {
    if (poolInfo) {
      return poolInfo.totalDeposits || 1;
    } else {
      return 1;
    }
  }, [poolInfo])

  const secondsPerYear = 60 * 60 * 24 * 365;

  // useEffect(() => {
  //   if (poolInfo) {
  //     // setPageLoading(false);
  //   }
  // }, [poolInfo]);

  useEffect(() => {
    setStakingAddress(globalPoolStakingAddress);
    setAllowanceAddress(globalPoolStakingAddress);
  }, [globalPoolStakingAddress]);

  useEffect(() => {
    setDepositTokenAddress(globalPoolDepositTokenAddress);
  }, [globalPoolDepositTokenAddress]);

  useEffect(() => {
    setEarnedTokenAddress(globalPoolEarnedTokenAddress);
  }, [globalPoolEarnedTokenAddress]);

  // async function userInfo(pid, address) {
  //   if (!stakingContract) {
  //     return Promise.reject();
  //   }
  //   const options = {};
  //   const ret =
  //     stakingContract.userInfo &&
  //     (await stakingContract.userInfo(0, address, options));
  // }

  async function getPoolInfo(poolId) {
    if (!viewStakingContract) {
      return Promise.reject();
    }
    const options = {};
    try {
      const ret =
        viewStakingContract.poolInfo &&
        (await viewStakingContract.poolInfo(poolId));
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
      console.error(e);
    }
  }


  /**
   * on stake button click
   */
  async function onStakeButtonClick() {
    if (depositNum == 0) {
      setErrorMessage(`Cannot stake 0 ${depositSymbol}!`);
      return;
    }
    await updateBalanceInfo();
    if (depositNum > formatEther(balance)) {
      setErrorMessage(`Not enough ${depositSymbol} to stake!`);
      return;
    }
    return approve(globalPoolStakingAddress, depositNum)
      .then((txHash) => {
        return deposit(poolId, depositNum)
          .then((transaction) => {
            return transaction.wait();
          })
          .then((r) => {
            console.log('stake success', r)
            // const saveStake = async () => {
            //   const f = new FormData();
            //   f.append('walletAddress', walletAddress);
            //   f.append('amount', depositNum + '');
            //   f.append('type', poolId + '');
            //   f.append('chainId', chain.chainId) + '';
            //   f.append('contractAddress', globalPoolStakingAddress);
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
            return
          })
          .then(() => {
            setSuccessMessage('Congratulations, you have successfully deposited ' + depositNum + ' ' + depositSymbol);
            setDepositNum(0);
            updateBalanceInfo();
            return Promise.resolve();
          })
          .catch(e => {
            throw e;
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
    // TODO: fix callback
    return withdraw(poolId, withdrawNum)
      .then((transaction) => {
        return transaction.wait();
      })
      .then(() => {
        console.log('withdraw success');
        return;
        // const saveWithdraw = async () => {
        //   const f = new FormData();
        //   f.append('walletAddress', walletAddress);
        //   f.append('amount', withdrawNum + '');
        //   f.append('type', poolId + '');
        //   f.append('chainId', chain.chainId + '');
        //   f.append('contractAddress', globalPoolStakingAddress);
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
        //   .catch(e => {
        //     throw e;
        //   })
      })
      .then(() => {
        setSuccessMessage('Withdraw success!');
        setWithdrawNum(0);
        updateBalanceInfo();
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        setErrorMessage('Withdraw failed. ' + (msg || ''));
      })
  }

  // function onHarvestButtonClick() {
  //   return withdraw(poolId, 0)
  //     .then((transaction) => {
  //       return transaction.wait();
  //     })
  //     .then(() => {
  //       setSuccessMessage('Harvest success!');
  //       updateBalanceInfo();
  //     })
  //     .catch((e) => {
  //       console.error(e);
  //       let msg = getErrorMessage(e);
  //       setErrorMessage('Harvest failed. ' + (msg || ''));
  //     })
  // }

  const totalDepositsInEther: number = formatEther(totalDeposits) as number;
  const totalDepositsInUsd: number = totalDepositsInEther * stakedTokenToUsd;
  const earnedBreInEther: number = formatEther(earnedBre);
  const depositedAmountInEther: number = formatEther(depositedAmount) || 0;

  {/* total statistic */ }
  // const statistic = (
  //   <section className={styles['total-stat']}>
  //     <div className={styles['box']}>
  //       <div className={styles['label']}>
  //         Total {depositSymbol} Staked
  //       </div>
  //       <div className={styles['value']}>
  //         {totalDepositsInEther}
  //       </div>
  //       <div className={styles['extra']}>
  //         {/* FIXME: should multiple boba to eth price */}
  //         ~${(totalDepositsInUsd || 0).toFixed(2)}
  //       </div>
  //     </div>
  //     <div className={styles['box']}>
  //       <div className={styles['label']}>
  //         Total Rewards Distributed
  //       </div>
  //       <div className={styles['value']}>
  //         {formatEther(totalPending)}
  //       </div>
  //       <div className={styles['extra']}>
  //         {/* FIXME: should multiple bre to eth price */}
  //         ~${formatEther(totalPending) * earnedTokenToUsd}
  //       </div>
  //     </div>
  //     <div className={styles['box']}>
  //       <div className={styles['label']}>
  //         Reward Unlock Rate
  //       </div>
  //       <div className={styles['value']}>
  //         {formatEther(rewardPerSecond)} {earnedSymbol} <span style={{ fontSize: '20px', color: '#000000', }}>/ Second</span>
  //       </div>
  //       <div className={styles['extra']}>
  //         {/* FIXME: should multiple bre to eth price */}
  //         ~${(formatEther(rewardPerSecond) * earnedTokenToUsd).toFixed(2)}
  //       </div>
  //     </div>
  //   </section>)

  return (
    <PageLoader>
      <div className={styles['staking-form']}>

        {/* deposit form */}
        <section className={styles['stake-token']}>
          <Row justify="space-between" gutter={[16, 16]}>
            <Col className="left" span={isDesktopOrLaptop ? 12 : 24}>
              <h2 className={styles['title']}>
                <i className="icon icon-stake-3"></i>
                <span style={{ marginLeft: '10px' }}>Stake {depositSymbol}</span>
              </h2>
              <Row justify="space-between" gutter={[16, 16]}>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
                  <Row justify="space-between">
                    <div className="balance">
                      {
                        stakingContract ?
                          <>Balance: {formatEther(balance, 4)?.toFixed(4)} {depositSymbol}</>
                          : <>Balance: -</>
                      }
                    </div>
                    <div className="max" onClick={() => setDepositNum(formatEther(balance))}>MAX</div>
                  </Row>
                </Col>
              </Row>
              <Row justify="space-between" gutter={[16, 16]}>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
                  <div className="input">
                    <InputNumber
                      className={'number'}
                      value={depositNum}
                      max={formatEther(balance, 2)}
                      step="0.0001"
                      onChange={value => setDepositNum(value > 0 ? value : '')}
                      stringMode
                      controls={false}
                      bordered={false}
                    />
                    <div className="unit">{depositSymbol}</div>
                  </div>
                </Col>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
                  {
                    props.available ?
                      (<TransactionButton
                        className="button"
                        onClick={onStakeButtonClick}
                        noConnectText={'Connect wallet to stake222'}
                        requiredChainId={chainId}
                        switchNetworkText={'Switch network to stake'}
                        style={{ width: '100%' }}
                      >
                        Stake
                      </TransactionButton>)
                      : (<AppPopover content={'Coming soon'} wrap={true}>
                        <TransactionButton
                          className={styles['button']}
                          disabled={true}
                          onClick={() => { }}
                          noConnectText={'Connect wallet to stake111'}
                          style={{ width: '100%' }}
                        >
                          Stake
                        </TransactionButton>
                      </AppPopover>)
                  }
                </Col>
              </Row>
              <Row>
                &nbsp;
              </Row>
              <h2 className={styles['title']}>
                <i className="icon icon-stake-5"></i>
                <span style={{ marginLeft: '10px' }}>Withdraw {depositSymbol}</span>
              </h2>
              <Row gutter={[16, 16]}>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
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
                    <div className="max" onClick={() => setWithdrawNum(formatEther(depositedAmount, 4))}>MAX</div>
                  </Row>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
                  <div className="input">
                    <InputNumber
                      className={'number'}
                      value={withdrawNum}
                      max={formatEther(depositedAmount, 4)}
                      step="0.0001"
                      onChange={value => setWithdrawNum(value > 0 ? value : '')}
                      stringMode
                      controls={false}
                      bordered={false}
                    />
                    <div className="unit">{depositSymbol}</div>
                  </div>
                </Col>
                <Col span={isDesktopOrLaptop ? 12 : 24}>
                  {
                    props.available ?
                      (<TransactionButton
                        className="button"
                        onClick={onWithdrawButtonClick}
                        noConnectText={'Connect wallet to withdraw'}
                        requiredChainId={chainId}
                        switchNetworkText={'Switch network to withdraw'}
                        style={{ width: '100%' }}
                      >
                        Withdraw
                      </TransactionButton>)
                      : (<AppPopover content={'Coming soon'} wrap={true}>
                        <TransactionButton
                          className={styles['button']}
                          disabled={true}
                          onClick={() => { }}
                          noConnectText={'Connect wallet to withdraw'}
                          style={{ width: '100%' }}
                        >
                          Withdraw
                        </TransactionButton>
                      </AppPopover>)
                  }
                </Col>
              </Row>
            </Col>
            <Col className="right" span={isDesktopOrLaptop ? 12 : 24}>
              <Carousel className={styles['slider']} ref={tiers}
                dots={false}
                autoplay
              >
                {
                  [
                    ['Tier One', '1-5,000', '1'],
                    ['Tier Two', '5,001-25,000', '2'],
                    ['Tier Three', '25,001-50,000', '3'],
                    ['Tier Four', '50,001-100,000', '4'],
                    ['Tier Five', 'More than 100,000', '5'],
                  ].map((val, index) => {
                    return <TierCard data={val} key={index}></TierCard>
                  })
                }
              </Carousel>
              <LeftOutlined
                onClick={() => { tiers.current && tiers.current.prev() }}
                className={styles['tier-left-arrow']} />
              <RightOutlined
                onClick={() => { tiers.current && tiers.current.next() }}
                className={styles['tier-right-arrow']} />
            </Col>
          </Row>
        </section>

        <section className={styles['staking-stats']}>
          <h2 className={styles['title']}>
            <i className="icon icon-stake-4"></i>
            <span style={{ marginLeft: '10px' }}>Staking Stats</span>
          </h2>
          <Row className={styles['wrap']} gutter={isDesktopOrLaptop ? [16, 16] : [0, 16]}>
            <Col span={isDesktopOrLaptop ? 8 : 24}>
              <Row className={styles['box']} align="middle" gutter={4}>
                <Col span={24} className={styles['label']}>
                  <span>My Staked {depositSymbol}</span>
                </Col>
                <Col span={24} className={styles['value']}>
                  <Motion defaultStyle={{ x: 0 }} style={{ x: spring(depositedAmountInEther) }}>
                    {value => <>{seperateNumWithComma((value.x.toFixed(2)))} {depositSymbol}</>}
                  </Motion>
                  <div className={styles['extra']}>
                    ~${seperateNumWithComma((depositedAmountInEther * stakedTokenToUsd).toFixed(2))}
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={isDesktopOrLaptop ? 8 : 24}>
              <Row className={styles['box']} align="middle" gutter={4}>
                <Col span={24} className={styles['label']}>
                  <span>Total Value Locked</span>
                </Col>
                <Col span={24} className={styles['value']}>
                  $
                  <Motion defaultStyle={{ x: totalDepositsInUsd }} style={{ x: spring(totalDepositsInUsd) }}>
                    {value => <>{seperateNumWithComma(value.x.toFixed(0))}</>}
                  </Motion>
                </Col>
                <div className={styles['extra']}>
                  &nbsp;
                </div>
              </Row>
            </Col>
            <Col span={isDesktopOrLaptop ? 8 : 24}>
              <Row className={styles['box']} align="middle" gutter={4}>
                <Col span={24} className={styles['label']}>
                  <span>{depositSymbol} Price</span>
                </Col>
                <Col span={24} className={styles['value']}>
                  ${stakedTokenToUsd && stakedTokenToUsd.toFixed(4) || '0.00'}
                </Col>
                <div className={styles['extra']}>
                  &nbsp;
                </div>
              </Row>
            </Col>
          </Row>
        </section>

      </div>
    </PageLoader>
  );
}
