import chains from '@src/util/chain_id'

const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export const getNodes = (chainId?: number) => {
  chainId = chainId === undefined ? DEFAULT_CHAIN_ID : chainId;
  const targetChain = chains.find(v => v.chainId == chainId);
  const nodes = targetChain.rpc;
  return nodes;
}

const getNodeUrl = (chainId?) => {
  chainId = chainId === undefined ? DEFAULT_CHAIN_ID : chainId;
  // Use custom node if available (both for development and production)
  // However on the testnet it wouldn't work, so if on testnet - comment out the NEXT_PUBLIC_NODE_PRODUCTION from env file
  // if (process.env.NEXT_PUBLIC_NODE_PRODUCTION) {
  //   return process.env.NEXT_PUBLIC_NODE_PRODUCTION
  // }
  const nodes = getNodes(chainId);
  return nodes[Math.floor(Math.random() * nodes.length)]
}

export const getChain = (chainId?) => {
  chainId = chainId === undefined ? DEFAULT_CHAIN_ID : chainId;
  const targetChain = chains.find(v => v.chainId == chainId);
  return targetChain;
}

export default getNodeUrl
