import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from "@src/redux/hooks";
import {
  BigNumber,
  Contract,
  ethers,
  providers,
} from 'ethers'
import abiJSON from '@src/util/abis.json'

import { parseEther } from "@src/util/index";

import {
  STAKING_POOL_ID,
  APPROVE_STAKING_AMOUNT_ETHER,
  tokenAbi,
  stakingPoolAddresses,
  tokenInfos
} from '@src/config'
import { parseUnits } from 'ethers/lib/utils';


export const useStake = () => {
  const contract = useAppSelector(state => state.contract);

  const chain = useAppSelector(state => state.wallet.chain);
  const walletAddress = useAppSelector(state => state.contract.walletAddress);
  const signer = useAppSelector(state => state.contract.signer);

  const [earnedBre, setEarnedBre] = useState(null);
  const [balance, setBalance] = useState(null);
  const [depositSymbol, setDepositSymbol] = useState();
  const [depositDecimals, setDepositDecimals] = useState(18);
  const [earnedSymbol, setEarnedSymbol] = useState();
  const [depositedAmount, setDepositedAmount] = useState(null);
  const [allowance, setAllowance] = useState();
  const [totalPending, setTotalPending] = useState();
  const [depositTokenAddress, setDepositTokenAddress] = useState<string>('');
  const [earnedTokenAddress, setEarnedTokenAddress] = useState<string>('');
  const [stakingAddress, setStakingAddress] = useState<string>('');
  const [allowanceAddress, setAllowanceAddress] = useState<string>('');
  const [poolId, setPoolId] = useState<number>(STAKING_POOL_ID);

  const stakingContract: Contract = useMemo(() => {
    if (stakingAddress && signer) {
      const stakingContract = new Contract(stakingAddress, abiJSON['hardhat']['AllocationStaking'], signer);
      return stakingContract;
    } else {
      return null;
    }
  }, [stakingAddress, signer, chain])

  const viewStakingContract: Contract = useMemo(() => {
    if (stakingAddress && chain) {
      const viewProvider = new providers.JsonRpcProvider(chain.rpc[0]);
      const viewStakingContract = new Contract(stakingAddress, abiJSON['hardhat']['AllocationStaking'], viewProvider);
      return viewStakingContract;
    } else {
      return null;
    }
  }, [stakingAddress, chain]);

  const getAirDropToken = (chain) => {
    const chainId = chain.chainId

    const token = tokenInfos.find(item => item.chainId == chainId) || tokenInfos[0];
    return token.address;
  }

  const depositTokenContract: Contract = useMemo(() => {
    if (!depositTokenAddress || !signer) {
      return null;
    }
    const t = getAirDropToken(chain)
    const depositTokenContract = new Contract(t, tokenAbi, signer);
    return depositTokenContract;
  }, [depositTokenAddress, signer, chain]);

  const earnedTokenContract: Contract = useMemo(() => {
    if (!earnedTokenAddress || !signer) {
      return null;
    }
    const earnedTokenContract = new Contract(earnedTokenAddress, tokenAbi, signer);
    return earnedTokenContract;
  }, [earnedTokenAddress, signer]);

  useEffect(() => {
    depositTokenContract && allowanceAddress && getAllowance(walletAddress, allowanceAddress);
  }, [depositTokenContract, allowanceAddress])

  useEffect(() => {
    stakingContract && getDeposited(poolId, walletAddress);
  }, [poolId, stakingContract, walletAddress]);

  useEffect(() => {
    if (!depositTokenContract || !walletAddress) {
    } else {
      depositTokenContract.balanceOf(walletAddress).then(setBalance).catch((e) => { console.error(e) });
      depositTokenContract.decimals().then(setDepositDecimals).catch((e) => { console.error(e) });
      depositTokenContract.symbol().then(setDepositSymbol).catch((e) => { console.error(e) });
    }
  }, [depositTokenContract, walletAddress]);

  async function getBalance(account) {
    const cb = () => {
      if (!depositTokenContract || !account) {
      } else {
        try {
          depositTokenContract.balanceOf(account).then(setBalance).catch((e) => { console.error(e) });
          depositTokenContract.decimals().then(setDepositDecimals).catch((e) => { console.error(e) });
          depositTokenContract.symbol().then(setDepositSymbol).catch((e) => { console.error(e) });
        } catch (e) {
        }
      }

      if (!earnedTokenContract || !account) {
      } else {
        try {
          earnedTokenContract.symbol().then(setEarnedSymbol).catch((e) => { console.error(e) });
        } catch (e) {
        }
      }

      if (!stakingContract || !account) {
      } else {
        try {
          stakingContract.pending(poolId, account).then(setEarnedBre).catch((e) => { console.error(e) });
          stakingContract.totalPending().then(setTotalPending).catch((e) => { console.error(e) });
        } catch (e) {
        }
      }
    }
    cb();
  }

  function getDeposited(pid, address) {
    if (!stakingContract || !address) {
      return;
    }
    const options = { nonce: 45, value: 0 };
    const n = BigNumber.from(pid);
    return (
      (stakingContract.deposited &&
        stakingContract
          .deposited(n, address || walletAddress, options)
          .then(value => {
            setDepositedAmount(value);
          }).catch(e => {
            console.error(e)
          })) ||
      Promise.reject()
    );
  }

  async function approve(contractAddress, amount, decimals = 18) {
    if (!depositTokenContract) {
      return Promise.reject();
    }
    try {
      const res = await depositTokenContract.allowance(walletAddress, contractAddress)
      console.log(res, 're')
    } catch (error) {
      console.log(error, 'eeeeeeeeeeee')
    }

    let biggerAmountEther;
    const number_1E18 = '1000000000000000000';
    biggerAmountEther = amount > APPROVE_STAKING_AMOUNT_ETHER ? amount : APPROVE_STAKING_AMOUNT_ETHER;
    // if (allowance && parseEther(amount).lte(allowance)) {
    //   return Promise.resolve();
    // }
    // decide approve amount
    const approveAmount = biggerAmountEther;
    console.log({ depositTokenAddress, contractAddress, amount: ethers.utils.parseUnits(approveAmount + '', decimals) }, 222, depositTokenContract)
    return (
      (depositTokenContract.approve &&
        depositTokenContract.approve(contractAddress, parseUnits('10000', 18)))
        .then(transaction => {
          return transaction.wait();
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => {
          getAllowance(walletAddress, allowanceAddress);
        })
      ||
      Promise.reject()
    );
  }

  function deposit(pid, amount) {
    if (!stakingContract) {
      return Promise.reject();
    }
    if (!stakingContract.deposit) {
      return Promise.reject();
    }
    amount = parseEther(amount);
    return stakingContract.deposit(pid, amount).catch((e) => {
      throw e;
    });
  }

  function withdraw(pid, amount) {
    if (!stakingContract) {
      return Promise.reject();
    }
    amount = parseEther(amount);
    return (
      (stakingContract.withdraw &&
        stakingContract.withdraw(pid, amount)) ||
      Promise.reject()
    );
  }
  async function getAllowance(owner, spender) {
    if (!depositTokenContract || !owner || !spender) {
      return Promise.reject();
    }
    try {
      const num =
        depositTokenContract.allowance &&
        (await depositTokenContract.allowance(owner, spender));
      setAllowance(num);
    } catch (e) {
      console.error(e)
    }
  }

  async function poolInfo(pid) {
    if (!stakingContract) {
      return Promise.reject();
    }
    const ret =
      stakingContract.userInfo &&
      (await stakingContract.poolInfo(pid));
  }

  async function updateBalanceInfo() {
    return Promise.all([
      getBalance(walletAddress),
      getDeposited(poolId, walletAddress),
      getAllowance(walletAddress, allowanceAddress),
    ])
  }

  const globalPoolStakingAddress = useMemo(() => {
    if (chain) {
      const targetItem = stakingPoolAddresses.find((item) => item.chainId == chain.chainId);
      return targetItem?.stakingAddress || ''
    } else {
      return '';
    }
  }, [chain]);

  const globalPoolDepositTokenAddress = useMemo(() => {
    if (chain) {
      const targetItem = stakingPoolAddresses.find((item) => item.chainId == chain.chainId);
      return targetItem?.depositTokenAddress || ''
    } else {
      return '';
    }
  }, [chain]);

  const globalPoolEarnedTokenAddress = useMemo(() => {
    if (chain) {
      const targetItem = stakingPoolAddresses.find((item) => item.chainId == chain.chainId);
      return targetItem?.earnedTokenAddress || ''
    } else {
      return '';
    }
  }, [chain]);

  return {
    depositedAmount,
    earnedBre,
    balance,
    depositSymbol,
    depositDecimals,
    earnedSymbol,
    totalPending,

    getBalance,
    approve,
    deposit,
    withdraw,
    poolInfo,
    updateBalanceInfo,
    allowance,

    stakingContract,
    viewStakingContract,
    depositTokenContract,

    setDepositTokenAddress,
    setEarnedTokenAddress,
    setStakingAddress,
    setAllowanceAddress,
    setPoolId,
    globalPoolStakingAddress,
    globalPoolDepositTokenAddress,
    globalPoolEarnedTokenAddress,
  }
}
