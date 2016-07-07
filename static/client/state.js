window.MAIN_VIEW = 'MAIN_VIEW';
window.GAME_VIEW = 'GAME_VIEW';
window.LOADING_VIEW = 'LOADING_VIEW';
window.ERROR_VIEW = 'ERROR_VIEW';

var urlHash = window.location.hash.substr(1);
var gameId = '';
var initialView = MAIN_VIEW;
if (urlHash.search('game') > -1) {
    gameId = urlHash.split('/')[1];
    initialView = LOADING_VIEW;
}

const initialState = {
    view: initialView,
    game: null,
    message: '',
    fetchingGame: gameId
};

function viewState(state = initialState, action) {
    switch (action.type) {
        case SET_VIEW_ACTION:
            return { ...state, view: action.payload};
        case GET_GAME_REQUEST:
            return { ...state, view: LOADING_VIEW};
        case GET_GAME_SUCCESS:
            return { ...state, game: action.payload, view: GAME_VIEW};
        case GET_GAME_ERROR:
            return { ...state, message: action.payload, view: ERROR_VIEW};
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