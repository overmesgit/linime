window.GET_GAME_REQUEST = 'GET_GAME_REQUEST';
window.GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
window.GET_GAME_ERROR = 'GET_GAME_ERROR';
window.CHAR_SELECTED = 'CHAR_SELECTED';
window.MOVE_SELECTED = 'MOVE_SELECTED';
window.MOVE_CHARACTER = 'MOVE_CHARACTER';
window.REMOVE_CHARACTER = 'REMOVE_CHARACTER';
window.FADE_CHARACTER = 'FADE_CHARACTER';
window.ADD_CHARACTER = 'ADD_CHARACTER';
window.CHANGE_GAME_TURN = 'CHANGE_GAME_TURN';
window.UPDATE_GAME_SCORE = 'UPDATE_GAME_SCORE';
window.COMPLETE_GAME = 'COMPLETE_GAME';
window.ADD_MY_GAME = 'ADD_MY_GAME';
window.TOGGLE_CREATE_GAME_MENU = 'TOGGLE_CREATE_GAME_MENU';
window.CHANGE_ANIME_DIFFICULTY = 'CHANGE_ANIME_DIFFICULTY';
window.CHANGE_CHAR_DIFFICULTY = 'CHANGE_CHAR_DIFFICULTY';

window.toggleCreateGame = function () {
    return {
        type: TOGGLE_CREATE_GAME_MENU
    }
};

window.completeGame = function (gameId) {
    return (dispatch) => {
        $.ajax({
            method: "PUT",
            url: '/game?gameId=' + gameId + '&action=complete',
            contentType: 'application/json'
        }).done((data) => {
            console.log('Game completed');
            dispatch({
                type: COMPLETE_GAME
            });
        }).fail((xhr) => {
            console.log('Error move char ' + xhr.responseText);
        });
    }
};

window.moveCharacter = function (char, row, col) {
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
window.moveSelected = function (gameId, char, Row, Col) {
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
                console.log('Error move char ' + xhr.responseText);
                moveLock = false;
            });
        }

    }
};

window.selectChar = function (char) {
    return {
        type: CHAR_SELECTED,
        payload: char
    }
};

window.createGame = function (charDiff, animeDiff, userName) {
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
                    type: GET_GAME_ERROR,
                    payload: 'Error create new game ' + xhr.responseText
                })
            });
    }
};

window.getGame = function (gameId) {
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
                type: GET_GAME_ERROR,
                payload: xhr.responseJSON ? xhr.responseJSON['Message'] : ''
            })
        });
    }
};