var MAIN_VIEW = 'MAIN_VIEW';
var GAME_VIEW = 'GAME_VIEW';
var LOADING_VIEW = 'LOADING_VIEW';
var ERROR_VIEW = 'ERROR_VIEW';

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
    game: {Field: [], Turn: 0, Difficulty: 0, UserName: '', creating: false,
        Score: {CompletedTitles: [], TotalScore: 0, ChangeImgs: [], Advices: []}},
    error: "",
    fetchingGame: gameId,
    fetchingAdvice: false,
    myGames: myGames,
    createGameStatus: {hidden: true},
    tutorialState: null
};

function userState(state, action) {
    switch (action.type) {
        case COMPLETE_GAME:
            return {...state, game: { ...state.game, Score: {...state.game.Score, TotalScore: 0}}};
        case GET_ADVICE:
            var images = {};
            for (var img of action.payload.Img) {
                images[img] = true;
            }
            var newField = state.game.Field.map((char) => {
                if (char.Img in images) {
                    return {...char, advice: true, selected: false}
                } else {
                    return {...char, advice: false, selected: false}
                }
            });
            return {...state, game: {...state.game, Field: newField, Score: {...state.game.Score, Advices: [...state.game.Score.Advices, action.payload]}}};
        case CHAR_IMAGE_CHANGED:
            var changedImages = [];
            var newField = state.game.Field.map((char) => {
                if (char.Img == action.payload.OldImg) {
                    if (state.game.Score.ChangeImgs.filter(change => change.OldImg == char.Img).length == 0) {
                        changedImages = [...state.game.Score.ChangeImgs, action.payload];
                    } else {
                        changedImages = state.game.Score.ChangeImgs
                    }
                    return {...char, Img: action.payload.NewImg}
                }
                return char
            });
            return {...state, game: {...state.game, Field: newField, Score: {...state.game.Score, ChangeImgs: changedImages}}};
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
        default:
            return state;


    }
}

function viewState(state = initialState, action) {
    switch (action.type) {
        // Tutorial actions =====================
        case START_TUTORIAL:
            return {...state, tutorialState: 1};
        case END_TUTORIAL:
            return {...initialState};

        // Game actions =========================
        case TOGGLE_CREATE_GAME_MENU:
            return {...state, createGameStatus: {...state.createGame, hidden: !state.createGameStatus.hidden}};
        case GET_GAME_REQUEST:
            return {...state, game: {...state.game, creating: true}};
        case ADD_MY_GAME:
            state.myGames.unshift(action.payload);
            return {...state};
        case GET_GAME_SUCCESS:
            action.payload.creating = false;
            return {...state, game: action.payload, createGameStatus: {...state.createGame, hidden: true}};
        case GET_GAME_ERROR:
            return {...state, game: {...state.game, creating: false}};
        case ERROR:
            return {...state, error: action.payload};
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
            // User actions =====================
            return userState(state, action);
    }
}

function thunkMiddleware({dispatch, getState}) {
    return next => action =>
        typeof action === 'function' ?
            action(dispatch, getState) :
            next(action);
}

var Store = Redux.createStore(viewState, initialState, Redux.applyMiddleware(thunkMiddleware));
var Provider = ReactRedux.Provider;