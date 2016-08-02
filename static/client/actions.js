GET_GAME_REQUEST = 'GET_GAME_REQUEST';
GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
ERROR = 'ERROR';
CHAR_SELECTED = 'CHAR_SELECTED';
MOVE_SELECTED = 'MOVE_SELECTED';
MOVE_CHARACTER = 'MOVE_CHARACTER';
REMOVE_CHARACTER = 'REMOVE_CHARACTER';
FADE_CHARACTER = 'FADE_CHARACTER';
ADD_CHARACTER = 'ADD_CHARACTER';
CHANGE_GAME_TURN = 'CHANGE_GAME_TURN';
UPDATE_GAME_SCORE = 'UPDATE_GAME_SCORE';
COMPLETE_GAME = 'COMPLETE_GAME';
ADD_MY_GAME = 'ADD_MY_GAME';
TOGGLE_CREATE_GAME_MENU = 'TOGGLE_CREATE_GAME_MENU';
CHANGE_ANIME_DIFFICULTY = 'CHANGE_ANIME_DIFFICULTY';
CHANGE_CHAR_DIFFICULTY = 'CHANGE_CHAR_DIFFICULTY';
CHANGE_CHAR_IMAGE = 'CHANGE_CHAR_IMAGE';
CHAR_IMAGE_CHANGED = 'CHAR_IMAGE_CHANGED';
GET_ADVICE = 'GET_ADVICE';

var getAdvice = function (gameId) {
    return (dispatch) => {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=advice',
            contentType: 'application/json'
        }).done((data) => {
            dispatch({
                type: GET_ADVICE,
                payload: data
            });
        }).fail((xhr) => {
            dispatch({
                type: ERROR,
                payload: 'Get advice error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    }
};

var toggleCreateGame = function () {
    return {
        type: TOGGLE_CREATE_GAME_MENU
    }
};

var removeErrorAfter = function(timeOut, dispatch) {
    setTimeout(() => {
        dispatch({
                type: ERROR,
                payload: ''
            })
    }, timeOut);
};

var completeGame = function (gameId) {
    return (dispatch) => {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=complete',
            contentType: 'application/json'
        }).done((data) => {
            dispatch({
                type: COMPLETE_GAME
            });
        }).fail((xhr) => {
            dispatch({
                type: ERROR,
                payload: 'Complete game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    }
};

var moveCharacter = function (char, row, col) {
    return {
        type: MOVE_CHARACTER,
        payload: {char, row, col}
    }
};

var groupDispatchChar = (dispatch, array, type) => {
    for (var i = 0; i < array.length; i++) {
        dispatch({
            type: type,
            payload: {row: array[i][0], col: array[i][1]}
        });
    }
};

var removeAndAddNewChars = (dispatch, data) => {
    const {Completed, NewChars, CompletedNew, NextTurn, GameScore} = data;
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
    setTimeout(() => {
        groupDispatchChar(dispatch, Completed, FADE_CHARACTER);
    }, 50);
    setTimeout(() => {
        groupDispatchChar(dispatch, Completed, REMOVE_CHARACTER);
        for (var j = 0; j < NewChars.length; j++) {
            dispatch({
                type: ADD_CHARACTER,
                payload: NewChars[j]
            });
        }
        // start new character animation
        setTimeout(() => {
            dispatch({
                type: CHANGE_GAME_TURN,
                payload: NextTurn
            });
            dispatch({
                type: UPDATE_GAME_SCORE,
                payload: GameScore
            });
        }, 50);
        setTimeout(() => {
            groupDispatchChar(dispatch, CompletedNew, FADE_CHARACTER);
        }, 50);
        setTimeout(() => {
            groupDispatchChar(dispatch, CompletedNew, REMOVE_CHARACTER);
        }, 300);
    }, timeOutAdd);

};

var moveCallbackFactory = (dispatch, char) => {
    return (data) => {
        var path = data.Path;
        var callBack = () => {
            var current = path.pop();
            var row = current[0];
            var col = current[1];
            dispatch({
                type: MOVE_CHARACTER,
                payload: {char, row, col}
            });
            if (path.length > 0) {
                char.Row = row;
                char.Col = col;
                setTimeout(callBack, 100);
            } else {
                removeAndAddNewChars(dispatch, data)
            }
        };
        callBack();
    }
};

var moveLock = false;
moveSelected = function (gameId, char, Row, Col) {
    return (dispatch) => {
        if (!moveLock) {
            moveLock = true;
            $.ajax({
                method: "PUT",
                url: '/game?gameId=' + gameId + '&action=move',
                data: JSON.stringify({char, Row, Col}),
                contentType: 'application/json',
                dataType: 'json'
            }).done(moveCallbackFactory(dispatch, char)).fail((xhr) => {
                dispatch({
                    type: ERROR,
                    payload: 'Make turn error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
                });
                removeErrorAfter(5000, dispatch);
                moveLock = false;
            });
        }

    }
};

changeImage = function (gameId, char) {
    return (dispatch) => {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=changeImg',
            data: JSON.stringify({char}),
            contentType: 'application/json',
            dataType: 'json'
        }).done((data) => {
            dispatch({
                type: CHAR_IMAGE_CHANGED,
                payload: data
            });
        }).fail((xhr) => {
            dispatch({
                type: ERROR,
                payload: 'Change image error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    }
};

selectChar = function (char) {
    return {
        type: CHAR_SELECTED,
        payload: char
    }
};

createGame = function (charDiff, animeDiff, userName) {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.post({
            'url': '/game',
            'data': JSON.stringify({CharDiff: charDiff, AnimeDiff: animeDiff, UserName: userName}),
            contentType: 'application/json'
        })
            .done((data) => {
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
                })
            })
            .fail((xhr) => {
                dispatch({
                    type: ERROR,
                    payload: 'Create new game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
                });
                removeErrorAfter(5000, dispatch);
            });
    }
};

getGame = function (gameId) {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.get('/game?gameId=' + gameId, (data) => {
            window.location.hash = '#game/' + data.Id;
            dispatch({
                type: GET_GAME_SUCCESS,
                payload: data
            })
        }).fail((xhr) => {
            dispatch({
                type: ERROR,
                payload: 'Get game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
            });
            removeErrorAfter(5000, dispatch);
        });
    }
};