MAIN_VIEW = 'MAIN_VIEW';
GAME_VIEW = 'GAME_VIEW';
LOADING_VIEW = 'LOADING_VIEW';
ERROR_VIEW = 'ERROR_VIEW';

var urlHash = window.location.hash.substr(1);
var gameId = '';
if (urlHash.search('game') > -1) {
    gameId = urlHash.split('/')[1];
}

var myGames = [];
if(supports_html5_storage()) {
    if(localStorage.games) {
        myGames = localStorage.games.split(',').reverse()
    }
}

const initialState = {
    game: {Field: [], Score: {CompletedTitles: [], TotalScore: 0}, Turn: 0, AnimeDiff: 0, CharDiff: 0, UserName: ''},
    error: "",
    fetchingGame: gameId,
    myGames: myGames,
    createGameStatus: {hidden: true}
};

function viewState(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_CREATE_GAME_MENU:
            return {...state, createGameStatus: {...state.createGame, hidden: !state.createGameStatus.hidden}};
        case COMPLETE_GAME:
            return {...state, game: { ...state.game, Score: {...state.game.Score, TotalScore: 0}}};
        case GET_GAME_REQUEST:
            return {...state};
        case ADD_MY_GAME:
            state.myGames.unshift(action.payload);
            return {...state};
        case GET_GAME_SUCCESS:
            return {...state, game: action.payload, createGameStatus: {...state.createGame, hidden: true}};
        case ERROR:
            return {...state, error: action.payload};
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
        case ADD_CHARACTER:
            action.payload.turn = state.game.Turn;
            state.game.Field.push(action.payload);
            return {...state, game: {...state.game}};
        case CHANGE_GAME_TURN:
            return {...state, game: {...state.game, Turn: action.payload}};
        case UPDATE_GAME_SCORE:
            action.payload.push.apply(state.game.Score.CompletedTitles, action.payload);
            return {...state, game: {...state.game}};
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

Store = Redux.createStore(viewState, initialState, Redux.applyMiddleware(thunkMiddleware));
Provider = ReactRedux.Provider;