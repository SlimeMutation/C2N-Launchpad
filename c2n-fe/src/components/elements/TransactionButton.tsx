import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import * as utils from "@src/util";
import * as walletAction from "@src/redux/modules/wallet";
import * as contractActions from "@src/redux/modules/contract";

import styles from "./TransactionButton.module.scss";
import { useWallet } from "@src/hooks/useWallet";
import { useLocalStorage } from "@src/hooks/useLocalStorage";
import { useCallback, useEffect } from "react";
import { Spin } from "antd";
import AppPopover from "./AppPopover";

type TransactionButtonProps = {
  noConnectText?: string;
  className?: string;
  transactionKey?: string;
  onClick?: Function;
  children?: any;
  disabled?: boolean;
  disabledText?: string;
  style?: any;
  loading?: boolean;
  loadingText?: string;
  requiredChainId?: number|string;
  switchNetworkText?: string;
};

/**
 * Button that connect wallet or show current account
 */
export default function TransactionButton(props: TransactionButtonProps) {
  props = props || ({} as TransactionButtonProps);

  const transactionKey = props.transactionKey || '';

  const dispatch = useAppDispatch();

  const {
    walletAddress,
    breContract,
    saleContract,
    loading: walletLoading,
    setLoading,
    showWallet,
    isConnected,
    switchNetwork,
    chain,
  } = useWallet();

  const {
    getLocal,
    setLocal
  } = useLocalStorage();

  const waitForTransaction = useCallback(
    () => {
      if (props.onClick) {
        setLoading(true);
        const ret = props.onClick();
        if (ret instanceof Promise) {
          ret
            .then(() => {
              setLoading(false);
            })
            .catch(error => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      }
    },
    [props.onClick]
  );

  if (props.loading || walletLoading) {
    return (
      <AppPopover content={'Your last transaction is pending or not confirmed.'}>
        <div
          style={props.style}
          className={[
            styles["transaction-button"],
            (props.disabled && styles["disabled"]),
            "loading",
            props.className || ""].join(' ')}
        >
          <Spin/> {props.loadingText || 'Connecting...'}
        </div>
      </AppPopover>
    );
  }

  // not connected
  if (!walletAddress) {
    return (
      <div
        style={props.style}
        className={[
          styles["transaction-button"],
          (props.disabled && styles["disabled"]),
          "no-connect",
          props.className || ""].join(' ')}
        onClick={()=>showWallet(true)}
      >
        {props.noConnectText || "Connect wallet"}
      </div>
    );
  }

  // invalid chain
  if(props.requiredChainId && chain?.chainId != props.requiredChainId) {
    return (
      <div
        style={props.style}
        className={[
          styles["transaction-button"],
          (props.disabled && styles["disabled"]),
          "no-connect",
          props.className || ""].join(' ')}
        onClick={()=>switchNetwork(props.requiredChainId as number)}
      >
        {props.switchNetworkText || "Switch Network"}
      </div>
    );
  }

  return (
    <div
      style={props.style}
      className={[
        styles["transaction-button"],
        (props.disabled && styles["disabled"]),
        props.className || ""
      ].join(" ")}
      onClick={()=>{!props.disabled && waitForTransaction()}}
    >
      {(props.disabled && props.disabledText) ||
        props.children ||
        "Connect wallet"}
    </div>
  );
}
