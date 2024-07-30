import { FC } from "react";

export enum ConnectorNames {
  Injected = "injected",
  WalletConnect = "walletconnect",
  BSC = "bsc",
  Blocto = "blocto",
}

export type Login = (connectorId: ConnectorNames) => void;

export interface Config {
  title: string;
  icon?: FC<any>;
  connectorId: ConnectorNames;
  priority: number;
}

import Metamask from "@src/components/Svg/Metamask";
import WalletConnect from "@src/components/Svg/WalletConnect";
import TrustWallet from "@src/components/Svg/TrustWallet";
import MathWallet from "@src/components/Svg/MathWallet";
import TokenPocket from "@src/components/Svg/TokenPocket";
import BinanceChain from "@src/components/Svg/BinanceChain";
import SafePal from "@src/components/Svg/SafePal";
import Coin98 from "@src/components/Svg/Coin98";
import Blocto from "@src/components/Svg/Blocto";

const connectors: Config[] = [
  {
    title: "Metamask",
    icon: Metamask,
    connectorId: ConnectorNames.Injected,
    priority: 1,
  },
  {
    title: "SafePal",
    icon: SafePal,
    connectorId: ConnectorNames.Injected,
    priority: 999,
  },
  {
    title: "WalletConnect",
    icon: WalletConnect,
    connectorId: ConnectorNames.WalletConnect,
    priority: 2,
  },
  {
    title: "Trust Wallet",
    icon: TrustWallet,
    connectorId: ConnectorNames.Injected,
    priority: 3,
  },
  {
    title: "MathWallet",
    icon: MathWallet,
    connectorId: ConnectorNames.Injected,
    priority: 999,
  },
  {
    title: "TokenPocket",
    icon: TokenPocket,
    connectorId: ConnectorNames.Injected,
    priority: 999,
  },
  {
    title: "Binance Chain",
    icon: BinanceChain,
    connectorId: ConnectorNames.BSC,
    priority: 999,
  },
  {
    title: "Coin98",
    icon: Coin98,
    connectorId: ConnectorNames.Injected,
    priority: 999,
  },
  {
    title: "Blocto",
    icon: Blocto,
    connectorId: ConnectorNames.Blocto,
    priority: 999,
  },
];

export default connectors;
export const connectorLocalStorageKey = "connectorIdv2";
export const walletLocalStorageKey = "wallet";
