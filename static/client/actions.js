var GET_GAME_REQUEST = 'GET_GAME_REQUEST';
var GET_GAME_SUCCESS = 'GET_GAME_SUCCESS';
var GET_GAME_ERROR = 'GET_GAME_ERROR';
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
var START_TUTORIAL = 'START_TUTORIAL';
var END_TUTORIAL = 'END_TUTORIAL';

var startTestGame = function () {
    return (dispatch) => {
        var initialGame = {
            "Id": "test",
            "Field": [
                {"Img": "http://cdn.myanimelist.net/images/characters/10/240997.jpg", "Row": 2, "Col": 0},
                {"Img": "http://cdn.myanimelist.net/images/characters/12/292611.jpg", "Row": 2, "Col": 4},
                {"Img": "http://cdn.myanimelist.net/images/characters/6/83657.jpg", "Row": 7, "Col": 4},
                {"Img": "http://cdn.myanimelist.net/images/characters/11/200455.jpg", "Row": 3, "Col": 3},
                {"Img": "http://cdn.myanimelist.net/images/characters/10/103220.jpg", "Row": 4, "Col": 1},
                {"Img": "http://cdn.myanimelist.net/images/characters/3/55714.jpg", "Row": 8, "Col": 0},
                {"Img": "http://cdn.myanimelist.net/images/characters/14/80297.jpg", "Row": 4, "Col": 5}],
            "Height": 9,
            "Width": 9,
            "Line": 3,
            "MaxTitleChar": 5,
            "Turn": 1,
            "Score": {
                "CompletedTitles": [],
                "CompletedGroups": [],
                "TotalScore": -1000,
                "ChangeImgs": [],
                "Advices": []
            },
            "Date": "2016-08-08T22:21:52.819+03:00",
            "EndDate": "2016-08-08T22:21:52.819+03:00",
            "Difficulty": 1,
            "UserName": "",
            "UserItems": []
        };
        dispatch({
            type: GET_GAME_SUCCESS,
            payload: initialGame
        });
        var moves = [];
        var firstMove = {"Path":[[1,5],[1,4],[1,3],[2,3],[2,2],[2,1]],
            "Completed":[[3,3],[2,4],[1,5]],
            "NewChars":[],"NextTurn":2,
            "GameScore":[{"Id":17265,"Title":"Log Horizon","English":"Log Horizon","Turn":5,"Characters":[{"Id":81371,"Name":"Naotsugu","Img":"http://cdn.myanimelist.net/images/characters/11/200455.jpg","Score":1},{"Id":81369,"Name":"Akatsuki","Img":"http://cdn.myanimelist.net/images/characters/12/292611.jpg","Score":2},{"Id":81367,"Name":"Shiroe","Img":"http://cdn.myanimelist.net/images/characters/10/240997.jpg",
                "Score":3}]}]};
        var secondMove = {"Path":[[6,3],[7,3],[8,3],[8,2],[8,1]],
            "Completed":[],"NewChars":[],"NextTurn":3,"GameScore":[]};
        var thirdMove = {"Path":[[5,2],[4,2],[4,3],[4,4]],
            "Completed":[[6,3],[5,2],[4,1],[7,4],[1,4]],"NewChars":[],
            "NextTurn":4,
            "GameScore":[{"Id":2966,"Title":"Ookami to Koushinryou","English":"Spice and Wolf","Turn":7,"Characters":[{"Id":7376,"Name":"Arendt, Norah","Img":"http://cdn.myanimelist.net/images/characters/3/55714.jpg","Score":1},{"Id":24360,"Name":"Liechten, Marhait","Img":"http://cdn.myanimelist.net/images/characters/14/80297.jpg","Score":2},{"Id":7374,"Name":"Lawrence, Kraft","Img":"http://cdn.myanimelist.net/images/characters/10/103220.jpg","Score":3},{"Id":7373,"Name":"Holo","Img":"http://cdn.myanimelist.net/images/characters/6/83657.jpg","Score":4}]}]
        };
        moves.push([{"Row": 2, "Col": 0}, firstMove]);
        moves.push([{"Row": 8, "Col": 0}, secondMove]);
        moves.push([{"Row": 4, "Col": 5}, thirdMove]);
        for(var i = 1; i <= moves.length; i++) {
            setTimeout(((char, data) => {
                moveCallbackFactory(dispatch, char)(data)
            }).bind(this, moves[i-1][0], moves[i-1][1]), 1000*i);
        }

    }
};

var fetchingAdvice = false;
var getAdvice = function (gameId) {
    return (dispatch) => {
        if (!fetchingAdvice) {
            fetchingAdvice = true;
            $.ajax({
                method: "PUT",
                url: '/game?gameId=' + gameId + '&action=advice',
                contentType: 'application/json'
            }).done((data) => {
                fetchingAdvice = false;
                dispatch({
                    type: GET_ADVICE,
                    payload: data
                });
            }).fail((xhr) => {
                fetchingAdvice = false;
                dispatch({
                    type: ERROR,
                    payload: 'Get advice error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
                });
                removeErrorAfter(5000, dispatch);
            });
        }
    }
};

var toggleCreateGame = function () {
    return {
        type: TOGGLE_CREATE_GAME_MENU
    }
};

var startTutorial = function () {
    return {
        type: START_TUTORIAL
    }
};

var endTutorial = function () {
    return {
        type: END_TUTORIAL
    }
};

var removeErrorAfter = function (timeOut, dispatch) {
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
    const {Completed, NewChars, NextTurn, GameScore} = data;
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
var moveSelected = function (gameId, char, Row, Col) {
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

var changeImage = function (gameId, char) {
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

var selectChar = function (char) {
    return {
        type: CHAR_SELECTED,
        payload: char
    }
};

var createGame = function (diff, userName) {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_REQUEST
        });
        $.post({
            'url': '/game',
            'data': JSON.stringify({Diff: diff, UserName: userName}),
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
                    type: GET_GAME_ERROR
                });
                dispatch({
                    type: ERROR,
                    payload: 'Create new game error: ' + (xhr.responseJSON ? xhr.responseJSON['Message'] : '')
                });
                removeErrorAfter(5000, dispatch);
            });
    }
};

var getGame = function (gameId) {
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