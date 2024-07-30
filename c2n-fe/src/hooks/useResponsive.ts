import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { setMediaQuery } from "@src/redux/modules/media-query";
import { useEffect } from 'react'

export const useResponsiveInit = () => {
  const dispatch = useAppDispatch();

  function _setMediaQuery() {
    if (window.innerWidth > 769) {
      dispatch(setMediaQuery({
        isDesktopOrLaptop: true,
        isBigScreen: false,
        isTabletOrMobile: false,
      }))
    }
    if (window.innerWidth <= 768) {
      dispatch(setMediaQuery({
        isDesktopOrLaptop: false,
        isBigScreen: false,
        isTabletOrMobile: true,
      }))
    }
  }
  useEffect(() => {
    _setMediaQuery();
    window.addEventListener('resize', _setMediaQuery)
  }, []);
}

export const useResponsive = () => {
  const isDesktopOrLaptop = useAppSelector(state => state && state.mediaQuery.isDesktopOrLaptop)
  const isBigScreen = useAppSelector(state => state && state.mediaQuery.isBigScreen)
  const isTabletOrMobile = useAppSelector(state => state && state.mediaQuery.isTabletOrMobile)

  return {
    isDesktopOrLaptop,
    isBigScreen,
    isTabletOrMobile,
  }
}