const keyMap = {
  'auto_connect_wallet': 'bobabrewery_'+process.env.NODE_ENV+'_0.1_'+'auto_connect_wallet',
}

const keyMapper = (key) => {
  return 'bobabrewery_'+process.env.NODE_ENV+'_0.1_'+key
}

export function useLocalStorage() {
  function getLocal(key) {
    return window.localStorage.getItem(keyMap[key]||keyMapper(key));
  }

  function setLocal(key, value) {
    return window.localStorage.setItem(keyMap[key]||keyMapper(key), value);
  }
  return {
    getLocal,
    setLocal,
  }
}