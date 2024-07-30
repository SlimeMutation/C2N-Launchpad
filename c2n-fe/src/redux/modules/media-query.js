// const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 })
// const isBigScreen = useMediaQuery({ minWidth: 1824 })
// const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 })
// const isPortrait = useMediaQuery({ orientation: 'portrait' })
// const isRetina = useMediaQuery({ minResolution: '2dppx' })

const SET_MEDIA_QUERY = '/media-query/SET_MEDIA_QUERY'

const initialState = {
  isDesktopOrLaptop: false,
  isBigScreen: false,
  isTabletOrMobile: false,
  isPortrait: false,
  isRetina: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_MEDIA_QUERY:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state;
  }
}

export function setMediaQuery(data){
  return {
    type: SET_MEDIA_QUERY,
    payload: data,
  }
}

