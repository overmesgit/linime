window.SET_VIEW_ACTION = 'SET_VIEW';
window.GET_GAME_REQUEST = 'GET_GAME_REQUEST';
window.GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
window.GET_GAME_ERROR = 'GET_GAME_ERROR';
window.CHAR_SELECTED = 'CHAR_SELECTED';
window.MOVE_SELECTED = 'MOVE_SELECTED';
window.MOVE_CHARACTER = 'MOVE_CHARACTER';

window.moveCharacter = function (char, row, col) {
    return {
        type: MOVE_CHARACTER,
        payload: {char, row, col}
    }
};

var moveCharacterPath = (dispatch, char) => {return (data) => {
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
            moveLock = false;
        }
    };
    callBack();
}};

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
            }).done(moveCharacterPath(dispatch, char)).fail((xhr) => {
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