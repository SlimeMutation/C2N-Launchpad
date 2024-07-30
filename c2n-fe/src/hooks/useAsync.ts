import { useCallback, useState } from 'react'

export const useAsync = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(()=>{
    setLoading(true);
    setData(null);
    setError(null);

    return asyncFunction()
      .then((response) => {
        // write data into state when succeeds
        setData(response);
        setLoading(false);
      })
      .catch((error) => {
        // write error into state when fails
        setError(error);
        setLoading(false);
      })
  }, [asyncFunction]);

  return { data, loading, error, execute }
}