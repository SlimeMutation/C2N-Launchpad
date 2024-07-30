import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { setLoading } from '@src/redux/modules/global';
import PageLoader from '@src/containers/PageLoader/PageLoader'

export const usePageLoading = () => {
  const dispatch = useAppDispatch();
  const pageLoading = useAppSelector(state => state.global.pageLoading);
  
  function setPageLoading(val:boolean) {
    dispatch(setLoading(val));
  }

  function waitForAllToLoad(data:Array<any>) {
    function isNotEmpty(value) {
      if(typeof value === 'undefined') {
        return false;
      }
      if(typeof value === 'object' && '{}' === JSON.stringify(value)) {
        return false;
      }
      return;
    }
    if(data.every(isNotEmpty)) {
      setPageLoading(false);
    }
  }
  
  return {
    pageLoading,
    PageLoader,
    setPageLoading,
    waitForAllToLoad,
  }
}