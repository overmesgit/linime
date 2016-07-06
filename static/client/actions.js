window.SET_VIEW_ACTION = 'SET_VIEW';
window.GET_GAME_REQUEST = 'GET_GAME_REQUEST';
window.GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
window.GET_GAME_ERROR = 'GET_GAME_ERROR';

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
        }).fail(() => {
            dispatch({
                type: GET_GAME_ERROR,
                payload: data
            })
        });
    }
};

window.getGame = function (gameId) {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.get('/game?gameId='+gameId, (data) => {
            dispatch({
                type: GET_GAME_SUCCESS,
                payload: data
            })
        }).fail(() => {
            dispatch({
                type: GET_GAME_ERROR,
                payload: data
            })
        });
    }
};