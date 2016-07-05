window.SET_VIEW_ACTION = 'SET_VIEW';
window.CREATE_GAME_REQUEST = 'CREATE_GAME_REQUEST';
window.CREATE_GAME_SUCCESS = 'CREATE_GAME_SUCCESS';

window.setView = function (view) {
    return {
    type: SET_VIEW_ACTION,
    payload: view
  }
};

window.createGame = function () {
    return (dispatch) => {
        dispatch({
            type: CREATE_GAME_REQUEST
        });
        setTimeout(() => {
            dispatch({
                type: CREATE_GAME_SUCCESS,
                payload: 'new game data'
            })
        }, 1000)
    }
};