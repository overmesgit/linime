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
            return {...state, view: action.payload};
        case GET_GAME_REQUEST:
            return {...state, view: LOADING_VIEW};
        case GET_GAME_SUCCESS:
            return {...state, game: action.payload, view: GAME_VIEW};
        case GET_GAME_ERROR:
            return {...state, message: action.payload, view: ERROR_VIEW};
        case CHAR_SELECTED:
            var newField = state.game.Field.map((char) => {
                if (char.selected) {
                    return {...char, selected: false}
                }
                if (char.Row == action.payload.Row && char.Col == action.payload.Col) {
                    return {...char, selected: true}
                }
                return char
            });
            return {...state, game: {...state.game, Field: newField}};
        case MOVE_CHARACTER:
            var newField = state.game.Field.map((char) => {
                if (char.Row == action.payload.char.Row && char.Col == action.payload.char.Col) {
                    return {
                        ...char, Row: action.payload.row, Col: action.payload.col,
                        prevRow: char.Row, prevCol: char.Col
                    }
                }
                return char
            });
            return {...state, game: {...state.game, Field: newField}};
        case FADE_CHARACTER:
            var newField = state.game.Field.map((char) => {
                if (char.Row == action.payload.row && char.Col == action.payload.col) {
                    return {...char, toDelete: true}
                }
                return char
            });
            return {...state, game: {...state.game, Field: newField}};
        case REMOVE_CHARACTER:
            var newField = [];
            state.game.Field.forEach((char) => {
                if (char.Row != action.payload.row || char.Col != action.payload.col) {
                    newField.push(char);
                }
            });
            return {...state, game: {...state.game, Field: newField}};
        default:
            return state;
    }
}

function thunkMiddleware({dispatch, getState}) {
    return next => action =>
        typeof action === 'function' ?
            action(dispatch, getState) :
            next(action);
}

window.Store = Redux.createStore(viewState, initialState, Redux.applyMiddleware(thunkMiddleware));
window.Provider = ReactRedux.Provider;