var initialTutorialMove = {
    7: {"Path":[[0,6],[0,5],[0,4],[0,3],[1,3],[2,3],[2,2],[2,1]],
        "Completed":[[2,4],[1,5],[0,6]],
        "NewChars":[],"NextTurn":2,
        "GameScore":[{"Id":17265,"Title":"Log Horizon","English":"Log Horizon","Turn":2,"Characters":[{"Id":81371,"Name":"Naotsugu","Img":"http://cdn.myanimelist.net/images/characters/11/200455.jpg","Score":1},{"Id":81369,"Name":"Akatsuki","Img":"http://cdn.myanimelist.net/images/characters/12/292611.jpg","Score":2},{"Id":81367,"Name":"Shiroe","Img":"http://cdn.myanimelist.net/images/characters/10/240997.jpg",
     "Score":3}]}]}
};

var initialTutorial = {
    "Id": "test",
    "Field": [
        {"Img": "http://cdn.myanimelist.net/images/characters/10/240997.jpg", "Row": 2, "Col": 0},
        {"Img": "http://cdn.myanimelist.net/images/characters/12/292611.jpg", "Row": 2, "Col": 4},
        {"Img": "http://cdn.myanimelist.net/images/characters/6/83657.jpg", "Row": 7, "Col": 4},
        {"Img": "http://cdn.myanimelist.net/images/characters/11/200455.jpg", "Row": 1, "Col": 5},
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

var charSelected20 = function (game) {
    for(var field of game.Field) {
        if (field.Row == 2 && field.Col == 0 && field.selected) {
            return true;
        }
    }
    return false;
};

var charNotSelected20 = function (game) {
    for(var field of game.Field) {
        if (field.Row == 2 && field.Col == 0 && !field.selected) {
            return true;
        }
    }
    return false;
};

var charDisapear24 = function (game) {
    for(var field of game.Field) {
        if (field.Row == 2 && field.Col == 4) {
            return false;
        }
    }
    return true;
};

var tutorialStates = {
    1: {
        emotion: "/static/img/emo/tsundere.png", message: <div className="tutorial-msg">
            <p>You can't do anything without me, do you?</p>
            <p>It can't be helped, I'll assist you.</p>
            <p>I didn't do it for YOU or anything!</p>
        </div>, next: {state: 2}
    },
    2: {
        emotion: "/static/img/emo/tsundere.png", message: <div className="tutorial-msg">
            <p>A lot of characters got lost in the Fanservice World.</p>
            <p>To help them find the way home, you should bring together their powers.</p>
        </div>, next: {state: 3}
    },
    3: {
        emotion: "/static/img/emo/tsundere.png", message: <div className="tutorial-msg">
            <p>But only characters knowing each other can get stronger together.</p>
            <p>For that you have to line up characters from same anime in vertical, horizontal or diagonal line.</p>
        </div>, next: {state: 4}
    },
    4: {
        emotion: "/static/img/emo/tsundere.png", message: <div className="tutorial-msg">
            <p>When there are 3 or more characters in a line, they go home taking along all their friends.</p>
            <p>I'll give you points for this just for motivation.</p>
            <p>Let's try by the example.</p>
        </div>, next: {state: 5, game: initialTutorial}
    },
    5: {
        emotion: "/static/img/emo/normal.png", message: <div className="tutorial-msg">
            <p>Look, here is buddies from Log Horizon.</p>
            <p>Let's help them.</p>
        </div>, next: {state: 6}
    },
    6: {
        emotion: "/static/img/emo/normal.png", message: <div className="tutorial-msg">
            <p>Choose Shiroe by clicking him.</p>
        </div>, next: {state: 7}, selected: ['.row2.col0'], hiddenNext: true, nextCondition: {7: charSelected20}
    },
    7: {
        emotion: "/static/img/emo/normal.png", message: <div className="tutorial-msg">
            <p>Now move him to others by clicking on green cell.</p>
        </div>, next: {state: 8}, selected: ['.fieldCell:eq(6)', '#game'], hiddenNext: true, nextCondition: {8: charDisapear24, 20: charNotSelected20}
    },
    8: {
        emotion: "/static/img/emo/success.png", message: <div className="tutorial-msg">
            <p>Perfect! Our heroes went home.</p>
        </div>, next: {state: 9}
    },
    9: {
        emotion: "/static/img/emo/sure.png", message: <div className="tutorial-msg">
            <p>You coped with the training course.</p>
            <p>It couldn't be otherwise since you were trained by me!</p>
        </div>, next: {state: 10}
    },
    10: {
        emotion: "/static/img/emo/sure.png", message: <div className="tutorial-msg">
            <p>Though I think our developer is useless if you find an error, write him - overmes@gmail.com</p>
        </div>, next: {state: 11}
    },
    11: {
        emotion: "/static/img/emo/waityou.png", message: <div className="tutorial-msg">
            <p>We will see each other again, don't we?</p>
        </div>, next: {state: 0}
    },
    20: {
        emotion: "/static/img/emo/panic.png", message: <div className="tutorial-msg">
            <p>B-baka! What are you doing?! Choose Shiroe back!</p>
            <p>Budget lacks for a full explanation.</p>
        </div>, next: {state: 7}, selected: ['.row2.col0'], hiddenNext: true, nextCondition: {7: charSelected20}
    },


};

class Tutorial extends React.Component {
    componentWillReceiveProps(nextProps) {
        const {state, endTutorial, nextTutorial, game} = nextProps;
        if (state) {
            const {emotion, message, next, hiddenNext, nextCondition} = tutorialStates[state];
            if (nextCondition) {
                for(var stateId in nextCondition) {
                    if (nextCondition[stateId](game)) {
                        nextTutorial({state: stateId});
                    }
                }
            }
        }
        if (nextProps.state) {
            if (!this.props.state) {
                $('body').before('<div class="fog-of-war"></div>')
            }
        } else {
            $('.fog-of-war').remove()
        }
    }

    componentDidUpdate() {
        $('.tutorial-selected').removeClass('tutorial-selected');
        if (this.props.state) {
            const selected = tutorialStates[this.props.state].selected;
            if (selected && selected.length) {
                selected.forEach(selector => {
                    $(selector).addClass('tutorial-selected');
                })
            }
        }
    }

    render() {
        const {state, endTutorial, nextTutorial, game} = this.props;
        if (state) {
            const {emotion, message, next, hiddenNext, nextCondition} = tutorialStates[state];
            return <div id="tutorial">
                <img src={emotion} className="tutorial-img"/>
                {message}
                <span className="tutorial-end tutorial-btn btn" onClick={endTutorial}>Close</span>
                {hiddenNext ? '':<span className="tutorial-next tutorial-btn btn" onClick={nextTutorial.bind(null, next)}>Next</span>}
            </div>
        } else {
            return <div style={{"display": "none"}}></div>
        }
    }
}