import type { AppProps } from 'next/app'
import Router from 'next/router'
import { Row, Col, Statistic, message, Timeline, Modal, Input, Spin } from 'antd';
import { QuestionCircleOutlined, InfoCircleOutlined, CopyOutlined } from '@ant-design/icons';
const { Countdown } = Statistic;

import {
  ProjectData,
  RegistrationData,
  SaleData,
} from '@src/types'
import {
  STAKING_POOL_ID, tokenAbi
} from '@src/config'
import styles from './project.module.scss'
import TransactionButton from "@src/components/elements/TransactionButton";
import PoolCard from '@src/components/elements/PoolCard'
import ParticipateModal from '@src/containers/ParticipateModal/ParticipateModal';
import InviteModal from '@src/containers/InviteModal/InviteModal';
import { useEffect, useState, useMemo } from 'react'
import { formatDate, hexToBytes, parseEther, formatEther, parseWei, seperateNumWithComma } from "@src/util/index"
import axios from '@src/api/axios'
import { useWallet } from '@src/hooks/useWallet'
import { usePageLoading } from '@src/hooks/usePageLoading'
import { useErrorHandler } from '@src/hooks/useErrorHandler'
import { useResponsive } from '@src/hooks/useResponsive';

import {
  BigNumber, Contract, ethers
} from 'ethers'

