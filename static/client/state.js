window.MAIN_VIEW = 'MAIN_VIEW';
window.GAME_VIEW = 'GAME_VIEW';

const initialState = {
    view: MAIN_VIEW
};

function viewState(state = initialState, action) {
    switch (action.type) {
        case SET_VIEW_ACTION:
            return { ...state, view: action.payload};
        case CREATE_GAME_REQUEST:
            return { ...state, fetching: true};
        case CREATE_GAME_SUCCESS:
            return { ...state, game: action.payload, fetching: false, view: GAME_VIEW};
        default:
            return state;
    }
}

function thunkMiddleware({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

window.Store = Redux.createStore(viewState, initialState, Redux.applyMiddleware(thunkMiddleware));
window.Provider = ReactRedux.Provider;