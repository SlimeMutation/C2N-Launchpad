import { message } from 'antd'
import { useEffect } from 'react';

export function useMessage() {
  useEffect(()=>{
    if(typeof window !== 'undefined') {
      window.message = message;
    }
  }, [])

  const setSuccessMessage = (content) => {
    message.success({
      content,
      duration: 1
    })
  }

  return {
    setSuccessMessage,
    setWarningMessage: message.warning,
    setErrorMessage: message.error,
  }
}