import { useMessage } from '../hooks/useMessage'
import { useLogin } from '../hooks/useLoginModal'
import { useStake } from '../hooks/useStake'
import { useThirdParty } from '../hooks/useThirdParty';
import AppPopover from '@src/components/elements/AppPopover';
import { WarningOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { parseUnits } from 'ethers/lib/utils';
import { abi } from './abi'
async function getBalanceOf(address, signer) {
  const contract = new Contract(address, abi, signer);
  const balance = await contract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
  console.log(balance.toString(),'???')
}

type OtherPoolInfoProps =
  {
    registration: RegistrationData,
    sale: SaleData,
  };

/**
 * Pool detail page
 */
export default function Pool({ Component, pageProps }: AppProps) {
  let search, params, pId;
  if (typeof window !== 'undefined') {
    search = window.location.search;
    params = new URLSearchParams(search);
    pId = params.get('id');
  }

  const {
    walletAddress,
    addToken,
    saleContract,
    saleAddress,
    setSaleAddress,
    setLoading,
    signer,
    chain,
  } = useWallet();

  const {
    setSuccessMessage,
    setErrorMessage
  } = useMessage();

  const {
    LoginModal,
    isUserRegister,
    showLoginModal,
    setLoginConfig,
    setLoginState,
  } = useLogin({ pId: pId });

  const {
    setDepositTokenAddress,
    depositedAmount,
    setStakingAddress,
    approve,
    stakingContract,
    depositDecimals,
    depositSymbol,
    setAllowanceAddress,
    allowance,
    globalPoolStakingAddress,
  } = useStake();

  useEffect(() => {
    setStakingAddress(globalPoolStakingAddress);
  }, [globalPoolStakingAddress])

  const {
    PageLoader,
    setPageLoading,
  } = usePageLoading();

  const {
    getErrorMessage,
  } = useErrorHandler();

  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  const [projectInfo, setProjectInfo] = useState<ProjectData>({} as ProjectData);
  const [tab, setTab] = useState('sale_info');
  // TODO: fix pool Id
  const [poolId, setPoolId] = useState<number>(STAKING_POOL_ID);
  const [statesReady, setStatesReady] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [canRegister, setCanRegister] = useState<boolean>(true);
  const [isParticipated, setIsParticipated] = useState<boolean>(false);
  const [participateAmount, setParticipateAmount] = useState();
  const [allocationTop, setAllocationTop] = useState('1000000000000000000000');
  const [participateInfo, setParticipateInfo] = useState<any>();

  const [otherPoolInfo, setOtherPoolInfo] = useState<OtherPoolInfoProps>();
  const [mileStones, setMileStones] = useState<any>({})

  const [paymentTokenAddress, setPaymentTokenAddress] = useState<string>('');
  const [paymentTokenDecimal, setPaymentTokenDecimal] = useState<number>(18);

  console.log({ allocationTop }, '------')
  // status: -1:not ready, 0: not started, 1: in registration, 
  // 2: after registration and before participation,
  // 3: in sale,
  // 4: sale ended,
  const [status, setStatus] = useState(-1);

  const [showParticipateModal, setShowParticipateModal] = useState(false);

  const [referralCode, setReferralCode] = useState(null);
  const [referralModalVisible, setReferralModalVisible] = useState(false);

  const {
  } = useThirdParty();
  const unImplementedInterfaceLog = (text) => {
    console.log('未实现的接口：', text);
  }


  useEffect(() => {
    setPageLoading(true);

    // get projects info
    axios.get('/boba/product/base_info', { params: { productId: pId } })
      .then((response) => {
        let data = response.data || {};
        data.allocationTop = 1;
        data.chainId = chain.chainId;
        console.log('project info:', data)
        setProjectInfo(data);
        setLoginConfig({
          tweetId: data.tweetId,
          tgGroupLink: data.medias,
          projectName: data.name,
        })
      })
      .catch((e) => {
        setErrorMessage('Network error, please check your network and refresh.')
      })
      .finally(() => {
        setPageLoading(false);
      })

    refreshStates();

    return (() => {
    })
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    // // check whether has registered other projects
    // axios.get('/boba/register/can_register', {
    //   params: { accountId: walletAddress }
    // })
    //   .then((response) => {
    //     setCanRegister(true);
    //   })
    //   .catch((e) => {
    //     setCanRegister(false);
    //   })

    const referralCode = localStorage?.getItem('referral');
    if (referralCode) {
      bindReferral(referralCode);
    }
  }, [walletAddress])

  useEffect(() => {
    refreshStates();
  }, [saleContract, walletAddress])

  useEffect(() => {
    if (isRegistered && depositedAmount) {
      getParticipateAmount();
    }
  }, [isRegistered, depositedAmount]);

  const amountBought: BigNumber = useMemo(() => {
    return participateInfo && BigNumber.from(participateInfo[0] as string) || BigNumber.from(0);
  }, [participateInfo])

  const amountETHPaid: BigNumber = useMemo(() => {
    return participateInfo && BigNumber.from(participateInfo[1] as string) || BigNumber.from(0);
  }, [participateInfo])

  const timeParticipated: number = useMemo(() => {
    return participateInfo && parseWei(participateInfo[2]) || 0;
  }, [participateInfo])

  const isPortionWithdrawn: Array<boolean> = useMemo(() => {
    return participateInfo && participateInfo[3] || 0;
  }, [participateInfo])

  // FIXME: should get vesting info from project api
  const vestingInfo = useMemo(() => {
    if (projectInfo && projectInfo.vestingPercentPerPortion && projectInfo.vestingPortionsUnlockTime) {
      return [projectInfo.vestingPercentPerPortion, projectInfo.vestingPortionsUnlockTime];
    } else {
      return [[], []];
    }
  }, [projectInfo]);

  const vestingPercentPerPortion: Array<number> = useMemo(() => {
    return vestingInfo && vestingInfo[0] || [];
  }, [vestingInfo]);

  const vestingPortionsUnlockTime: Array<number> = useMemo(() => {
    return vestingInfo && vestingInfo[1] || [];
  }, [vestingInfo]);
  const canWithdrawArr: Array<boolean> = useMemo(() => {
    if (vestingPortionsUnlockTime && isPortionWithdrawn) {
      return isPortionWithdrawn.map((canWithdraw, index) => {
        return !canWithdraw && (vestingPortionsUnlockTime[index] || '0' + '000') <= (Date.now() + '');
      })
    } else if (isPortionWithdrawn) {
      return isPortionWithdrawn.map(v => !v);
    } else {
      return [true];
    }
  }, [isPortionWithdrawn, status])

  useEffect(() => {
    const bigNumSec2Milsec = (bigSec) => {
      return (bigSec && (BigNumber.from(bigSec).toString())) || '';
    }
    if (projectInfo) {
      // init sale contract
      setSaleAddress(projectInfo.saleContractAddress);

      const mileStones = {
        registrationTimeStarts: bigNumSec2Milsec(projectInfo.registrationTimeStarts),
        registrationTimeEnds: bigNumSec2Milsec(projectInfo.registrationTimeEnds),
        saleStart: bigNumSec2Milsec(projectInfo.saleStart),
        saleEnd: bigNumSec2Milsec(projectInfo.saleEnd),
        unlock: bigNumSec2Milsec(projectInfo.unlockTime),
      }
      setMileStones(mileStones);
      setStatus(projectInfo.status);
      // setPaymentTokenAddress(projectInfo.paymentToken);
      setPaymentTokenAddress('0x1Dd5dcB05E451EfC6d6D4Fb2B905b02Dc3679aB4');
    }
  }, [projectInfo, otherPoolInfo]);

  useEffect(() => {
    const timer = setInterval(() => {
      judgePoolStatus();
    }, 1000)
    return () => {
      clearInterval(timer);
    }
  }, [mileStones])

  /**
   * payment token contract
   */
  useEffect(() => {
    setDepositTokenAddress(paymentTokenAddress);
  }, [paymentTokenAddress])

  useEffect(() => {
    setAllowanceAddress(saleAddress);
  }, [saleAddress])

  function judgePoolStatus() {
    const now = Date.now();
    if (!mileStones) {
      return;
    }

    if (now < mileStones.registrationTimeStarts) {
      // not started
      setStatus(0);
    } else if (now < mileStones.registrationTimeEnds) {
      // in registration
      setStatus(1);
    } else if (now < mileStones.saleStart) {
      // before sale
      setStatus(2);
    } else if (now < mileStones.saleEnd) {
      // in sale
      setStatus(3);
    } else if (now < mileStones.unlock) {
      // sale ends
      setStatus(4);
    } else if (now >= mileStones.unlock) {
      // sale ends and unlock(means can withdraw token)
      setStatus(5);
    }
  }

  function refreshStates() {
    if (!saleContract || !walletAddress) {
      return;
    }
    let option = { gasLimit: 100000 }
    let promiseA = saleContract.isRegistered(walletAddress, option)
      .then((data) => {
        setIsRegistered(data);
      })
      .catch(e => {
        console.error(e);
      });
    let promiseB = saleContract.isParticipated(walletAddress, option)
      .then((data) => {
        setIsParticipated(data);
        if (data) {
          getParticipateInfo();
        }
      })
      .catch(e => {
        console.error(e);
      });
    Promise.all([promiseA, promiseB])
      .then(() => {
        setStatesReady(true);
      })
  }

  /**
   * 
   * @returns Promise<string> - registration sign
   */
  function getRegistrationSign() {
    console.log('getRegis-------')
    const f = new FormData();
    f.append('userAddress', walletAddress || '');
    f.append('contractAddress', saleAddress);

    return axios.post('/boba/encode/sign_registration', f)
      .then((response) => {
        let data = response.data;
        console.log(data, 'ddddd')
        return data;
      })
      .catch(e => {
        // handle request error
        console.error(e);
        setErrorMessage('Register fail');
      })
  }
  /**
   * 
   * @returns Promise<string> - participate sign
   */
  function getParticipateSign() {
    const NUMBER_1E18 = "1000000000000000000";

    const f = new FormData();
    f.append('userAddress', walletAddress || '');
    f.append('contractAddress', saleAddress);
    // FIXME: get Participate amount
    f.append('amount', allocationTop);
    return axios.post('/boba/encode/sign_participation', f)
      .then((response) => {
        let data = response.data;
        console.log(data, 'sign ---------')
        return data;
      })
      .catch(e => {
        // handle request error
        console.error(e);
        setErrorMessage('Purchase fail');
      })
  }
  /**
   * bind referral codes
   * @param referralcode 
   * @returns 
   */
  function bindReferral(referralcode) {
    const f = new FormData();
    f.append('referralCode', referralcode);
    f.append('participant', walletAddress);
    return axios.post('/boba/referral/bind', f)
  }

  /**
   * Register 
   * @returns Promise
   */
  function registerForSale() {
    if (!isUserRegister) {
      showLoginModal();
      return;
    }
    if (!saleContract) {
      return Promise.reject();
    }
    return getRegistrationSign()
      .then((registrationSign) => {
        console.log(registrationSign, 'sign')
        const signBuffer = hexToBytes(registrationSign);
        return saleContract.registerForSale(signBuffer, poolId)
          .then(transaction => {
            return transaction.wait();
          })
          .then(() => {
            setSuccessMessage('Register success');
            refreshStates();
            return Promise.resolve();
          })
          .then(() => {
            // // on register success
            // const sendRegisterSuccess = async () => {
            //   const referralCode = localStorage?.getItem('referral');
            //   const f = new FormData();
            //   f.append('accountId', walletAddress);
            //   f.append('productId', pId);
            //   f.append('referralCode', referralCode)
            //   return axios.post('/boba/register/user_register', f).then(() => {
            //     if (typeof window !== 'undefined') {
            //       window.localStorage.removeItem('referral');
            //     }
            //   })
            // }

            function loop() {
              // setTimeout(() => {
              //   sendRegisterSuccess()
              //     .catch(() => {
              //       loop();
              //     })
              // }, 3000)
            }
            // loop();
          })
          .then(() => {
            function loop() {
              setTimeout(() => {
                addRegisterAmount()
                  .then(() => {
                    getParticipateAmount();
                  })
                  .catch(() => {
                    loop();
                  })
              }, 3000)
            }
            loop();
          })
      })
      .catch(e => {
        setErrorMessage('Participate failed. ' + (getErrorMessage(e) || ''));
        console.error(e);
      })
  }

  function addRegisterAmount(amount?, productId?, accountId?) {
    unImplementedInterfaceLog('/boba/amount/register/add');
    return Promise.resolve();
    // const f = new FormData();
    // Object.entries({ stakeAmount: amount || depositedAmount || 0, productId: productId || pId, accountId: accountId || walletAddress })
    //   .forEach(([key, value]) => {
    //     f.append(key, value as string);
    //   })
    // return axios.post('/boba/amount/register/add', f)
    //   .then((response) => {
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //   })
  }

  function getParticipateAmount() {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let pId = params.get('id');
    const f = new FormData();
    Object.entries({ accountId: walletAddress, productId: pId })
      .forEach(([key, value]) => {
        f.append(key, value as string);
      })
    unImplementedInterfaceLog('/boba/amount/calc');
    return Promise.resolve();
    // return axios.post('/boba/amount/calc', f)
    //   .then((response) => {
    //     let data = response.data;
    //     setAllocationTop(data.amount.replace(/\..+$/g, ''));
    //     return data;
    //   })
  }
  /**
   * Participate project
   * @returns Promise
   */
  async function participate(value) {
    console.log(value, 'val ---------------')
    if (!saleContract) {
      return Promise.reject();
    }
    setLoading(true);
    // const decimals = await depositTokenContract.decimals();
    // const paymentAmount = BigNumber.from(projectInfo.tokenPriceInPT).mul(~~value.value).div(Math.pow(10, 18-decimals));
    const paymentAmount = BigNumber.from(projectInfo.tokenPriceInPT).mul(~~value.value);
    return approve(saleAddress, Number(ethers.utils.formatUnits(paymentAmount, depositDecimals)), depositDecimals)
      .then(getParticipateSign)
      .then(async (participateSign) => {
        const signBuffer = hexToBytes(participateSign);
        // get participation value
        const options = {
          value: paymentAmount
        };
        console.log({ allocationTop, paymentAmount: paymentAmount.toString(), saleAddress: projectInfo.saleContractAddress, options, bg: BigNumber.from(allocationTop + '') }, 'params---------')
        return saleContract.participate(
          signBuffer,
          BigNumber.from(allocationTop + ''),
          options
        )
          .then((transaction) => {
            return transaction.wait();
          })
          .then((transaction) => {
            setSuccessMessage('Purchase success');
            refreshStates();
            setShowParticipateModal(false);
            return Promise.resolve();
          })
      })
      .catch((e) => {
        console.error(e);
        // if(e && e.code === -32603) {
        //   setErrorMessage('Purchase fail, it seems you don\'t have enough ETH tokens to pay, please check your balance.')
        //   return;
        // }
        let msg = getErrorMessage(e);
        setErrorMessage('Purchase fail. ' + (msg || ''));
        return;
      })
      .finally(() => {
        setLoading(false);
      })
  }

  function withdrawTokens() {
    getBalanceOf(projectInfo.tokenAddress, signer);
    // return;
    if (!saleContract) {
      return Promise.reject();
    }
    // set protionId
    let portionIds = canWithdrawArr.map((canWithdraw, index) => {
      return canWithdraw ? index : -1;
    })
      .filter(v => v > -1);
    return saleContract.withdrawMultiplePortions(portionIds)
      .then(transaction => {
        return transaction.wait();
      })
      .then((transaction) => {
        setSuccessMessage('withdraw success');
        refreshStates();
        return Promise.resolve();
      })
      .catch((e) => {
        let msg = getErrorMessage(e);
        setErrorMessage('Withdraw fail. ' + (msg || ''));
      })
  }

  function getParticipateInfo() {
    if (!saleContract) {
      return Promise.reject;
    }
    let option = { gasLimit: 100000 }
    return saleContract.getParticipation(walletAddress, option)
      .then(data => {
        return setParticipateInfo(data);
      })
      .catch((e) => {
        setErrorMessage('Get participation info fail, please check your network and refresh!');
        console.error(e);
      })
  }
  const SaleInfo = (
    <div className={styles['sale-info'] || ''}>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Project Website </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
          <a href={projectInfo.projectWebsite} target="_blank" rel="noreferrer">{projectInfo.projectWebsite}</a>
        </Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Number of Registrations </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo.numberOfRegistrants}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Vesting </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo.vesting}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> TGE </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{formatDate(projectInfo.tge, 'HH:mm, Month DD, YYYY')}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Sale Contract Address </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
          {projectInfo?.saleContractAddress || ''}
        </Col>
      </Row>
    </div>
  )
  const TokenInfo = (
    <div className={styles['token-info'] || ''}>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Token Name </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo.tokenName}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Token Symbol</Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo.symbol}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Token Decimals </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo.decimals}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> IDO Total Supply </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>{projectInfo && seperateNumWithComma(formatEther(projectInfo.amountOfTokensToSell) / 1.25)}</Col>
      </Row>
      <Row className={styles['row']}>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Token Address </Col>
        <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
          {projectInfo?.tokenAddress || ''}
        </Col>
      </Row>
    </div>
  )

  const alloTable = <>
    {isRegistered ? (
      <div className={styles['allocation-info']}>
        {/* visible after registration */}
        <Row className={styles['row']}>
          <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}>
            My Allocation
            <AppPopover
              content={<div style={{ width: '300px' }}>Your allocations could be changed during the registration period,
                and the final allocations will be fixed when the registration ends.
                You can always add staking tokens to increase your allocations during the registration time.</div>}>
              <QuestionCircleOutlined
                style={{ marginLeft: '10px', color: '#FFB852', cursor: 'pointer' }}
              />
            </AppPopover>
          </Col>
          <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
            {
              !allocationTop || allocationTop == 0
                ? <><Spin style={{ verticalAlign: 'text-bottom' }}></Spin> <span>Calculating...</span></>
                : <>{seperateNumWithComma(formatEther(allocationTop, 2))} {projectInfo.symbol}</>
            }
          </Col>
        </Row>
        {/* visible after participation */}
        {
          isParticipated && !!participateInfo ? (<>
            <Row className={styles['row']}>
              <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}>
                My Participation
              </Col>
              <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
                <AppPopover content={<>{formatEther(amountETHPaid).toFixed(2)} ETH</>}>
                  {seperateNumWithComma(formatEther(amountBought, 2))} {projectInfo.symbol}
                </AppPopover>
              </Col>
            </Row>
            <Row className={styles['row']}>
              <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['label']}> Purchase Time </Col>
              <Col span={isDesktopOrLaptop ? 12 : 24} className={styles['value']}>
                {formatDate(timeParticipated + '000', 'YYYY-MM-DD HH:mm:ss')}
              </Col>
            </Row>
            {/* <Row className={styles['row']}>
          <Col span={12} className={styles['label']}> Withdraw Status </Col>
          <Col span={12} className={styles['value']}>
            A
            Locked,
            Withdrawn, 
          </Col>
        </Row> */}
          </>)
            : <></>
        }
      </div>) : (<><Row className={styles['row']} justify="center" align="middle">
        <WarningOutlined
          style={{ color: 'red', fontSize: '32px', marginRight: '15px' }}
        />
        <div style={{ 'whiteSpace': 'nowrap', 'lineHeight': '50px' }}>
          You need to participate to check your allocation.
        </div>
      </Row></>)}
  </>

  const getTabInfo = () => {
    switch (tab) {
      case 'token_info':
        return TokenInfo;
      case 'about':
        return <>
          <div className={styles['about']} dangerouslySetInnerHTML={{ __html: projectInfo.aboutHtml || '' }}></div>
        </>
      case 'allocations':
        return alloTable;
      case 'sale_info':
      default:
        return SaleInfo;
    }
  }
  const getActionButton = () => {
    if (projectInfo.type == 1) {

    }
    // no contract in this chain  
    if (chain && chain.chainId != projectInfo.chainId) {
      return <TransactionButton
        noConnectText={'Connect wallet to stake'}
        className={'button ' + styles['register-button']}
        requiredChainId={projectInfo.chainId}
        switchNetworkText={'Switch Network'}
      >
        Switch Network
      </TransactionButton>
    }
    // not started
    if (statesReady && [0].includes(status)) {
      if (depositedAmount == 0) {
        return <TransactionButton
          noConnectText={'Connect wallet to stake'}
          className={'button ' + styles['register-button']}
          onClick={() => Router.push('/stake')}
        >
          Staking Now
        </TransactionButton>
      } else {
        return <AppPopover content={'Not started!'} wrap={true}>
          {
            <TransactionButton
              disabled={true}
              noConnectText={'Connect wallet to register'}
              className={'button ' + styles['register-button'] + ' ' + (isRegistered ? 'disabled' : '')}
              onClick={registerForSale}
            >
              {
                // isUserRegister ? 'Participate': 
                'Register'}
            </TransactionButton>
          }
        </AppPopover>
      }
    }
    // in registration
    if (statesReady && [1].includes(status)) {
      if (!isRegistered && !canRegister) {
        return <AppPopover content={'You have participated another project.'} wrap={true}>
          <TransactionButton
            disabled={true}
            disabledText={'Register'}
            className={'button ' + styles['register-button'] + ' ' + ('disabled')}
          >
            {
              // isUserRegister ? 'Participate' :
                'Register'}
          </TransactionButton>
        </AppPopover>
      } else if (!isUserRegister) {
        return <TransactionButton
          disabled={isRegistered}
          disabledText={'Participated'}
          noConnectText={'Connect wallet to register'}
          className={'button ' + styles['register-button'] + ' ' + (isRegistered ? 'disabled' : '')}
          onClick={showLoginModal}
          style={{ backgroundColor: isUserRegister ? '#D7FF1E' : '' }}
        >
          {'Register'}
        </TransactionButton>
      } else if (depositedAmount == 0) {
        return <TransactionButton
          noConnectText={'Connect wallet to stake'}
          className={'button ' + styles['register-button'] + ' ' + (isRegistered ? 'disabled' : '')}
          onClick={() => Router.push('/stake')}
        >
          Staking Now
        </TransactionButton>
      } else {
        return <TransactionButton
          disabled={isRegistered}
          disabledText={'Registered'}
          noConnectText={'Connect wallet to register'}
          className={'button ' + styles['register-button'] + ' ' + (isRegistered ? 'disabled' : '')}
          onClick={registerForSale}
          style={{ backgroundColor: isUserRegister ? '#D7FF1E' : '' }}
        >
          {
          // isUserRegister ? 'Participate' : 
          'Register'}
        </TransactionButton>
      }
    }
    // in sale
    if (statesReady && [3].includes(status) && isRegistered) {
      // if (isRegistered) {
      return <TransactionButton
        disabled={isParticipated}
        disabledText={'You have purchased'}
        noConnectText={'Connect wallet to purchase'}
        className={'button ' + styles['purchase-button'] + ' ' + (isParticipated ? 'disabled' : '')}
        onClick={() => setShowParticipateModal(true)}
      >
        Purchase
      </TransactionButton>
    }
    // sale end
    if (statesReady && isParticipated && [4].includes(status)) {
      return <AppPopover content={'Tokens not unlocked yet'}>
        <TransactionButton
          disabled={true}
          className={'button ' + styles['purchase-button']}
          noConnectText={'Connect wallet to withdraw'}
        >
          Withdraw
        </TransactionButton>
      </AppPopover>
    }
    if (statesReady && isParticipated && [5].includes(status)) {
      return <AppPopover
        wrap={true}
        content={withdrawTimeline()}
        placement={vestingPercentPerPortion.length >= 5 ? 'right' : 'top'}
      >
        <TransactionButton
          disabled={!canWithdrawArr.includes(true)}
          className={'button ' + styles['purchase-button']}
          noConnectText={'Connect wallet to withdraw'}
          onClick={withdrawTokens}
        >
          Withdraw
        </TransactionButton>
      </AppPopover>
    }
    if (statesReady && isRegistered && !isParticipated && [4, 5].includes(status)) {
      return <TransactionButton
        disabled={true}
        className={'button ' + styles['purchase-button']}
        noConnectText={'Connect wallet to withdraw'}
      >
        Sale ends
      </TransactionButton>
    }
  }

  function getReferralCode() {
    const f = new FormData;
    const params = {
      walletAddress,
      pid: pId,
    }
    for (let key in params) {
      f.append(key, params[key]);
    }
    return axios.post('/boba/referral/code', f)
      .then((res) => {
        setReferralCode(res.data);
        setReferralModalVisible(true);
      })
  }

  const referralLink = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href.replace(/aff=.*/, '') + `&aff=${referralCode}`;
    } else {
      return '';
    }
  }, [referralCode])

  const getReferralButton = () => {
    if (status == 1 && isRegistered) {
      return <TransactionButton
        className={'button ' + styles['register-button']}
        onClick={() => { getReferralCode() }}
      >
        Invite
      </TransactionButton>
    } else {
      return <></>
    }
  }
  const cardInfo = useMemo(() => {
    // FIXME: get paymentTokenDecimals from backend
    const paymentTokenDecimas = 6;
    let tokenPriceInUsd = projectInfo.tokenPriceInPT ? Number(projectInfo.tokenPriceInPT) / Math.pow(10, paymentTokenDecimas) : 0;
    return {
      ...projectInfo,
      tokenPriceInUsd: tokenPriceInUsd,
    }
  }, [projectInfo]);

  const participateModalData = useMemo(() => {
    return { ...cardInfo, allocationTop, paymentTokenDecimal: depositDecimals || 18, paymentTokenSymbol: depositSymbol };
  }, [cardInfo, allocationTop, depositDecimals, depositSymbol])

  const withdrawTimeline = () => {
    return <Timeline
      mode="left"
      style={{ color: '#ffffff', minWidth: '400px' }}
    >
      {
        vestingPortionsUnlockTime && vestingPercentPerPortion ?
          vestingPortionsUnlockTime.map((sec, index) => {
            // status: 0-not start yet, 1-can withdraw, 2-Withdrawn
            let status: number = (Date.now() + '') < (sec + '000') ? 0 : 1;
            isPortionWithdrawn && isPortionWithdrawn[index] && status === 1 && (status = 2);
            return <Timeline.Item key={index}
              color={status === 0 ? 'gray' : '#55BC7E'}
              label={formatDate(sec + '000', 'hh:mm:ss, Month DD, YYYY')}
            >
              {vestingPercentPerPortion[index] / 10}% &nbsp;
              {status === 0 ? <span>(Locked)</span> : <></>}
              {status === 1 ? <span>(Available now)</span> : <></>}
              {status === 2 ? <span style={{ color: '#55BC7E' }}>(Withdrawn)</span> : <></>}
            </Timeline.Item>
          })
          : <></>
      }
    </Timeline>
  };

  const trickers = useMemo(() => {
    let ret;
    try {
      ret = JSON.parse(projectInfo?.tricker)
    } catch (e) {
      // do nothing
    }
    return ret;
  }, [projectInfo])
  return (
    <main className={styles['container'] + " container"}
      style={trickers
        ? { backgroundImage: `url(${trickers?.background})`, backgroundSize: '100%', backgroundRepeat: 'repeat' }
        : {}
      }
    >
      {LoginModal}
      <InviteModal
        visible={referralModalVisible}
        onCancel={() => { setReferralModalVisible(false) }}
        url={referralLink}
        projectName={projectInfo.name}
      ></InviteModal>
      <PageLoader>
        <section className={styles['intro'] + ' main-content'}>
          <Row justify="space-between" align="middle" style={{ marginTop: '42px' }}>
            <Col span={24}>
              <h2 className={styles['pool-title']}>
                {projectInfo.name || ''}
              </h2>
            </Col>
          </Row>
          <Row style={{ marginTop: '42px' }}>
            <Col span={24}>
              <div className={styles['pool-desc']}>
                {projectInfo.description || ''}
              </div>
            </Col>
          </Row>
          {/* buttons */}
          <Row justify="start" align="middle" style={{ marginTop: '42px' }} gutter={[16, 16]}>
            <Col span={isDesktopOrLaptop ? 6 : 24}>
              <TransactionButton
                className={'button ' + styles['add-token-button']}
                onClick={() => { addToken(projectInfo.tokenAddress, projectInfo.symbol) }}
              >
                Add {projectInfo.symbol} to Wallet
              </TransactionButton>
            </Col>
            <Col span={isDesktopOrLaptop ? 6 : 24}>
              {getActionButton()}
            </Col>
            {/* <Col span={isDesktopOrLaptop ? 6 : 24}>
              {getReferralButton()}
            </Col> */}
            {/* <Col span={isDesktopOrLaptop ? 6 : 24}>
              <div className={styles['medias']}>
                <i className="icon"></i>
              </div>
            </Col> */}
          </Row>
          <Row style={{ marginTop: '55px' }}>
            <Col span={24}>
              <PoolCard
                className={styles['pool-info']}
                info={{ paymentTokenDecimals: depositDecimals, ...cardInfo, status }}
                styleNames={styles}
              >
              </PoolCard>
            </Col>
          </Row>
          <Row className={styles['progress']} gutter={[0, 16]}>
            {
              isDesktopOrLaptop
                ? <div className={styles['divider']}></div>
                : <></>
            }
            {
              [
                { stage: 'Registration Opens', time: mileStones.registrationTimeStarts },
                { stage: 'Registration Closes', time: mileStones.registrationTimeEnds },
                { stage: 'Sale Starts', time: mileStones.saleStart },
                { stage: 'Sale Ends', time: mileStones.saleEnd },
              ].map((info, index) => {
                return (
                  <Col span={isDesktopOrLaptop ? 6 : 24} className={styles['item'] + ' ' + (index < status ? styles['active'] : '')} key={index}>
                    <Row justify="center" align="middle" gutter={[0, 16]}>
                      <Col span={isDesktopOrLaptop ? 24 : 12}>
                        <i className={styles['icon'] + ' ' + styles['icon-pool-' + (index + 1)]}></i>
                      </Col>
                      <Col span={isDesktopOrLaptop ? 24 : 12}>
                        <div className={styles['label']}>
                          {info.stage}
                          <br />
                          {formatDate(info.time, 'HH:mm')},
                          <br />
                          {formatDate(info.time, 'Month DD, YYYY')}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                )
              })
            }
          </Row>

        </section>
        <section className={styles['detail']}>
          <div className={styles['tab-info']}>
            <div className={styles['menu']}>
              <Row className="main-content" justify="start" align="middle">
                {
                  [
                    ['Sale Info', 'sale_info'],
                    ['Token Info', 'token_info'],
                    [isDesktopOrLaptop ? 'About the Project' : 'About', 'about'],
                    [isDesktopOrLaptop ? 'Your Allocations' : 'Allocations', 'allocations'],
                  ].map(([title, key], index) => (
                    <Col span={isDesktopOrLaptop ? 3 : 6}
                      key={index}
                      className={styles['item'] + ' ' + (tab == key && styles['active'] || '')}
                      onClick={() => setTab(key)}
                    >
                      {title}
                    </Col>
                  ))
                }
              </Row>
            </div>
            <div className="main-content">
              <div className={styles['tabs']}>
                {getTabInfo()}
              </div>
            </div>
          </div>

          {/* <div className={styles['alerts']}>
            <b>C2N. People First.</b>
            <div className={styles['entry']}>
              <p>Get Alerts For New Pools</p>
              <div className={styles['button']}>
                Sign up
              </div>
            </div>
          </div> */}
        </section>
      </PageLoader>
      <ParticipateModal
        visible={showParticipateModal}
        data={participateModalData}
        handleOk={participate}
        handleCancel={() => setShowParticipateModal(false)}
        tokenPriceInPT={projectInfo.tokenPriceInPT}
      />
    </main>
  )
}