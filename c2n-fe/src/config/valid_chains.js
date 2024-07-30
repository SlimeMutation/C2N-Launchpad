import { IconBobaNetwork, IconBNB, IconEth,IconAppLogo, } from "@src/components/icons";

export const VALID_CHAINS = [
  {
    name: "Sepolia",
    chainId: 11155111,
    logo: IconEth,
    shortName: "sepolia",
    networkId: 11155111,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpc: ["https://rpc.sepolia.org"],
    faucets: [],
    infoURL: "https://www.sepolia.io",
  },
  {
    name: "Localhost",
    chainId: 31337,
    logo: IconAppLogo,
    shortName: "localhost",
    networkId: 31337,
    nativeCurrency: {
      name: "GO",
      symbol: "GO",
      decimals: 18,
    },
    rpc: ["http://localhost:8545"],
    faucets: [],
    infoURL: "http://localhost:8545",
  },
  {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    logo: IconEth,
    shortName: "arb-sepolia",
    networkId: 421614,
    nativeCurrency: {
      name: "Arbitrum Rinkeby Ether",
      symbol: "ARETH",
      decimals: 18
    },
    rpc: [
      "https://arbitrum-sepolia.blockpi.network/v1/rpc/public"
    ],
    faucets: [],
    infoURL: "https://sepolia-explorer.arbitrum.io"
  },
  
  // {
  //   name: "Boba Network",
  //   logo: IconBobaNetwork,
  //   chainId: 288,
  //   shortName: "Boba",
  //   networkId: 288,
  //   nativeCurrency: {
  //     name: "Ether",
  //     symbol: "ETH",
  //     decimals: 18,
  //   },
  //   rpc: ["https://mainnet.boba.network/"],
  //   faucets: [],
  //   infoURL: "https://boba.network",
  // },
  //   {
  //      "name":"Boba Network Rinkeby Testnet",
  //    //   "name":"Boba Network",
  //      "logo": IconBobaNetwork,
  //      "chainId":28,
  //      "shortName":"Boba Rinkeby",
  //      "networkId":28,
  //      "nativeCurrency":{
  //         "name":"Ether",
  //         "symbol":"ETH",
  //         "decimals":18
  //      },
  //      "rpc":[
  //         "https://rinkeby.boba.network/"
  //      ],
  //      "faucets":[

  //      ],
  //      "infoURL":"https://boba.network"
  //   },
  // {
  //   name: "Binance Smart Chain",
  //   chainId: 56,
  //   shortName: "bnb",
  //   networkId: 56,
  //   nativeCurrency: {
  //     name: "Binance Chain Native Token",
  //     symbol: "BNB",
  //     decimals: 18,
  //   },
  //   rpc: [
  //     "https://bsc-dataseed1.binance.org",
  //     "https://bsc-dataseed2.binance.org",
  //     "https://bsc-dataseed3.binance.org",
  //     "https://bsc-dataseed4.binance.org",
  //     "https://bsc-dataseed1.defibit.io",
  //     "https://bsc-dataseed2.defibit.io",
  //     "https://bsc-dataseed3.defibit.io",
  //     "https://bsc-dataseed4.defibit.io",
  //     "https://bsc-dataseed1.ninicoin.io",
  //     "https://bsc-dataseed2.ninicoin.io",
  //     "https://bsc-dataseed3.ninicoin.io",
  //     "https://bsc-dataseed4.ninicoin.io",
  //     "wss://bsc-ws-node.nariox.org",
  //   ],
  //   faucets: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
  //   infoURL: "https://www.binance.org",
  // },
  //   {
  //      "name":"Binance Smart Chain Testnet",
  //    //   "name":"Binance Smart Chain",
  //      "logo": IconBNB,
  //      "chainId":97,
  //      "shortName":"bnbt",
  //      "networkId":97,
  //      "nativeCurrency":{
  //         "name":"Binance Chain Native Token",
  //         "symbol":"tBNB",
  //         "decimals":18
  //      },
  //      "rpc":[
  //         "https://data-seed-prebsc-1-s1.binance.org:8545",
  //         "https://data-seed-prebsc-2-s1.binance.org:8545",
  //         "https://data-seed-prebsc-1-s2.binance.org:8545",
  //         "https://data-seed-prebsc-2-s2.binance.org:8545",
  //         "https://data-seed-prebsc-1-s3.binance.org:8545",
  //         "https://data-seed-prebsc-2-s3.binance.org:8545"
  //      ],
  //      "faucets":[
  //         "https://testnet.binance.org/faucet-smart"
  //      ],
  //      "infoURL":"https://testnet.binance.org/"
  //   }
];
