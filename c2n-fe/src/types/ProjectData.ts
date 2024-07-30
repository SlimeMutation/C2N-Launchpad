/**
 * Data type of projects
 */

export type ProjectData = {
  // 后台配置
  type: 0|1; // 0 正常项目 1 BRE项目
  id: string; // 产品id
  chainId: string; //
  img: string; // 产品logo
  name: string; // 产品名
  description: string; // 产品简单描述
  withdrawed: boolean; // 用户是否withdraw过
  saleContractAddress: any; // sale合约地址
  tokenAddress: string; // token合约地址
  follower: number; // ins或推特的follow数，先不管
  tge: number;
  projectWebsite: string; // 项目网页
  aboutHtml: string; // 项目介绍，html格式
  // 媒体连接
  medias: {
    instragram: string;
    twitter: string;
    medium: string;
  };

  // 通过计算获得
  status: any; // 状态 0-未开始 1-注册中 2-注册后未开始销售 3-销售中 4-销售后未开始提取 5-可提取
  totalRaised: number; //总共募集资金，=totalTokensSold * tokenPriceInETH * ETHPriceInDollar
  
  // 后台配置后从token的合约上拿:
  decimals: any; // 数位
  symbol: string; // token符号／名字缩写
  tokenName: string; // token名字

  // 后台配置后从sale的合约上拿：
  // registration()
  registrationTimeStarts: any; // 注册开始时间，单位秒
  registrationTimeEnds: any;  // 注册结束时间，单位秒
  numberOfRegistrants: number; // 注册人数
  // sale()
  saleStart: string; // sale开始时间，单位秒
  saleEnd: string;  // sale结束时间，单位秒
  unlockTime: number; // 可提取时间，单位秒
  maxParticipation: any; // 硬顶，单个用户最大可购买数
  tokenPriceInETH: string; // Token的ETH价格，单位wei
  tokenPriceInPT: string; // Token的PT价格，单位wei
  totalTokensSold: string|number; // 所有已卖的token个数，单位wei
  amountOfTokensToSell: string|number; // 所有要卖的token个数，单位wei
  amount: string; // 发行总数，同amountOfTokensToSell
  vestingPercentPerPortion: Array<number>, // 分批解锁千分比
  vestingPortionsUnlockTime: Array<number>, // 分批解锁时间戳，单位秒
  paymentToken:string;
  paymentTokenDecimals: number;
  vesting: string;
  idoTokenPrice: string; // 项目创建时的token价格
  roi: number;
  tricker:string;
  currentPrice: number;
}
