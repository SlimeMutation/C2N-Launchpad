const errorMessageMaps = {
  'Last sale you registered for is not finished yet.' : 'Last sale you registered for is not finished yet.',
  'withdraw: can\'t withdraw more than deposit': 'withdraw: can\'t withdraw more than deposit',
  'Registration gate is closed.': 'Registration not start yet, please try again later.',
  'ERC20: transfer amount exceeds allowance': 'Approve amount should be greater than staking amount!',
}

export function useErrorHandler() {
  const getErrorMessage = (err) => {
    if(err && err.code==-32603) {
      let str = err && err.data && err.data.message && err.data.message.replace(/execution reverted: /, '') || ''
      return errorMessageMaps[str]||str
    }
    if(err && (typeof err ==='object')) {
      let str = err?.data?.message || err?.message || '';
      return errorMessageMaps[str]||str
    }
    if(typeof err === 'string') {
      const matches = /("message"):(".*")/g.exec(err);
      let message = matches && matches[2];
      let str = message && message.replace(/execution reverted: /, '') || ''
      return errorMessageMaps[str]||str
    }
  }

  const handleTransactionError = () => {
    
  }

  return {
    getErrorMessage
  }
}