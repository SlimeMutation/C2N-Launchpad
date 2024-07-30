import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from "@src/redux/hooks";
import axios from '@src/api/axios'
import md5 from 'md5'
import qs from 'qs'
import {
  BigNumber,
  Contract,
} from 'ethers'
import {
  tokenAbi
} from '@src/config'

export const useBridge = () => {
  const signer = useAppSelector(state => state.contract.signer);
  const [ depositTokenAddress, setDepositTokenAddress ] = useState<string>('');

  type QuoteBridgeAmountResult = {
    "data": {
        "channel" : number,
        "deposit_min" : string,					//存入最小数量
        "deposit_max" : string,				//存入最大数量
        "deposit_amount" : string,				//存入数量，从请求取值
        "receive_amount" : string,				//实际到手为receive_amount-receive_fee
        "price" : string,						//忽略
        "tx_fee_type" : number, 					//忽略
        "tx_fee_rate" : string, 				//手续费扣除比例
        "receive_fee" : string, 					//gas费
        "deposit_scale" : number, 					//存入token支持的小数位
        "receive_scale" : number,					//接收token支持的小数位 
   }
  }

  async function quoteBridgeAmount({deposit_coin, receive_coin, quantity}): Promise<any> {
    return axios.post('https://s.isafepal.com/safewallet/bridge/v2/quote', {
        deposit_coin,
        receive_coin,
        quantity,
    })
  }

  type CreateBridgeOrderResult = {
    "data": {
        "channel" : number,
        "deposit_min" : string,					//存入最小数量
        "deposit_max" : string,				//存入最大数量
        "deposit_amount" : string,				//存入数量，从请求取值
        "receive_amount" : string,				//实际到手为receive_amount-receive_fee
        "price" : string,						//忽略
        "tx_fee_type" : number, 					//忽略
        "tx_fee_rate" : string, 				//手续费扣除比例
        "receive_fee" : string, 					//gas费
        "deposit_scale" : number, 					//存入token支持的小数位
        "receive_scale" : number,					//接收token支持的小数位 
   }
  }
  /**
   * Create safepal bridge order
   * @param  
   * @returns 
   */
  async function createBridgeOrder({
    account_id,
    deposit_coin,
    receive_coin,
    deposit_amount,
    receive_addr,
    receive_memo,
    refund_addr,
    refund_memo,
    client_order,
  }): Promise<any> {
    const timeStamp = Date.now();
    const params =  {
      hash: md5(account_id + timeStamp + 'bre2022.PL'),
      timeStamp: timeStamp
    };
    return axios.post(`/boba/order/create/${account_id}`, {
        account_id,
        deposit_coin,
        receive_coin,
        deposit_amount,
        receive_addr,
        receive_memo,
        refund_addr,
        refund_memo,
        client_order,
    }, {
      params: params,
    })
    .then((response:any)=>{
        return response;
    })
  }
  
  // async function createBridgeOrder({
  //   account_id,
  //   deposit_coin,
  //   receive_coin,
  //   deposit_amount,
  //   receive_addr,
  //   receive_memo,
  //   refund_addr,
  //   refund_memo,
  //   client_order,
  // }): Promise<any> {
  //   const timeStamp = Date.now();
  //   const signature = Cryptojs.HmacSHA256(
  //     `receive_addr=${receive_addr}&client_order=${client_order}&timestamp=${timeStamp}`, 
  //     process.env.NEXT_PUBLIC_SAFEPAL_API_SECRET
  //   ).toString();
  //   return axios.post('https://s.isafepal.com/safewallet/bridge/v2/create_order', {
  //       account_id,
  //       deposit_coin,
  //       receive_coin,
  //       deposit_amount,
  //       receive_addr,
  //       receive_memo,
  //       refund_addr,
  //       refund_memo,
  //       client_order,
  //   }, {
  //     params: {
  //       timestamp: timeStamp,
  //       signature: signature,
  //     },
  //     headers: {
  //       'Api-Key': process.env.NEXT_PUBLIC_SAFEPAL_API_KEY
  //     }
  //   })
  // }

  async function updateOrder({
    id,
    txid,
    receive_addr,
    client_order,
  }): Promise<any> {
    const timeStamp = Date.now();
    const data = {
      orderId: id,
      txId: txid,
      hash: md5(id+txid+'bre2022.PL')
    }
    return axios.post('/boba/order/update', qs.stringify(data))
  }

  async function getOrderList({
    accountId,
    pageIndex,
    pageSize,
  }): Promise<any> {
    const timeStamp = Date.now()
    const data =  {
      hash: md5(accountId + 'bre2022.PL'),
      accountId,
      pageIndex,
      pageSize,
    };
    const f = new FormData()
    for (let key in data) {
      f.append(key, data[key]);
    }
    return axios.post(`/boba/order/list`, f)
    .then((response:any)=>{
      return Promise.resolve(response.data);
    })
  }

  async function updateBalanceInfo() {
    return Promise.all([
    ])
  }

  const depositTokenContract = useMemo(()=>{
    if(signer && depositTokenAddress) {
      return new Contract(depositTokenAddress, tokenAbi, signer);
    } else {
      return null;
    }
  }, [signer, depositTokenAddress])

  return {
    signer,
    depositTokenContract,
    setDepositTokenAddress,

    updateBalanceInfo,
    quoteBridgeAmount,
    createBridgeOrder,
    updateOrder,

    getOrderList,
  }
}