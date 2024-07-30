

const initialState = {
  pageLoading: false,
};

const SET_PAGE_LOADING = 'global/set_page_loading';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PAGE_LOADING:
      return {
        ...state,
        pageLoading: action.payload,
      }
    default:
      return state;
  }
}

export function setLoading(data) {
  return {
    type: SET_PAGE_LOADING,
    payload: data,
  }
}
