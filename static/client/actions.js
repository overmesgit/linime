window.SET_VIEW_ACTION = 'SET_VIEW';
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

var removeAndAddNewChars = (dispatch, completed, newChars, completedNew, nextTurn) => {
    moveLock = false;
    var timeOutAdd = 0;
    if (completed.length > 0) {
        timeOutAdd = 300;
    }
    //hot browser cache
    for (var j = 0; j < newChars.length; j++) {
            var newImg = new Image();
            newImg.src = newChars[j].Img;
        }
    setTimeout(() => {
        groupDispatchChar(dispatch, completed, FADE_CHARACTER);
    }, 50);
    setTimeout(() => {
        groupDispatchChar(dispatch, completed, REMOVE_CHARACTER);
        for (var j = 0; j < newChars.length; j++) {
            dispatch({
                type: ADD_CHARACTER,
                payload: newChars[j]
            });
        }
    }, timeOutAdd);
    setTimeout(() => {
        dispatch({
            type: CHANGE_GAME_TURN,
            payload: nextTurn
        });
        setTimeout(() => {
            groupDispatchChar(dispatch, completedNew, FADE_CHARACTER);
        }, 300);
        setTimeout(() => {
            groupDispatchChar(dispatch, completedNew, REMOVE_CHARACTER);
        }, 600);
    }, 300 + timeOutAdd)
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
                removeAndAddNewChars(dispatch, data.Completed, data.NewChars, data.CompletedNew, data.NextTurn)
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

window.setView = function (view) {
    return {
        type: SET_VIEW_ACTION,
        payload: view
    }
};

window.createGame = function () {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.post('/game', (data) => {
            window.location.hash = '#game/' + data.Id;
            dispatch({
                type: GET_GAME_SUCCESS,
                payload: data
            })
        }).fail((xhr) => {
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