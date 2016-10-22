'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
if (supports_html5_storage()) {
    if (localStorage.games) {
        myGames = localStorage.games.split(',').reverse();
    }
}

var initialState = {
    game: { Field: [], Turn: 0, Difficulty: 0, UserName: '', creating: false,
        Score: { CompletedTitles: [], TotalScore: 0, ChangeImgs: [], Advices: [] } },
    error: "",
    fetchingGame: gameId,
    fetchingAdvice: false,
    myGames: myGames,
    createGameStatus: { hidden: true },
    tutorialState: null
};

function userState(state, action) {
    switch (action.type) {
        case COMPLETE_GAME:
            return _extends({}, state, { game: _extends({}, state.game, { Score: _extends({}, state.game.Score, { TotalScore: 0 }) }) });
        case GET_ADVICE:
            var images = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = action.payload.Img[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var img = _step.value;

                    images[img] = true;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var newField = state.game.Field.map(function (char) {
                if (char.Img in images) {
                    return _extends({}, char, { advice: true, selected: false });
                } else {
                    return _extends({}, char, { advice: false, selected: false });
                }
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField, Score: _extends({}, state.game.Score, { Advices: [].concat(_toConsumableArray(state.game.Score.Advices), [action.payload]) }) }) });
        case CHAR_IMAGE_CHANGED:
            var changedImages = [];
            var newField = state.game.Field.map(function (char) {
                if (char.Img == action.payload.OldImg) {
                    if (state.game.Score.ChangeImgs.filter(function (change) {
                        return change.OldImg == char.Img;
                    }).length == 0) {
                        changedImages = [].concat(_toConsumableArray(state.game.Score.ChangeImgs), [action.payload]);
                    } else {
                        changedImages = state.game.Score.ChangeImgs;
                    }
                    return _extends({}, char, { Img: action.payload.NewImg });
                }
                return char;
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField, Score: _extends({}, state.game.Score, { ChangeImgs: changedImages }) }) });
        case CHAR_SELECTED:
            var newField = state.game.Field.map(function (char) {
                if (char.selected) {
                    return _extends({}, char, { selected: false });
                }
                if (char.Row == action.payload.Row && char.Col == action.payload.Col) {
                    return _extends({}, char, { selected: true });
                }
                return char;
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField }) });
        case MOVE_CHARACTER:
            var newField = state.game.Field.map(function (char) {
                if (char.Row == action.payload.char.Row && char.Col == action.payload.char.Col) {
                    return _extends({}, char, { Row: action.payload.row, Col: action.payload.col,
                        prevRow: char.Row, prevCol: char.Col
                    });
                }
                return char;
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField }) });
        default:
            return state;

    }
}

function viewState() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    switch (action.type) {
        // Tutorial actions =====================
        case START_TUTORIAL:
            return _extends({}, state, { tutorialState: 1 });
        case END_TUTORIAL:
            return _extends({}, initialState);

        // Game actions =========================
        case TOGGLE_CREATE_GAME_MENU:
            return _extends({}, state, { createGameStatus: _extends({}, state.createGame, { hidden: !state.createGameStatus.hidden }) });
        case GET_GAME_REQUEST:
            return _extends({}, state, { game: _extends({}, state.game, { creating: true }) });
        case ADD_MY_GAME:
            state.myGames.unshift(action.payload);
            return _extends({}, state);
        case GET_GAME_SUCCESS:
            action.payload.creating = false;
            return _extends({}, state, { game: action.payload, createGameStatus: _extends({}, state.createGame, { hidden: true }) });
        case GET_GAME_ERROR:
            return _extends({}, state, { game: _extends({}, state.game, { creating: false }) });
        case ERROR:
            return _extends({}, state, { error: action.payload });
        case FADE_CHARACTER:
            var newField = state.game.Field.map(function (char) {
                if (char.Row == action.payload.row && char.Col == action.payload.col) {
                    return _extends({}, char, { toDelete: true });
                }
                return char;
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField }) });
        case REMOVE_CHARACTER:
            var newField = [];
            state.game.Field.forEach(function (char) {
                if (char.Row != action.payload.row || char.Col != action.payload.col) {
                    newField.push(char);
                }
            });
            return _extends({}, state, { game: _extends({}, state.game, { Field: newField }) });
        case ADD_CHARACTER:
            action.payload.turn = state.game.Turn;
            state.game.Field.push(action.payload);
            return _extends({}, state, { game: _extends({}, state.game) });
        case CHANGE_GAME_TURN:
            return _extends({}, state, { game: _extends({}, state.game, { Turn: action.payload }) });
        case UPDATE_GAME_SCORE:
            action.payload.push.apply(state.game.Score.CompletedTitles, action.payload);
            return _extends({}, state, { game: _extends({}, state.game) });
        default:
            // User actions =====================
            return userState(state, action);
    }
}

function thunkMiddleware(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    return function (next) {
        return function (action) {
            return typeof action === 'function' ? action(dispatch, getState) : next(action);
        };
    };
}

var Store = Redux.createStore(viewState, initialState, Redux.applyMiddleware(thunkMiddleware));
var Provider = ReactRedux.Provider;

//# sourceMappingURL=state.js.map