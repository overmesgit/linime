'use strict';

var GET_GAME_REQUEST = 'GET_GAME_REQUEST';
var GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
var ERROR = 'ERROR';
var CHAR_SELECTED = 'CHAR_SELECTED';
var MOVE_SELECTED = 'MOVE_SELECTED';
var MOVE_CHARACTER = 'MOVE_CHARACTER';
var REMOVE_CHARACTER = 'REMOVE_CHARACTER';
var FADE_CHARACTER = 'FADE_CHARACTER';
var ADD_CHARACTER = 'ADD_CHARACTER';
var CHANGE_GAME_TURN = 'CHANGE_GAME_TURN';
var UPDATE_GAME_SCORE = 'UPDATE_GAME_SCORE';
var COMPLETE_GAME = 'COMPLETE_GAME';
var ADD_MY_GAME = 'ADD_MY_GAME';
var TOGGLE_CREATE_GAME_MENU = 'TOGGLE_CREATE_GAME_MENU';
var CHANGE_ANIME_DIFFICULTY = 'CHANGE_ANIME_DIFFICULTY';
var CHANGE_CHAR_DIFFICULTY = 'CHANGE_CHAR_DIFFICULTY';
var CHANGE_CHAR_IMAGE = 'CHANGE_CHAR_IMAGE';
var CHAR_IMAGE_CHANGED = 'CHAR_IMAGE_CHANGED';
var GET_ADVICE = 'GET_ADVICE';

var getAdvice = function getAdvice(gameId) {
    return function (dispatch) {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=advice',
            contentType: 'application/json'
        }).done(function (data) {
            dispatch({
                type: GET_ADVICE,
                payload: data
            });
        }).fail(function (xhr) {
            dispatch({
                type: ERROR,
                payload: 'Get advice error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    };
};

var toggleCreateGame = function toggleCreateGame() {
    return {
        type: TOGGLE_CREATE_GAME_MENU
    };
};

var removeErrorAfter = function removeErrorAfter(timeOut, dispatch) {
    setTimeout(function () {
        dispatch({
            type: ERROR,
            payload: ''
        });
    }, timeOut);
};

var completeGame = function completeGame(gameId) {
    return function (dispatch) {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=complete',
            contentType: 'application/json'
        }).done(function (data) {
            dispatch({
                type: COMPLETE_GAME
            });
        }).fail(function (xhr) {
            dispatch({
                type: ERROR,
                payload: 'Complete game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    };
};

var moveCharacter = function moveCharacter(char, row, col) {
    return {
        type: MOVE_CHARACTER,
        payload: { char: char, row: row, col: col }
    };
};

var groupDispatchChar = function groupDispatchChar(dispatch, array, type) {
    for (var i = 0; i < array.length; i++) {
        dispatch({
            type: type,
            payload: { row: array[i][0], col: array[i][1] }
        });
    }
};

var removeAndAddNewChars = function removeAndAddNewChars(dispatch, data) {
    var Completed = data.Completed;
    var NewChars = data.NewChars;
    var NextTurn = data.NextTurn;
    var GameScore = data.GameScore;

    moveLock = false;
    var timeOutAdd = 0;
    if (Completed.length > 0) {
        timeOutAdd = 300;
    }
    //hot browser cache
    for (var j = 0; j < NewChars.length; j++) {
        var newImg = new Image();
        newImg.src = NewChars[j].Img;
    }
    setTimeout(function () {
        groupDispatchChar(dispatch, Completed, FADE_CHARACTER);
    }, 50);
    setTimeout(function () {
        groupDispatchChar(dispatch, Completed, REMOVE_CHARACTER);
        for (var j = 0; j < NewChars.length; j++) {
            dispatch({
                type: ADD_CHARACTER,
                payload: NewChars[j]
            });
        }
        // start new character animation
        setTimeout(function () {
            dispatch({
                type: CHANGE_GAME_TURN,
                payload: NextTurn
            });
            dispatch({
                type: UPDATE_GAME_SCORE,
                payload: GameScore
            });
        }, 50);
    }, timeOutAdd);
};

var moveCallbackFactory = function moveCallbackFactory(dispatch, char) {
    return function (data) {
        var path = data.Path;
        var callBack = function callBack() {
            var current = path.pop();
            var row = current[0];
            var col = current[1];
            dispatch({
                type: MOVE_CHARACTER,
                payload: { char: char, row: row, col: col }
            });
            if (path.length > 0) {
                char.Row = row;
                char.Col = col;
                setTimeout(callBack, 100);
            } else {
                removeAndAddNewChars(dispatch, data);
            }
        };
        callBack();
    };
};

var moveLock = false;
var moveSelected = function moveSelected(gameId, char, Row, Col) {
    return function (dispatch) {
        if (!moveLock) {
            moveLock = true;
            $.ajax({
                method: "PUT",
                url: '/game?gameId=' + gameId + '&action=move',
                data: JSON.stringify({ char: char, Row: Row, Col: Col }),
                contentType: 'application/json',
                dataType: 'json'
            }).done(moveCallbackFactory(dispatch, char)).fail(function (xhr) {
                dispatch({
                    type: ERROR,
                    payload: 'Make turn error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
                });
                removeErrorAfter(5000, dispatch);
                moveLock = false;
            });
        }
    };
};

var changeImage = function changeImage(gameId, char) {
    return function (dispatch) {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=changeImg',
            data: JSON.stringify({ char: char }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function (data) {
            dispatch({
                type: CHAR_IMAGE_CHANGED,
                payload: data
            });
        }).fail(function (xhr) {
            dispatch({
                type: ERROR,
                payload: 'Change image error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    };
};

var selectChar = function selectChar(char) {
    return {
        type: CHAR_SELECTED,
        payload: char
    };
};

var createGame = function createGame(diff, userName) {
    return function (dispatch) {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.post({
            'url': '/game',
            'data': JSON.stringify({ Diff: diff, UserName: userName }),
            contentType: 'application/json'
        }).done(function (data) {
            window.location.hash = '#game/' + data.Id;
            if (supports_html5_storage()) {
                if (!localStorage.games) {
                    localStorage.games = data.Id;
                } else {
                    localStorage.games = localStorage.games + ',' + data.Id;
                }
            }
            dispatch({
                type: ADD_MY_GAME,
                payload: data.Id
            });
            dispatch({
                type: GET_GAME_SUCCESS,
                payload: data
            });
        }).fail(function (xhr) {
            dispatch({
                type: ERROR,
                payload: 'Create new game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    };
};

var getGame = function getGame(gameId) {
    return function (dispatch) {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.get('/game?gameId=' + gameId, function (data) {
            window.location.hash = '#game/' + data.Id;
            dispatch({
                type: GET_GAME_SUCCESS,
                payload: data
            });
        }).fail(function (xhr) {
            dispatch({
                type: ERROR,
                payload: 'Get game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    };
};

//# sourceMappingURL=actions.js.map